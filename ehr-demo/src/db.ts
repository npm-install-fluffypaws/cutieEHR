import type {
  EncounterRow,
  Env,
  PatientRow,
  Role,
  SessionUser,
  UserRow,
} from "./types";

export async function findUserByEmail(
  env: Env,
  email: string,
): Promise<UserRow | null> {
  return env.DB.prepare(
    `SELECT id, email, password_hash, role, disabled_at
     FROM users
     WHERE email = ?1`,
  )
    .bind(email.toLowerCase())
    .first<UserRow>();
}

export async function findUserById(
  env: Env,
  userId: string,
): Promise<SessionUser | null> {
  return env.DB.prepare(
    `SELECT id, email, role
     FROM users
     WHERE id = ?1
       AND disabled_at IS NULL`,
  )
    .bind(userId)
    .first<SessionUser>();
}

export async function createSession(
  env: Env,
  sessionId: string,
  userId: string,
  expiresAt: string,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES (?1, ?2, ?3)`,
  )
    .bind(sessionId, userId, expiresAt)
    .run();
}

export async function getSessionUser(
  env: Env,
  sessionId: string,
): Promise<SessionUser | null> {
  return env.DB.prepare(
    `SELECT u.id, u.email, u.role
     FROM sessions AS s
     JOIN users AS u ON u.id = s.user_id
     WHERE s.id = ?1
       AND s.expires_at > CURRENT_TIMESTAMP
       AND u.disabled_at IS NULL`,
  )
    .bind(sessionId)
    .first<SessionUser>();
}

export async function deleteSession(
  env: Env,
  sessionId: string,
): Promise<void> {
  await env.DB.prepare(`DELETE FROM sessions WHERE id = ?1`)
    .bind(sessionId)
    .run();
}

export async function listPatients(env: Env): Promise<PatientRow[]> {
  const result = await env.DB.prepare(
    `SELECT id, medical_record_number, first_name, last_name, date_of_birth,
            phone, address, created_at, updated_at
     FROM patients
     ORDER BY last_name ASC, first_name ASC
     LIMIT 100`,
  ).all<PatientRow>();

  return result.results;
}

export async function getPatient(
  env: Env,
  patientId: string,
): Promise<PatientRow | null> {
  return env.DB.prepare(
    `SELECT id, medical_record_number, first_name, last_name, date_of_birth,
            phone, address, created_at, updated_at
     FROM patients
     WHERE id = ?1`,
  )
    .bind(patientId)
    .first<PatientRow>();
}

export async function listEncounters(
  env: Env,
  patientId: string,
): Promise<EncounterRow[]> {
  const result = await env.DB.prepare(
    `SELECT e.id, e.patient_id, e.clinician_id, u.email AS clinician_email,
            e.occurred_at, e.visit_type, e.note, e.created_at
     FROM encounters AS e
     JOIN users AS u ON u.id = e.clinician_id
     WHERE e.patient_id = ?1
     ORDER BY e.occurred_at DESC`,
  )
    .bind(patientId)
    .all<EncounterRow>();

  return result.results;
}

export async function addEncounter(
  env: Env,
  input: {
    id: string;
    patientId: string;
    clinicianId: string;
    occurredAt: string;
    visitType: string;
    note: string;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO encounters (
      id, patient_id, clinician_id, occurred_at, visit_type, note
    )
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  )
    .bind(
      input.id,
      input.patientId,
      input.clinicianId,
      input.occurredAt,
      input.visitType,
      input.note,
    )
    .run();
}

export async function addAuditEvent(
  env: Env,
  event: {
    id: string;
    actorUserId: string | null;
    action: string;
    resourceType: string;
    resourceId: string | null;
    patientId: string | null;
    success: boolean;
    ipHash: string | null;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO audit_events (
      id, actor_user_id, action, resource_type, resource_id,
      patient_id, success, ip_hash
    )
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
  )
    .bind(
      event.id,
      event.actorUserId,
      event.action,
      event.resourceType,
      event.resourceId,
      event.patientId,
      event.success ? 1 : 0,
      event.ipHash,
    )
    .run();
}

export async function listAuditEvents(env: Env): Promise<
  Array<{
    id: string;
    created_at: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    patient_id: string | null;
    success: number;
    actor_email: string | null;
  }>
> {
  const result = await env.DB.prepare(
    `SELECT a.id, a.created_at, a.action, a.resource_type, a.resource_id,
            a.patient_id, a.success, u.email AS actor_email
     FROM audit_events AS a
     LEFT JOIN users AS u ON u.id = a.actor_user_id
     ORDER BY a.created_at DESC
     LIMIT 200`,
  ).all<{
    id: string;
    created_at: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    patient_id: string | null;
    success: number;
    actor_email: string | null;
  }>();

  return result.results;
}

export function hasRole(
  user: SessionUser,
  allowedRoles: Role[],
): boolean {
  return allowedRoles.includes(user.role);
}