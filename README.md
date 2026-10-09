# spx-auto-dashboard[README.md](https://github.com/user-attachments/files/33239286/README.md)
# SPX Hub Maintenance — starter app

This repository is a deployable starter for a public repair-request form, an Admin-only dashboard, PostgreSQL storage, and Google Sheets append/sync.

## Important Google Sheets safety notes

- Spreadsheet ID configured for this project: `1920LLT40J-S8MtGfdfrVB-iNiBY1X4OU047TlEfGvMA`.
- New requests are written to a dedicated tab named **WebApp Tickets**. Create this tab before testing.
- The existing `[Working]Hub Maintenance` source range is only read by the Admin "connection preview" endpoint. This preview does **not** import rows into PostgreSQL yet; the actual source tab name and header mapping must be confirmed first.
- Do not point `GOOGLE_WRITE_RANGE` at the original maintenance table until column mapping and formula columns are reviewed.
- Share the spreadsheet with the Google service account email as **Editor**. Keep the service-account JSON in hosting Environment Variables only; never commit it to GitHub.

## Files

- `server.js`: Express API, Admin session, database schema creation, Google Sheets read/append/update.
- `public/index.html`: public form and ticket tracking.
- `public/admin.html`: Admin login and dashboard.
- `public/*.js`, `public/style.css`: browser logic and styles.
- `schema.sql`: reference SQL schema.

## Deploy without installing software locally

1. In GitHub open `https://github.com/earthpraprutd-source/spx-auto-dashboard`.
2. Add each file from this project using **Add file → Create new file**. Use the same paths shown here. For files under `public/`, type e.g. `public/index.html` in the filename field.
3. Create a PostgreSQL database at Supabase (or another PostgreSQL provider). Copy the database connection string.
4. In Google Cloud Console, create/select a project, enable **Google Sheets API**, create a service account, and generate its JSON key. Share the spreadsheet with the service account's `client_email` as Editor.
5. Create a tab named `WebApp Tickets`. Row 1 should contain these headers:
   `Ticket Number | Created At | Hub Code | Requester Name | Requester Email | Category | Priority | Description | Contact Phone | Status | Responsible Team`
6. Create a web service from the GitHub repository on a Node.js hosting provider that supports persistent Express apps (for example Render). Build command: `npm install`. Start command: `npm start`.
7. Set environment variables in the host dashboard using `.env.example` as a guide:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: long random secret
   - `ADMIN_USERNAME`: desired Admin username
   - `ADMIN_PASSWORD`: long, unique Admin password stored only in hosting Environment Variables (or optionally use `ADMIN_PASSWORD_HASH`)
   - `GOOGLE_SHEET_ID`: the spreadsheet ID above
   - `GOOGLE_SOURCE_RANGE`: exact existing tab and range, e.g. `'[Working]Hub Maintenance'!A:AG` **only if that exact tab name exists**
   - `GOOGLE_WRITE_RANGE`: `'WebApp Tickets'!A:K`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: entire service-account JSON as a single-line JSON value
   - `NODE_ENV=production`
8. Deploy. Test `/api/health`, submit one test request, check it appears in PostgreSQL and in the `WebApp Tickets` tab. Then test `/admin.html`.

## Admin password

Set `ADMIN_USERNAME` and a long, unique `ADMIN_PASSWORD` in your hosting provider's private Environment settings. Do not put the password in GitHub or share it in chat. The app also supports `ADMIN_PASSWORD_HASH` (bcrypt); if that variable is configured, it takes precedence. For a larger rollout, replace this basic single-admin login with a full identity provider.

## Current MVP behavior

- Public form creates a unique ticket number and stores it in PostgreSQL.
- Ticket status lookup uses the ticket number.
- Admin can log in, search/filter tickets, change status/team/note, and view KPI counts.
- New tickets append to `WebApp Tickets`; status/team changes update that tab if the matching ticket number is found.
- Admin can preview rows read from the source sheet. Actual legacy-data import is intentionally not enabled until exact column headers and import rules are confirmed.

## Security / production checklist

- Use a strong random `SESSION_SECRET`; never use the example value.
- Keep Google service-account JSON and database credentials out of GitHub.
- Use HTTPS on hosting.
- Restrict Admin access and rotate credentials if exposed.
- Add automated backups, audit logs, CSRF protection, and stronger user identity management before production-wide rollout.
- Do not let public users update ticket status; only Admin endpoints can do so.
