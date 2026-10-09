CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  ticket_no TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hub_code TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P2',
  description TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started',
  responsible_team TEXT NOT NULL DEFAULT 'FCM',
  admin_note TEXT,
  sheets_synced_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status);
CREATE INDEX IF NOT EXISTS tickets_hub_idx ON tickets(hub_code);
