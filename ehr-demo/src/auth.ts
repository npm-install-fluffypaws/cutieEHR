import {
  addAuditEvent,
  createSession,
  deleteSession,
  getSessionUser,
} from "./db";
import { createId, sha256 } from "./crypto";
import type { Env, SessionUser } from "./types";

const SESSION_COOKIE_NAME = "ehr_demo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get("Cookie") ?? "";
  const cookies: Record<string, string> = {};

  for (const part of header.split(";")) {
    const index = part.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    if (key) {
      cookies[key] = value;
    }
  }

  return cookies;
}

export function getSessionId(request: Request): string | null {
  const cookies = parseCookies(request);
  return cookies[SESSION_COOKIE_NAME] ?? null;
}

export function makeSessionCookie(sessionId: string): string {
  return [
    `${SESSION_COOKIE_NAME}=${sessionId}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ].join("; ");
}

export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

export function sessionExpiration(): string {
  const expiration = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  return expiration.toISOString().replace("T", " ").replace("Z", "");
}

export async function currentUser(
  request: Request,
  env: Env,
): Promise<SessionUser | null> {
  const sessionId = getSessionId(request);

  if (!sessionId) {
    return null;
  }

  return getSessionUser(env, sessionId);
}

export async function audit(
  request: Request,
  env: Env,
  input: {
    actorUserId: string | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    patientId?: string | null;
    success: boolean;
  },
): Promise<void> {
  const ip = request.headers.get("CF-Connecting-IP");

  await addAuditEvent(env, {
    id: createId(),
    actorUserId: input.actorUserId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId ?? null,
    patientId: input.patientId ?? null,
    success: input.success,
    ipHash: ip ? await sha256(ip) : null,
  });
}

export async function logout(
  request: Request,
  env: Env,
): Promise<void> {
  const sessionId = getSessionId(request);

  if (sessionId) {
    await deleteSession(env, sessionId);
  }
}