import { escapeHtml } from "./validation";

function layout(title: string, content: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | EHR Demo</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Arial, Helvetica, sans-serif;
      background: #f4f7fb;
      color: #172033;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      line-height: 1.45;
    }

    header {
      background: #12355b;
      color: white;
      padding: 1rem;
    }

    header a {
      color: white;
      text-decoration: none;
    }

    main {
      width: min(1080px, calc(100% - 2rem));
      margin: 2rem auto;
    }

    .card {
      background: white;
      border: 1px solid #d8e1ee;
      border-radius: 10px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(18, 53, 91, 0.06);
    }

    .notice {
      background: #fff7da;
      border: 1px solid #e4bf42;
      border-radius: 8px;
      padding: 0.8rem;
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-weight: bold;
      margin-top: 0.8rem;
      margin-bottom: 0.25rem;
    }

    input, textarea, select, button {
      font: inherit;
      width: 100%;
      padding: 0.65rem;
      border: 1px solid #aebccc;
      border-radius: 6px;
    }

    textarea { min-height: 130px; resize: vertical; }

    button {
      cursor: pointer;
      margin-top: 1rem;
      border: none;
      background: #0d6e52;
      color: white;
      font-weight: bold;
    }

    button:hover { background: #09553f; }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    th, td {
      border-bottom: 1px solid #d8e1ee;
      padding: 0.75rem;
      text-align: left;
      vertical-align: top;
    }

    th { background: #edf3f9; }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav form { margin: 0; }
    .nav button { width: auto; margin: 0; background: transparent; padding: 0; }
    .muted { color: #5b6575; }
    .error { color: #a51d2d; font-weight: bold; }
    .success { color: #0d6e52; font-weight: bold; }
    .note { white-space: pre-wrap; }
    .small { font-size: 0.9rem; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

export function loginPage(error?: string): string {
  const errorHtml = error
    ? `<p class="error">${escapeHtml(error)}</p>`
    : "";

  return layout(
    "Sign in",
    `<header><strong>EHR Demo</strong></header>
<main>
  <div class="notice">
    <strong>Synthetic demo only.</strong>
    Do not enter real patient data, private health information, or actual credentials.
  </div>

  <section class="card" style="max-width: 480px; margin: 0 auto;">
    <h1>Sign in</h1>
    ${errorHtml}
    <form method="post" action="/login">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required maxlength="254">

      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required minlength="10" maxlength="200">

      <button type="submit">Sign in</button>
    </form>
  </section>
</main>`,
  );
}

export function patientsPage(input: {
  user: { email: string; role: string };
  patients: Array<{
    id: string;
    medical_record_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  }>;
}): string {
  const rows = input.patients
    .map(
      (patient) => `<tr>
<td>${escapeHtml(patient.medical_record_number)}</td>
<td>
  <a href="/patients/${encodeURIComponent(patient.id)}">
    ${escapeHtml(patient.last_name)}, ${escapeHtml(patient.first_name)}
  </a>
</td>
<td>${escapeHtml(patient.date_of_birth)}</td>
</tr>`,
    )
    .join("");

  const auditLink =
    input.user.role === "admin"
      ? `<a href="/audit">Audit log</a>`
      : "";

  return layout(
    "Patients",
    `<header>
  <div class="topbar">
    <a href="/patients"><strong>EHR Demo</strong></a>
    <div class="nav">
      <span>${escapeHtml(input.user.email)} (${escapeHtml(input.user.role)})</span>
      ${auditLink}
      <form method="post" action="/logout">
        <button type="submit">Sign out</button>
      </form>
    </div>
  </div>
</header>
<main>
  <div class="notice">
    <strong>Synthetic demo only.</strong> Every record below is fictional.
  </div>

  <section class="card">
    <h1>Patients</h1>
    <p class="muted">Showing up to 100 fictional records.</p>
    <table>
      <thead>
        <tr>
          <th>MRN</th>
          <th>Name</th>
          <th>Date of birth</th>
        </tr>
      </thead>
      <tbody>
        ${rows || "<tr><td colspan=\"3\">No patients found.</td></tr>"}
      </tbody>
    </table>
  </section>
</main>`,
  );
}

export function patientPage(input: {
  user: { email: string; role: string };
  patient: {
    id: string;
    medical_record_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    phone: string | null;
    address: string | null;
  };
  encounters: Array<{
    clinician_email: string;
    occurred_at: string;
    visit_type: string;
    note: string;
  }>;
  message?: string;
}): string {
  const canReadNotes = input.user.role !== "front_desk";
  const canCreateNotes = input.user.role === "clinician" || input.user.role === "admin";

  const messageHtml = input.message
    ? `<p class="success">${escapeHtml(input.message)}</p>`
    : "";

  const encountersHtml = canReadNotes
    ? input.encounters.length > 0
      ? input.encounters
          .map(
            (encounter) => `<article class="card">
<h3>${escapeHtml(encounter.visit_type)} — ${escapeHtml(encounter.occurred_at)}</h3>
<p class="small muted">Recorded by ${escapeHtml(encounter.clinician_email)}</p>
<p class="note">${escapeHtml(encounter.note)}</p>
</article>`,
          )
          .join("")
      : `<p class="muted">No fictional encounter notes exist for this patient.</p>`
    : `<p class="muted">Your role may view demographics but not clinical notes.</p>`;

  const encounterForm = canCreateNotes
    ? `<section class="card">
<h2>Add fictional encounter note</h2>
<p class="small muted">Do not enter real health information.</p>
<form method="post" action="/patients/${encodeURIComponent(input.patient.id)}/encounters">
  <label for="occurredAt">Encounter time</label>
  <input id="occurredAt" name="occurredAt" type="datetime-local" required>

  <label for="visitType">Visit type</label>
  <select id="visitType" name="visitType" required>
    <option value="Demo follow-up">Demo follow-up</option>
    <option value="Demo wellness visit">Demo wellness visit</option>
    <option value="Demo consultation">Demo consultation</option>
  </select>

  <label for="note">Note</label>
  <textarea id="note" name="note" required maxlength="5000" placeholder="Synthetic demo note only"></textarea>

  <button type="submit">Save fictional note</button>
</form>
</section>`
    : "";

  return layout(
    `${input.patient.first_name} ${input.patient.last_name}`,
    `<header>
  <div class="topbar">
    <a href="/patients"><strong>EHR Demo</strong></a>
    <div class="nav">
      <span>${escapeHtml(input.user.email)} (${escapeHtml(input.user.role)})</span>
      <form method="post" action="/logout">
        <button type="submit">Sign out</button>
      </form>
    </div>
  </div>
</header>
<main>
  <p><a href="/patients">← Back to patient list</a></p>
  <div class="notice">
    <strong>Synthetic demo only.</strong> This patient is fictional.
  </div>

  <section class="card">
    <h1>${escapeHtml(input.patient.first_name)} ${escapeHtml(input.patient.last_name)}</h1>
    ${messageHtml}
    <table>
      <tbody>
        <tr><th>Medical record number</th><td>${escapeHtml(input.patient.medical_record_number)}</td></tr>
        <tr><th>Date of birth</th><td>${escapeHtml(input.patient.date_of_birth)}</td></tr>
        <tr><th>Phone</th><td>${escapeHtml(input.patient.phone ?? "Not provided")}</td></tr>
        <tr><th>Address</th><td>${escapeHtml(input.patient.address ?? "Not provided")}</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Encounter notes</h2>
    ${encountersHtml}
  </section>

  ${encounterForm}
</main>`,
  );
}

export function auditPage(input: {
  user: { email: string; role: string };
  events: Array<{
    created_at: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    patient_id: string | null;
    success: number;
    actor_email: string | null;
  }>;
}): string {
  const rows = input.events
    .map(
      (event) => `<tr>
<td>${escapeHtml(event.created_at)}</td>
<td>${escapeHtml(event.actor_email ?? "Unknown or deleted user")}</td>
<td>${escapeHtml(event.action)}</td>
<td>${escapeHtml(event.resource_type)}</td>
<td>${escapeHtml(event.patient_id ?? "—")}</td>
<td>${event.success ? "Success" : "Failed"}</td>
</tr>`,
    )
    .join("");

  return layout(
    "Audit log",
    `<header>
  <div class="topbar">
    <a href="/patients"><strong>EHR Demo</strong></a>
    <div class="nav">
      <span>${escapeHtml(input.user.email)} (${escapeHtml(input.user.role)})</span>
      <form method="post" action="/logout">
        <button type="submit">Sign out</button>
      </form>
    </div>
  </div>
</header>
<main>
  <div class="notice">
    <strong>Synthetic demo only.</strong> Audit records are included to teach accountability and access tracking.
  </div>

  <section class="card">
    <h1>Audit log</h1>
    <p class="muted">Most recent 200 events.</p>
    <table>
      <thead>
        <tr>
          <th>When</th>
          <th>Actor</th>
          <th>Action</th>
          <th>Resource</th>
          <th>Patient ID</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${rows || "<tr><td colspan=\"6\">No events yet.</td></tr>"}
      </tbody>
    </table>
  </section>
</main>`,
  );
}