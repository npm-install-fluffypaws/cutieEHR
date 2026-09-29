import { escapeHtml } from "./validation";

function layout(title: string, content: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | CutieEHR Demo</title>

  <style>
    :root {
      --navy: #12365b;
      --navy-dark: #0b2743;
      --blue: #1769aa;
      --blue-pale: #eaf4fc;
      --line: #cbd5df;
      --panel: #ffffff;
      --page: #edf1f5;
      --text: #17212b;
      --muted: #5e6976;
      --warning-bg: #fff4d4;
      --warning-line: #e8bd51;
      --danger-bg: #ffe5e7;
      --danger: #9e2631;
      --success: #166846;
      --sidebar-width: 285px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background: var(--page);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.4;
    }

    a {
      color: #0b5b9e;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 20;
      min-height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      color: white;
      background: var(--navy-dark);
      border-bottom: 3px solid #0d6e52;
    }

    .brand {
      color: white;
      text-decoration: none;
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.01em;
    }

    .brand small {
      display: block;
      margin-top: 0.05rem;
      color: #b9d2e7;
      font-size: 0.72rem;
      font-weight: 400;
    }

    .header-actions,
    .header-user {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex-wrap: wrap;
    }

    .header-user {
      color: #dcebf8;
      font-size: 0.85rem;
    }

    .header-link {
      color: white;
      font-size: 0.9rem;
      text-decoration: none;
    }

    .header-link:hover {
      text-decoration: underline;
    }

    .logout-form {
      margin: 0;
    }

    .logout-button {
      width: auto;
      margin: 0;
      padding: 0.45rem 0.7rem;
      border: 1px solid #88a8c5;
      border-radius: 4px;
      color: white;
      background: transparent;
      cursor: pointer;
      font: inherit;
    }

    .logout-button:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .shell {
      display: grid;
      grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
      min-height: calc(100vh - 58px);
    }

    .sidebar {
      background: #f8fafc;
      border-right: 1px solid var(--line);
    }

    .sidebar-heading {
      padding: 1rem 1rem 0.75rem;
      color: #33475b;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--line);
    }

    .patient-navigation {
      display: block;
    }

    .patient-nav-item {
      display: block;
      padding: 0.85rem 1rem;
      color: var(--text);
      text-decoration: none;
      border-bottom: 1px solid #dbe3eb;
      border-left: 4px solid transparent;
    }

    .patient-nav-item:hover {
      background: #edf5fb;
    }

    .patient-nav-item.active {
      background: var(--blue-pale);
      border-left-color: #1574bb;
    }

    .patient-nav-name {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .patient-status-dot {
      width: 8px;
      height: 8px;
      flex: 0 0 8px;
      border-radius: 50%;
      background: #16825c;
    }

    .patient-nav-meta {
      display: block;
      margin-top: 0.22rem;
      margin-left: 1.05rem;
      color: var(--muted);
      font-size: 0.78rem;
    }

    .main-content {
      min-width: 0;
      padding: 1rem;
    }

    .patient-banner {
      color: white;
      background: linear-gradient(115deg, #165f9b, #104a7a);
      border-radius: 7px 7px 0 0;
      padding: 1.1rem 1.25rem;
    }

    .patient-banner-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .patient-name {
      margin: 0;
      font-size: clamp(1.35rem, 3vw, 1.85rem);
      line-height: 1.1;
    }

    .patient-identifiers {
      margin: 0.4rem 0 0;
      color: #e3f1fc;
      font-size: 0.9rem;
    }

    .demo-record-label {
      padding: 0.35rem 0.55rem;
      border: 1px solid #a9d0ee;
      border-radius: 3px;
      color: #e8f6ff;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    .warning-strip {
      padding: 0.65rem 1rem;
      color: #684700;
      background: var(--warning-bg);
      border-right: 1px solid var(--warning-line);
      border-bottom: 1px solid var(--warning-line);
      border-left: 1px solid var(--warning-line);
      font-size: 0.88rem;
    }

        .clinical-strip {
      overflow: hidden;
      border-right: 1px solid var(--line);
      border-left: 1px solid var(--line);
      background: white;
    }

    .clinical-strip-row {
      display: grid;
      grid-template-columns: 145px minmax(0, 1fr);
      min-height: 33px;
      border-bottom: 1px solid #d6dfe7;
    }

    .clinical-strip-row:last-child {
      border-bottom: 0;
    }

    .clinical-strip-label {
      display: flex;
      align-items: center;
      padding: 0.45rem 0.75rem;
      color: #40566b;
      background: #edf4fa;
      border-right: 1px solid #d6dfe7;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .clinical-strip-content {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      padding: 0.35rem 0.7rem;
      font-size: 0.84rem;
    }

    .clinical-token {
      display: inline-flex;
      align-items: center;
      min-height: 23px;
      padding: 0.16rem 0.5rem;
      border: 1px solid #d2a947;
      border-radius: 999px;
      color: #664600;
      background: #fff6d8;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .clinical-token.alert {
      border-color: #d99435;
      color: #774100;
            background: #fff0d8;
    }

    .clinical-token.problem {
      border-color: #8ba9c3;
      color: #234c70;
      background: #edf7ff;
    }

    .clinical-token.demo {
      border-color: #b7a6dd;
      color: #563c87;
      background: #f3edff;
    }

    .clinical-empty {
      color: var(--muted);
      font-size: 0.82rem;
    }

    @media (max-width: 560px) {
      .clinical-strip-row {
        display: block;
      }

      .clinical-strip-label {
        border-right: 0;
        border-bottom: 1px solid #d6dfe7;
      }
    }

    .patient-tabs {
      display: flex;
      overflow-x: auto;
      background: white;
      border: 1px solid var(--line);
      border-top: 0;
    }

    .patient-tab {
      display: inline-block;
      padding: 0.75rem 1rem;
      color: #243749;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      border-right: 1px solid #dbe3eb;
    }

    .patient-tab.active {
      color: #0b5b9e;
      background: #f5faff;
      border-top: 3px solid #1674ba;
      padding-top: calc(0.75rem - 3px);
    }

    .content-panel {
      padding: 1.1rem;
      background: white;
      border: 1px solid var(--line);
      border-top: 0;
      border-radius: 0 0 7px 7px;
    }

    .section-title {
      margin: 0 0 0.75rem;
      color: #263c51;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .summary-card {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--panel);
    }

    .summary-card-header {
      padding: 0.65rem 0.8rem;
      color: #29445d;
      background: #edf4fa;
      border-bottom: 1px solid var(--line);
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .summary-card-body {
      padding: 0.8rem;
    }

    .facts {
      display: grid;
      grid-template-columns: minmax(130px, 0.8fr) minmax(0, 1.4fr);
      gap: 0;
      margin: 0;
    }

    .facts dt,
    .facts dd {
      margin: 0;
      padding: 0.55rem 0;
      border-bottom: 1px solid #e4ebf1;
      font-size: 0.9rem;
    }

    .facts dt {
      color: var(--muted);
      font-weight: 700;
    }

    .facts dd {
      overflow-wrap: anywhere;
    }

    .facts dt:last-of-type,
    .facts dd:last-of-type {
      border-bottom: 0;
    }

    .section-divider {
      margin: 1.25rem 0;
      border: 0;
      border-top: 1px solid var(--line);
    }

    .section-heading-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.7rem;
    }

    .section-heading-row h2 {
      margin: 0;
      color: #263c51;
      font-size: 1.1rem;
    }

    .pill {
      display: inline-block;
      padding: 0.28rem 0.48rem;
      border: 1px solid #99b8d1;
      border-radius: 99px;
      color: #195d8d;
      background: #edf7ff;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .encounter-card {
      margin-bottom: 0.75rem;
      border: 1px solid var(--line);
      border-left: 5px solid #2e7db9;
      border-radius: 5px;
      background: #fff;
    }

    .encounter-header {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding: 0.75rem 0.85rem;
      background: #f5f9fc;
      border-bottom: 1px solid #dce6ee;
    }

    .encounter-header h3 {
      margin: 0;
      font-size: 0.97rem;
    }

    .encounter-meta {
      color: var(--muted);
      font-size: 0.8rem;
    }

    .encounter-note {
      margin: 0;
      padding: 0.85rem;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .note-permission {
      padding: 0.8rem;
      border-left: 4px solid #8298ab;
      color: #465869;
      background: #f3f6f8;
    }

    .form-card {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid #b7cedf;
      border-radius: 6px;
      background: #f7fbfe;
    }

    .form-card h2 {
      margin-top: 0;
      font-size: 1.05rem;
    }

    label {
      display: block;
      margin: 0.8rem 0 0.25rem;
      color: #263c51;
      font-weight: 700;
      font-size: 0.9rem;
    }

    input,
    select,
    textarea,
    button {
      font: inherit;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 0.62rem;
      color: var(--text);
      border: 1px solid #9db0c0;
      border-radius: 4px;
      background: white;
    }

    textarea {
      min-height: 145px;
      resize: vertical;
    }

    .primary-button {
      width: auto;
      margin-top: 1rem;
      padding: 0.62rem 0.9rem;
      border: 0;
      border-radius: 4px;
      color: white;
      background: #0d6e52;
      cursor: pointer;
      font-weight: 700;
    }

    .primary-button:hover {
      background: #09513d;
    }

    .empty-state {
      padding: 1rem;
      color: var(--muted);
      border: 1px dashed #afc0ce;
      border-radius: 5px;
      background: #f8fafc;
    }

    .success-message {
      margin: 0 0 1rem;
      padding: 0.7rem 0.8rem;
      color: var(--success);
      border: 1px solid #8bc7aa;
      border-radius: 4px;
      background: #eaf8f0;
      font-weight: 700;
    }

    .error-message {
      margin: 0 0 1rem;
      padding: 0.7rem 0.8rem;
      color: var(--danger);
      border: 1px solid #e5a6ab;
      border-radius: 4px;
      background: var(--danger-bg);
      font-weight: 700;
    }

    .login-page {
      display: grid;
      min-height: 100vh;
      place-items: center;
      padding: 1rem;
      background: linear-gradient(145deg, #0e385f, #ecf3f9);
    }

    .login-card {
      width: min(450px, 100%);
      overflow: hidden;
      background: white;
      border: 1px solid #b5c5d5;
      border-radius: 8px;
      box-shadow: 0 12px 35px rgba(0, 31, 58, 0.25);
    }

    .login-card-header {
      padding: 1.1rem 1.2rem;
      color: white;
      background: var(--navy);
    }

    .login-card-header h1 {
      margin: 0;
      font-size: 1.35rem;
    }

    .login-card-header p {
      margin: 0.3rem 0 0;
      color: #cbe0f1;
      font-size: 0.82rem;
    }

    .login-card-body {
      padding: 1.2rem;
    }

    .login-warning {
      margin-bottom: 1rem;
      padding: 0.7rem;
      border-left: 4px solid #d09a16;
      color: #684700;
      background: var(--warning-bg);
      font-size: 0.85rem;
    }

    .patient-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid var(--line);
    }

    .patient-table th,
    .patient-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #dce5ed;
    }

    .patient-table th {
      color: #41566b;
      background: #edf4fa;
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .patient-table tr:last-child td {
      border-bottom: 0;
    }

    .patient-table a {
      font-weight: 700;
      text-decoration: none;
    }

    .patient-table a:hover {
      text-decoration: underline;
    }

    .audit-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
    }

    .audit-table {
      min-width: 820px;
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .audit-table th,
    .audit-table td {
      padding: 0.7rem;
      text-align: left;
      border-bottom: 1px solid #dce5ed;
      font-size: 0.85rem;
    }

    .audit-table th {
      background: #edf4fa;
    }

    @media (max-width: 800px) {
      .shell {
        display: block;
      }

      .sidebar {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .patient-navigation {
        display: flex;
        overflow-x: auto;
      }

      .patient-nav-item {
        min-width: 190px;
        border-bottom: 0;
        border-right: 1px solid #dbe3eb;
        border-left: 0;
      }

      .patient-nav-item.active {
        border-bottom: 4px solid #1574bb;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 560px) {
      .app-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .main-content {
        padding: 0.65rem;
      }

      .patient-banner {
        padding: 0.9rem;
      }

      .content-panel {
        padding: 0.8rem;
      }

      .facts {
        grid-template-columns: 1fr;
      }

      .facts dt {
        padding-bottom: 0.1rem;
        border-bottom: 0;
      }

      .facts dd {
        padding-top: 0.1rem;
      }

      .patient-table {
        min-width: 620px;
      }

      .table-scroll {
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

function appHeader(input: {
  email: string;
  role: string;
  showAudit?: boolean;
}): string {
  const auditLink = input.showAudit
    ? `<a class="header-link" href="/audit">Audit log</a>`
    : "";

  return `<header class="app-header">
  <a class="brand" href="/patients">
    CutieEHR
    <small>Synthetic training record system</small>
  </a>

  <div class="header-actions">
    ${auditLink}
    <div class="header-user">
      <span>${escapeHtml(input.email)}</span>
      <span class="pill">${escapeHtml(input.role)}</span>
    </div>
    <form class="logout-form" method="post" action="/logout">
      <button class="logout-button" type="submit">Sign out</button>
    </form>
  </div>
</header>`;
}

function sidebar(
  patients: Array<{
    id: string;
    medical_record_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  }>,
  selectedPatientId?: string,
): string {
  const patientLinks = patients
    .map((patient) => {
      const selected = patient.id === selectedPatientId ? " active" : "";

      return `<a class="patient-nav-item${selected}" href="/patients/${encodeURIComponent(patient.id)}">
  <span class="patient-nav-name">
    <span class="patient-status-dot"></span>
    ${escapeHtml(patient.last_name)}, ${escapeHtml(patient.first_name)}
  </span>
  <span class="patient-nav-meta">
    ${escapeHtml(patient.medical_record_number)} · DOB ${escapeHtml(patient.date_of_birth)}
  </span>
</a>`;
    })
    .join("");

  return `<aside class="sidebar">
  <div class="sidebar-heading">Fictional patients</div>
  <nav class="patient-navigation" aria-label="Patient navigation">
    ${patientLinks || `<div class="patient-nav-item">No fictional patients found.</div>`}
  </nav>
</aside>`;
}

export function loginPage(error?: string): string {
  const errorHtml = error
    ? `<p class="error-message">${escapeHtml(error)}</p>`
    : "";

  return layout(
    "Sign in",
    `<main class="login-page">
  <section class="login-card" aria-labelledby="login-heading">
    <div class="login-card-header">
      <h1 id="login-heading">CutieEHR Demo</h1>
      <p>Secure sign-in for a synthetic training environment</p>
    </div>

    <div class="login-card-body">
      <div class="login-warning">
        <strong>Synthetic demo only.</strong> Do not enter real patient records,
        personal information, health information, or real passwords.
      </div>

      ${errorHtml}

      <form method="post" action="/login">
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="username" required maxlength="254">

        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required minlength="10" maxlength="200">

        <button class="primary-button" type="submit">Sign in</button>
      </form>
    </div>
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
<td><a href="/patients/${encodeURIComponent(patient.id)}">Open chart</a></td>
</tr>`,
    )
    .join("");

  return layout(
    "Patients",
    `${appHeader({
      email: input.user.email,
      role: input.user.role,
      showAudit: input.user.role === "admin",
    })}

<div class="shell">
  ${sidebar(input.patients)}

  <main class="main-content">
    <section class="patient-banner">
      <div class="patient-banner-top">
        <div>
          <h1 class="patient-name">Patient workspace</h1>
          <p class="patient-identifiers">
            Select a fictional patient from the left navigation to open a chart.
          </p>
        </div>
        <span class="demo-record-label">DEMO ENVIRONMENT</span>
      </div>
    </section>

    <div class="warning-strip">
      <strong>Training data only:</strong> all patients and records in this app are fictional.
    </div>

    <section class="content-panel">
      <div class="section-heading-row">
        <h2>All fictional patients</h2>
        <span class="pill">${input.patients.length} records</span>
      </div>

      <div class="table-scroll">
        <table class="patient-table">
          <thead>
            <tr>
              <th>MRN</th>
              <th>Patient</th>
              <th>Date of birth</th>
              <th>Chart</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="4">No fictional patients found.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</div>`,
  );
}

function clinicalContextStrip(): string {
  return `<section class="clinical-strip" aria-label="Fictional clinical context">
  <div class="clinical-strip-row">
    <div class="clinical-strip-label">Allergies</div>
    <div class="clinical-strip-content">
      <span class="clinical-token demo">Demo: no known allergies recorded</span>
    </div>
  </div>

  <div class="clinical-strip-row">
    <div class="clinical-strip-label">Pinned alerts</div>
    <div class="clinical-strip-content">
      <span class="clinical-token alert">Synthetic training record</span>
      <span class="clinical-token alert">Not for clinical use</span>
    </div>
  </div>

  <div class="clinical-strip-row">
    <div class="clinical-strip-label">Active problems</div>
    <div class="clinical-strip-content">
      <span class="clinical-token problem">Demo example problem</span>
      <span class="clinical-token problem">Training-only placeholder</span>
    </div>
  </div>
</section>`;
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
  patients?: Array<{
    id: string;
    medical_record_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  }>;
  encounters: Array<{
    clinician_email: string;
    occurred_at: string;
    visit_type: string;
    note: string;
  }>;
  message?: string;
}): string {
  const canReadNotes = input.user.role !== "front_desk";
  const canCreateNotes =
    input.user.role === "clinician" || input.user.role === "admin";

  const encountersHtml = canReadNotes
    ? input.encounters.length > 0
      ? input.encounters
          .map(
            (encounter) => `<article class="encounter-card">
  <div class="encounter-header">
    <h3>${escapeHtml(encounter.visit_type)}</h3>
    <span class="encounter-meta">${escapeHtml(encounter.occurred_at)}</span>
  </div>
  <p class="encounter-meta" style="padding: 0.65rem 0.85rem 0; margin: 0;">
    Recorded by ${escapeHtml(encounter.clinician_email)}
  </p>
  <p class="encounter-note">${escapeHtml(encounter.note)}</p>
</article>`,
          )
          .join("")
      : `<div class="empty-state">No fictional encounter notes have been added for this patient.</div>`
    : `<div class="note-permission">
  Your front-desk role can view demographics, but not clinical encounter notes.
</div>`;

  const messageHtml = input.message
    ? `<p class="success-message">${escapeHtml(input.message)}</p>`
    : "";

  const encounterForm = canCreateNotes
    ? `<section class="form-card">
  <h2>Add fictional encounter note</h2>
  <p class="encounter-meta">
    Use synthetic training content only. Never enter actual patient information.
  </p>

  <form method="post" action="/patients/${encodeURIComponent(input.patient.id)}/encounters">
    <label for="occurredAt">Encounter time</label>
    <input id="occurredAt" name="occurredAt" type="datetime-local" required>

    <label for="visitType">Visit type</label>
    <select id="visitType" name="visitType" required>
      <option value="Demo follow-up">Demo follow-up</option>
      <option value="Demo wellness visit">Demo wellness visit</option>
      <option value="Demo consultation">Demo consultation</option>
    </select>

    <label for="note">Fictional clinical note</label>
    <textarea
      id="note"
      name="note"
      required
      maxlength="5000"
      placeholder="Synthetic training note only"
    ></textarea>

    <button class="primary-button" type="submit">Save fictional note</button>
  </form>
</section>`
    : "";

  return layout(
    `${input.patient.first_name} ${input.patient.last_name}`,
    `${appHeader({
      email: input.user.email,
      role: input.user.role,
      showAudit: input.user.role === "admin",
    })}

<div class="shell">
  ${sidebar(input.patients ?? [], input.patient.id)}

  <main class="main-content">
    <section class="patient-banner">
      <div class="patient-banner-top">
        <div>
          <h1 class="patient-name">
            ${escapeHtml(input.patient.last_name)}, ${escapeHtml(input.patient.first_name)}
          </h1>
          <p class="patient-identifiers">
            MRN ${escapeHtml(input.patient.medical_record_number)}
            · Date of birth ${escapeHtml(input.patient.date_of_birth)}
          </p>
        </div>
        <span class="demo-record-label">FICTIONAL RECORD</span>
      </div>
    </section>

    <div class="warning-strip">
      <strong>Synthetic record:</strong> this chart is for UI and security training only.
        Do not use it for healthcare decisions or real patient information.
    </div>

    ${clinicalContextStrip()}

    <nav class="patient-tabs" aria-label="Patient chart sections">
      <a class="patient-tab active" href="#summary">Summary</a>
      <a class="patient-tab" href="#encounters">Encounters</a>
      <a class="patient-tab" href="#demographics">Demographics</a>
      <a class="patient-tab" href="#encounters">Notes</a>
      <a class="patient-tab" href="#summary">Medications</a>
      <a class="patient-tab" href="#summary">Vitals</a>
      <a class="patient-tab" href="#summary">Orders</a>
    </nav>

    <section class="content-panel">
      ${messageHtml}

      <div class="summary-grid" id="summary">
        <section class="summary-card" id="demographics">
          <div class="summary-card-header">Patient identification</div>
          <div class="summary-card-body">
            <dl class="facts">
              <dt>Medical record no.</dt>
              <dd>${escapeHtml(input.patient.medical_record_number)}</dd>

              <dt>Date of birth</dt>
              <dd>${escapeHtml(input.patient.date_of_birth)}</dd>

              <dt>Phone</dt>
              <dd>${escapeHtml(input.patient.phone ?? "Not provided")}</dd>

              <dt>Address</dt>
              <dd>${escapeHtml(input.patient.address ?? "Not provided")}</dd>
            </dl>
          </div>
        </section>

        <section class="summary-card">
          <div class="summary-card-header">At a glance</div>
          <div class="summary-card-body">
            <dl class="facts">
              <dt>Record type</dt>
              <dd>Fictional training record</dd>

              <dt>Encounter notes</dt>
              <dd>${canReadNotes ? String(input.encounters.length) : "Restricted by role"}</dd>

              <dt>Your access</dt>
              <dd>${escapeHtml(input.user.role)}</dd>

              <dt>Data warning</dt>
              <dd>Do not enter real patient information</dd>
            </dl>
          </div>
        </section>
      </div>

      <hr class="section-divider">

      <section id="encounters">
        <div class="section-heading-row">
          <h2>Encounter notes</h2>
          ${
            canReadNotes
              ? `<span class="pill">${input.encounters.length} note${input.encounters.length === 1 ? "" : "s"}</span>`
              : `<span class="pill">Restricted</span>`
          }
        </div>

        ${encountersHtml}
      </section>

      ${encounterForm}
    </section>
  </main>
</div>`,
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
<td>${escapeHtml(event.actor_email ?? "Unknown")}</td>
<td>${escapeHtml(event.action)}</td>
<td>${escapeHtml(event.resource_type)}</td>
<td>${escapeHtml(event.patient_id ?? "—")}</td>
<td>${event.success ? "Success" : "Failed"}</td>
</tr>`,
    )
    .join("");

  return layout(
    "Audit log",
    `${appHeader({
      email: input.user.email,
      role: input.user.role,
      showAudit: true,
    })}

<main class="main-content">
  <section class="patient-banner">
    <div class="patient-banner-top">
      <div>
        <h1 class="patient-name">Audit log</h1>
        <p class="patient-identifiers">
          Recent actions recorded in this synthetic training environment.
        </p>
      </div>
      <span class="demo-record-label">ADMIN ONLY</span>
    </div>
  </section>

  <div class="warning-strip">
    <strong>Synthetic demo only:</strong> audit logging is included to demonstrate accountability.
  </div>

  <section class="content-panel">
    <div class="section-heading-row">
      <h2>Recent events</h2>
      <span class="pill">Latest 200</span>
    </div>

    <div class="audit-table-wrap">
      <table class="audit-table">
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
          ${rows || `<tr><td colspan="6">No audit events recorded yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  </section>
</main>`,
  );
}