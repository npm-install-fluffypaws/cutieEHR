import {
  audit,
  clearSessionCookie,
  currentUser,
  getSessionId,
  logout,
  makeSessionCookie,
  sessionExpiration,
} from "./auth";
import { createId, createToken, verifyPassword } from "./crypto";
import {
  addEncounter,
  createSession,
  findUserByEmail,
  getPatient,
  hasRole,
  listAuditEvents,
  listEncounters,
  listPatients,
} from "./db";
import { auditPage, loginPage, patientPage, patientsPage } from "./html";
import type { Env, SessionUser } from "./types";
import { getString, isEmail, isUuid } from "./validation";

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; style-src 'self' 'unsafe-inline'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cache-Control": "no-store",
};

function html(body: string, status = 200, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(SECURITY_HEADERS);
  responseHeaders.set("Content-Type", "text/html; charset=UTF-8");

  for (const [key, value] of Object.entries(headers)) {
    responseHeaders.set(key, value);
  }

  return new Response(body, { status, headers: responseHeaders });
}

function redirect(location: string, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(SECURITY_HEADERS);
  responseHeaders.set("Location", location);

  for (const [key, value] of Object.entries(headers)) {
    responseHeaders.set(key, value);
  }

  return new Response(null, { status: 303, headers: responseHeaders });
}

function badRequest(message: string): Response {
  return html(loginPage(message), 400);
}

function forbidden(): Response {
  return html(
    `<h1>Forbidden</h1><p>You do not have permission to access this resource.</p>`,
    403,
  );
}

function notFound(): Response {
  return html(`<h1>Not found</h1><p>The requested page was not found.</p>`, 404);
}

async function requireUser(
  request: Request,
  env: Env,
): Promise<SessionUser | Response> {
  const user = await currentUser(request, env);

  if (!user) {
    return redirect("/");
  }

  return user;
}

function getPatientIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/patients\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getEncounterPatientIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/patients\/([^/]+)\/encounters$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "GET" && pathname === "/") {
      const user = await currentUser(request, env);
      return user ? redirect("/patients") : html(loginPage());
    }

    if (request.method === "POST" && pathname === "/login") {
      const form = await request.formData();
      const emailValue = form.get("email");
      const passwordValue = form.get("password");

      const email =
        typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
      const password = typeof passwordValue === "string" ? passwordValue : "";

      if (!isEmail(email) || password.length < 10 || password.length > 200) {
        return badRequest("Enter a valid email and password.");
      }

      const foundUser = await findUserByEmail(env, email);
      const passwordOk =
        foundUser && !foundUser.disabled_at
          ? await verifyPassword(password, foundUser.password_hash)
          : false;

      if (!foundUser || !passwordOk) {
        await audit(request, env, {
          actorUserId: foundUser?.id ?? null,
          action: "LOGIN",
          resourceType: "session",
          success: false,
        });

        return html(loginPage("Invalid email or password."), 401);
      }

      const sessionId = createToken();

      await createSession(env, sessionId, foundUser.id, sessionExpiration());

      await audit(request, env, {
        actorUserId: foundUser.id,
        action: "LOGIN",
        resourceType: "session",
        resourceId: sessionId,
        success: true,
      });

      return redirect("/patients", {
        "Set-Cookie": makeSessionCookie(sessionId),
      });
    }

    if (request.method === "POST" && pathname === "/logout") {
      const user = await currentUser(request, env);

      if (user) {
        await audit(request, env, {
          actorUserId: user.id,
          action: "LOGOUT",
          resourceType: "session",
          resourceId: getSessionId(request),
          success: true,
        });
      }

      await logout(request, env);

      return redirect("/", {
        "Set-Cookie": clearSessionCookie(),
      });
    }

    if (request.method === "GET" && pathname === "/patients") {
      const user = await requireUser(request, env);

      if (user instanceof Response) {
        return user;
      }

      const patients = await listPatients(env);

      await audit(request, env, {
        actorUserId: user.id,
        action: "LIST_PATIENTS",
        resourceType: "patient",
        success: true,
      });

      return html(patientsPage({ user, patients }));
    }

    if (request.method === "GET" && pathname === "/audit") {
      const user = await requireUser(request, env);

      if (user instanceof Response) {
        return user;
      }

      if (!hasRole(user, ["admin"])) {
        await audit(request, env, {
          actorUserId: user.id,
          action: "VIEW_AUDIT_LOG",
          resourceType: "audit_event",
          success: false,
        });

        return forbidden();
      }

      const events = await listAuditEvents(env);

      await audit(request, env, {
        actorUserId: user.id,
        action: "VIEW_AUDIT_LOG",
        resourceType: "audit_event",
        success: true,
      });

      return html(auditPage({ user, events }));
    }

    if (request.method === "GET") {
      const patientId = getPatientIdFromPath(pathname);

      if (patientId) {
        const user = await requireUser(request, env);

        if (user instanceof Response) {
          return user;
        }

        if (!isUuid(patientId)) {
          return notFound();
        }

        const patient = await getPatient(env, patientId);

        if (!patient) {
          await audit(request, env, {
            actorUserId: user.id,
            action: "VIEW_PATIENT",
            resourceType: "patient",
            resourceId: patientId,
            patientId,
            success: false,
          });

          return notFound();
        }

        const encounters =
          user.role === "front_desk" ? [] : await listEncounters(env, patientId);

        await audit(request, env, {
          actorUserId: user.id,
          action: "VIEW_PATIENT",
          resourceType: "patient",
          resourceId: patientId,
          patientId,
          success: true,
        });

        const saved = url.searchParams.get("saved") === "1";

        return html(
          patientPage({
            user,
            patient,
            encounters,
            message: saved ? "Fictional encounter note saved." : undefined,
          }),
        );
      }
    }

    if (request.method === "POST") {
      const patientId = getEncounterPatientIdFromPath(pathname);

      if (patientId) {
        const user = await requireUser(request, env);

        if (user instanceof Response) {
          return user;
        }

        if (!hasRole(user, ["admin", "clinician"])) {
          await audit(request, env, {
            actorUserId: user.id,
            action: "CREATE_ENCOUNTER",
            resourceType: "encounter",
            patientId,
            success: false,
          });

          return forbidden();
        }

        if (!isUuid(patientId)) {
          return notFound();
        }

        const patient = await getPatient(env, patientId);

        if (!patient) {
          return notFound();
        }

        const form = await request.formData();
        const body = Object.fromEntries(form.entries());

        const occurredAt = getString(body, "occurredAt", 40);
        const visitType = getString(body, "visitType", 100);
        const note = getString(body, "note", 5000);

        const allowedVisitTypes = new Set([
          "Demo follow-up",
          "Demo wellness visit",
          "Demo consultation",
        ]);

        if (
          !occurredAt ||
          Number.isNaN(Date.parse(occurredAt)) ||
          !visitType ||
          !allowedVisitTypes.has(visitType) ||
          !note
        ) {
          await audit(request, env, {
            actorUserId: user.id,
            action: "CREATE_ENCOUNTER",
            resourceType: "encounter",
            patientId,
            success: false,
          });

          return html(
            patientPage({
              user,
              patient,
              encounters: await listEncounters(env, patientId),
              message: "Unable to save the fictional note. Check the form fields.",
            }),
            400,
          );
        }

        const encounterId = createId();

        await addEncounter(env, {
          id: encounterId,
          patientId,
          clinicianId: user.id,
          occurredAt: new Date(occurredAt).toISOString(),
          visitType,
          note,
        });

        await audit(request, env, {
          actorUserId: user.id,
          action: "CREATE_ENCOUNTER",
          resourceType: "encounter",
          resourceId: encounterId,
          patientId,
          success: true,
        });

        return redirect(`/patients/${encodeURIComponent(patientId)}?saved=1`);
      }
    }

    return notFound();
  },
} satisfies ExportedHandler<Env>;