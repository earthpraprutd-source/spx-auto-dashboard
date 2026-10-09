const loginPanel = document.querySelector("#loginPanel");
const dashboard = document.querySelector("#dashboard");
const loginError = document.querySelector("#loginError");
let cachedTickets = [];
async function api(url, options = {}) {
  const res = await fetch(url, { credentials:"same-origin", ...options, headers:{"Content-Type":"application/json", ...(options.headers||{})} });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
async function checkLogin() {
  try { await api("/api/admin/me"); loginPanel.classList.add("hidden"); dashboard.classList.remove("hidden"); await loadTickets(); }
  catch { loginPanel.classList.remove("hidden"); dashboard.classList.add("hidden"); }
}
document.querySelector("#loginForm").addEventListener("submit", async e => {
  e.preventDefault(); loginError.textContent = "";
  const body = Object.fromEntries(new FormData(e.currentTarget).entries());
  try { await api("/api/admin/login", {method:"POST", body:JSON.stringify(body)}); e.currentTarget.reset(); await checkLogin(); }
  catch(err) { loginError.textContent = err.message; }
});
document.querySelector("#logoutBtn").addEventListener("click", async () => { try { await api("/api/admin/logout",{method:"POST"}); } finally { checkLogin(); } });
document.querySelector("#refreshBtn").addEventListener("click", loadTickets);
document.querySelector("#statusFilter").addEventListener("change", loadTickets);
let searchTimer;
document.querySelector("#searchBox").addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadTickets, 250); });
async function loadTickets() {
  try {
    const q = document.querySelector("#searchBox").value;
    const status = document.querySelector("#statusFilter").value;
    const data = await api(`/api/admin/tickets?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`);
    cachedTickets = data.tickets || [];
    const s = data.stats || {};
    document.querySelector("#stats").innerHTML = [
      ["Ticket ทั้งหมด",s.total||0],["Not Started",s.not_started||0],["In Progress",s.in_progress||0],["Done",s.done||0]
    ].map(([label,value])=>`<div class="stat-card"><span>${label}</span><strong>${value}</strong></div>`).join("");
    renderRows(cachedTickets);
    document.querySelector("#tableFoot").textContent = `แสดง ${cachedTickets.length} รายการ · ข้อมูลจากฐานข้อมูลกลาง`;
  } catch(err) {
    if (String(err.message).includes("Admin login")) checkLogin();
    else document.querySelector("#ticketRows").innerHTML = `<tr><td colspan="8">${escapeHtml(err.message)}</td></tr>`;
  }
}
function renderRows(tickets) {
  const tbody = document.querySelector("#ticketRows");
  if (!tickets.length) { tbody.innerHTML = '<tr><td colspan="8">ไม่พบรายการแจ้งซ่อม</td></tr>'; return; }
  const statuses = ["Not Started","In Progress","Done","Tracking","Cancel","Move to Improvement","Out of scope"];
  tbody.innerHTML = tickets.map(t => `<tr data-id="${t.id}">
    <td class="ticket-cell"><strong>${escapeHtml(t.ticket_no)}</strong><span>${new Date(t.created_at).toLocaleString("th-TH")}</span><span>${escapeHtml(t.requester_name)}</span></td>
    <td><strong>${escapeHtml(t.hub_code)}</strong><div>${escapeHtml(t.category)}</div></td>
    <td>${escapeHtml(t.description)}</td>
    <td><span class="priority priority-${escapeHtml(t.priority)}">${escapeHtml(t.priority)}</span></td>
    <td><select class="row-status">${statuses.map(s=>`<option ${s===t.status?"selected":""}>${s}</option>`).join("")}</select></td>
    <td><input class="row-team" value="${escapeAttr(t.responsible_team||"FCM")}"></td>
    <td><textarea class="row-note">${escapeHtml(t.admin_note||"")}</textarea></td>
    <td><button class="save-btn" data-save="${t.id}">บันทึก</button></td>
  </tr>`).join("");
  tbody.querySelectorAll("[data-save]").forEach(btn => btn.addEventListener("click", saveTicket));
}
async function saveTicket(event) {
  const id = event.currentTarget.dataset.save;
  const row = event.currentTarget.closest("tr");
  event.currentTarget.disabled = true;
  try {
    await api(`/api/admin/tickets/${id}`, {method:"PATCH", body:JSON.stringify({
      status:row.querySelector(".row-status").value,
      responsible_team:row.querySelector(".row-team").value,
      admin_note:row.querySelector(".row-note").value
    })});
    event.currentTarget.textContent = "บันทึกแล้ว";
    await loadTickets();
  } catch(err) { alert(err.message); event.currentTarget.disabled = false; }
}
document.querySelector("#importPreviewBtn").addEventListener("click", async () => {
  const out = document.querySelector("#importResult");
  out.classList.remove("hidden"); out.textContent = "กำลังอ่าน Google Sheets...";
  try { out.textContent = JSON.stringify(await api("/api/admin/import-sheet",{method:"POST",body:"{}"}),null,2); }
  catch(err) { out.textContent = err.message; }
});
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g,"&#96;"); }
checkLogin();