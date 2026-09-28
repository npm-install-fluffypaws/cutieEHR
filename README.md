# EHR Demo — Synthetic Data Only

This is an educational EHR-style demonstration application.

It uses fictional, synthetic patient records only. Do not enter real patient
information, health records, personal identifiers, insurance information, or
medical documents.

This app is not intended for clinical use, emergency care, diagnosis,
treatment, HIPAA-regulated use, or production healthcare deployment.

## Features

- Email/password sign-in
- Role-based access control
- Fake patient records
- Fake clinical encounter notes
- Audit logs
- Secure HTTP-only cookie sessions
- D1 database migrations

## Roles

- admin: views patient charts and audit logs
- clinician: views charts and adds encounter notes
- front_desk: views demographics but cannot read or create encounter notes

## Local setup

1. Install dependencies:

   npm install

2. Create and apply the local D1 migration:

   npx wrangler d1 migrations apply ehr-demo-db --local

3. Start development:

   npm run dev

## Demo accounts

After seeding with the commands described in the setup guide:

- admin@demo.local / ChangeMe123!
- clinician@demo.local / ChangeMe123!
- frontdesk@demo.local / ChangeMe123!

Change or remove all demo credentials before sharing a deployed demonstration.
