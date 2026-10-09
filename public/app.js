const ticketForm = document.querySelector("#ticketForm");
const submitBtn = document.querySelector("#submitBtn");
const formResult = document.querySelector("#formResult");
ticketForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "กำลังบันทึก...";
  formResult.className = "notice hidden";
  const body = Object.fromEntries(new FormData(ticketForm).entries());
  try {
    const res = await fetch("/api/tickets", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ส่งคำขอไม่สำเร็จ");
    formResult.className = "notice";
    formResult.innerHTML = `<strong>ส่งคำขอแจ้งซ่อมสำเร็จ</strong><div>เลข Ticket ของคุณ</div><div class="ticket-number">${escapeHtml(data.ticket_no)}</div><div>${data.sheet_sync === "synced" ? "ซิงก์ข้อมูลไป Google Sheets แล้ว" : "Ticket ถูกบันทึกแล้ว แต่ยังซิงก์ Google Sheets ไม่สำเร็จ ทีม Admin สามารถตรวจสอบภายหลังได้"}</div>`;
    ticketForm.reset();
  } catch (err) {
    formResult.className = "notice error";
    formResult.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'ส่งคำขอแจ้งซ่อม <span>→</span>';
  }
});
document.querySelector("#trackForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const ticketNo = new FormData(event.currentTarget).get("ticket_no").trim();
  const output = document.querySelector("#trackResult");
  output.textContent = "กำลังค้นหา...";
  try {
    const res = await fetch(`/api/tickets/track/${encodeURIComponent(ticketNo)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ค้นหาไม่สำเร็จ");
    output.innerHTML = `<div class="track-card"><strong>${escapeHtml(data.ticket_no)}</strong><p>Hub: ${escapeHtml(data.hub_code)} · ${escapeHtml(data.category)}</p><p>สถานะ: <b>${escapeHtml(data.status)}</b> · Priority: ${escapeHtml(data.priority)}</p><p>${escapeHtml(data.description)}</p></div>`;
  } catch (err) { output.textContent = err.message; }
});
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}