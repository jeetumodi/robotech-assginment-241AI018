
import "dotenv/config";
import pool from "../db.js";

async function run() {
    try {
        console.log("Running migration...");

        // 1. Update events table
        await pool.query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS scope VARCHAR(50) DEFAULT 'GLOBAL', -- GLOBAL, SIG, PERSONAL
      ADD COLUMN IF NOT EXISTS sig_id INT REFERENCES team_groups(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS is_full_event BOOLEAN DEFAULT TRUE;
    `);
        console.log("Updated events table.");

        // 2. Update roles table
        await pool.query(`
      ALTER TABLE roles
      ADD COLUMN IF NOT EXISTS can_manage_content BOOLEAN DEFAULT FALSE;
    `);
        console.log("Updated roles table.");

    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        await pool.end();
    }
}

run();
