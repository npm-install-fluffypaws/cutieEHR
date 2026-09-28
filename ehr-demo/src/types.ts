export type Role = "admin" | "clinician" | "front_desk";

export interface Env {
  DB: D1Database;
}

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  disabled_at: string | null;
}

export interface PatientRow {
  id: string;
  medical_record_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface EncounterRow {
  id: string;
  patient_id: string;
  clinician_id: string;
  clinician_email: string;
  occurred_at: string;
  visit_type: string;
  note: string;
  created_at: string;
}