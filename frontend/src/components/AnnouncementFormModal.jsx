import { useState } from "react";
import api from "../api/axios";
import AnnouncementFiles from "../components/AnnouncementFiles";

export default function AnnouncementFormModal({
  announcement,
  onClose,
  onSaved
}) {
  // Move all hooks BEFORE any conditional returns
  const isEdit = Boolean(announcement?.id);

  const [title, setTitle] = useState(announcement?.title || "");
  const [body, setBody] = useState(announcement?.body_html || "");
  const [expiresAt, setExpiresAt] = useState(
    announcement?.expires_at?.slice(0, 10) || ""
  );
  const [saving, setSaving] = useState(false);

  /* ===== TOAST STATE (NON-BLOCKING) ===== */
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info", // info | error | success
  });

  // 🔒 Defensive guard (moved after hooks)
  if (!announcement) return null;

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 3000);
  };

  async function handleSave() {
    if (!title.trim() || !body.trim()) return;

    try {
      setSaving(true);

      const payload = {
        title,
        body_html: body,
        expires_at: expiresAt || null
      };

      if (isEdit) {
        await api.put(`/admin/announcements/${announcement.id}`, payload);
      } else {
        await api.post("/admin/announcements", payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to save announcement.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0b0b0b] border border-white/10 shadow-xl">

        {/* ===== HEADER ===== */}
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-2xl font-semibold text-cyan-400">
            {isEdit ? "Edit Announcement" : "Create Announcement"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isEdit
              ? "Update announcement details or attachments"
              : "Draft an announcement before publishing it publicly"}
          </p>
        </div>

        {/* ===== BODY ===== */}
        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. RoboTech Workshop Registration Open"
              className="w-full rounded-lg bg-black/40 border border-white/20 px-4 py-2.5 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* CONTENT */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Announcement Content
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={7}
              placeholder="Write the full announcement here…"
              className="w-full rounded-lg bg-black/40 border border-white/20 px-4 py-3 resize-none focus:outline-none focus:border-cyan-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Visible to all users once published.
            </p>
          </div>

          {/* EXPIRY */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Expiry Date (optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="rounded-lg bg-black/40 border border-white/20 px-4 py-2.5 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* FILES */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Attachments
              </label>

              {/* 
                IMPORTANT:
                AnnouncementFiles must perform size + type validation
                and should call showToast(...) on validation failure.
              */}
              <AnnouncementFiles
                announcementId={announcement.id}
                onError={(msg) => showToast(msg, "error")}
              />
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {isEdit ? "Changes save immediately" : "Saved as draft until published"}
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/10 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !body.trim()}
              className="px-5 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 text-black font-medium disabled:opacity-50 transition"
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
          </div>
        </div>
      </div>

      {/* ===== TOAST ===== */}
      {toast.show && (
        <div
          className={`
            fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm
            ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : "bg-cyan-600"
            }
          `}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
