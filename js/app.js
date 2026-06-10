const RAW = window.FAIR_SCHEDULE || [];
const STORAGE_KEY = "borgiaFairPortalV21State";

const els = {};
let assignments = [];
let sportCoaches = [];
let pointCoaches = [];
let state = loadState();

const HEADSHOT_MAP = {
  "Boyd Manne": "assets/headshots/Boyd_Manne.jpg",
  "Danny Strohmeyer": "assets/headshots/Danny_Strohmeyer.jpg",
  "Mackenzie Severino": "assets/headshots/Mackenzie_Severino.jpg",
  "Michael Pelster": "assets/headshots/Michael_Pelster.jpg",
  "Rob Struckhoff": "assets/headshots/Rob_Struckhoff.jpg"
};

function headshotFor(name){
  return HEADSHOT_MAP[name] || "";
}


document.addEventListener("DOMContentLoaded", init);

function init(){
  cacheEls();
  ensureStateDefaults();
  buildData();
  renderDirectories();
  renderBoards();
  renderTrades();
  renderPassBoard();
  bindEvents();
  updateStats();
  handleCalendarDeepLink();
}

function cacheEls(){
  ["searchInput","clearSearch","searchStatus","searchResults","confirmedList","awaitingList",
   "confirmedCount","awaitingCount","tradeList","tradeCount","pointCoachDirectory","sportCoachDirectory",
   "coordinatorToggle","coordinatorPanel","resetLocalData","statAssignments","statConfirmed","statAwaiting","statTrades","passLookupInput","passLookupResults","passSlotInput","passMode","passNote","findPassMatches","postPassRequest","passMatches","passBoard","passCount"]
   .forEach(id => els[id] = document.getElementById(id));
}


function ensureStateDefaults(){
  state.confirmed = state.confirmed || {};
  state.trades = state.trades || {};
  state.passSplits = state.passSplits || {};
}

function bindEvents(){
  els.searchInput.addEventListener("input", runSearch);
  els.clearSearch.addEventListener("click", () => {
    els.searchInput.value = "";
    els.searchResults.innerHTML = "";
    els.searchStatus.textContent = "";
  });
  els.coordinatorToggle.addEventListener("click", () => {
    document.body.classList.toggle("coordinator-active");
    els.coordinatorPanel.classList.toggle("hidden");
    updateStats();
  });
  els.resetLocalData.addEventListener("click", () => {
    if(confirm("Clear local confirmations, trade requests, and pass splitter requests on this device?")){
      state = {confirmed:{},trades:{},passSplits:{}};
      saveState();
      renderBoards();
      renderTrades();
      renderPassBoard();
      updateStats();
      runSearch();
    }
  });

  if (els.passLookupInput){
    els.passLookupInput.addEventListener("input", runPassLookup);
  }

  if (els.findPassMatches){
    els.findPassMatches.addEventListener("click", () => {
      const assignment = getSelectedPassAssignment();
      if (!assignment){
        alert("Search for and select your assignment first.");
        return;
      }
      renderPassMatches(assignment);
    });
  }

  if (els.postPassRequest){
    els.postPassRequest.addEventListener("click", () => {
      const assignment = getSelectedPassAssignment();
      if (!assignment){
        alert("Search for and select your assignment first.");
        return;
      }
      const slot = assignment.slot;
      state.passSplits[slot] = {
        slot,
        mode: els.passMode.value,
        note: els.passNote.value.trim(),
        createdAt: new Date().toISOString()
      };
      saveState();
      renderPassBoard();
      renderPassMatches(assignment);
      location.hash = "pass-splitter";
    });
  }

}

function buildData(){
  const clean = RAW.map(normalizeRecord);
  pointCoaches = clean.filter(r => r.position.toLowerCase() === "point coach");
  sportCoaches = uniqueByName(
    clean.filter(r => {
      const p = r.position.toLowerCase();
      return p === "coach" || p === "point coach";
    })
  ).sort((a,b)=>a.fullName.localeCompare(b.fullName));

  assignments = clean.filter(r => isVolunteerPosition(r.position))
    .map(r => ({...r, pointCoach: findPointCoach(r.date)}))
    .sort((a,b)=>(Number(a.slot)||0)-(Number(b.slot)||0));
}

function normalizeRecord(r){
  const get = (...keys) => {
    for (const k of keys) if (r[k] !== undefined && String(r[k]).trim() !== "") return String(r[k]).trim();
    return "";
  };
  const parent1 = get("Parent-1","Parent1","Parent 1");
  const parent2 = get("Parent-2","Parent2","Parent 2");
  const last = get("lastname","LastName","Last Name","last name");
  const date = fixDateYear(get("date","Date"));
  const firstPart = [parent1, parent2].filter(Boolean).join(" / ");
  const familyName = firstPart ? (last ? `${firstPart} ${last}` : firstPart) : (last || "Unnamed");
  return {
    raw:r,
    slot:get("slots","Slot","slot"),
    position:get("Position","position"),
    date,
    notes:get("Notes","notes"),
    time:get("time","Time"),
    parent1,parent2,lastname:last,familyName,
    email1:get("email-1","Email1","Email 1"),
    email2:get("email-2","Email2","Email 2"),
    phone1:get("phone number-1","Phone1","Phone 1"),
    phone2:get("phone number-2","Phone2","Phone 2"),
    fullName:familyName,
    searchText:Object.values(r).join(" ").toLowerCase()
  };
}

function uniqueByName(rows){
  const map = new Map();
  rows.forEach(r => { if(r.fullName && !map.has(r.fullName)) map.set(r.fullName, r); });
  return [...map.values()];
}

function fixDateYear(d){ return String(d || "").replace("2006","2026"); }

function isVolunteerPosition(pos){
  const p = (pos || "").trim().toLowerCase();
  if (!p || p.includes("coach")) return false;
  return ["soda stand","fish/chips","soda stand/fc","potential substitute parents","fish stand","fish stand or soda stand","substitute helper"].some(x => p.includes(x));
}

function displayPosition(pos){
  const p = (pos || "").toLowerCase();
  if (p.includes("soda") && (p.includes("fc") || p.includes("fish"))) return "Fish Stand or Soda Stand";
  if (p.includes("fish") || p.includes("chips")) return "Fish Stand";
  if (p.includes("soda")) return "Soda Stand";
  if (p.includes("substitute")) return "Substitute Helper";
  if (p.includes("point")) return "Point Coach";
  if (p.includes("coach")) return "Coach";
  return pos || "Assignment";
}

function iconFor(pos){
  const d = displayPosition(pos);
  const map = {
    "Fish Stand":"assets/icons/SFB_Fair_IconsFishStand.svg",
    "Soda Stand":"assets/icons/SFB_Fair_IconsSodaStand.svg",
    "Fish Stand or Soda Stand":"assets/icons/SFB_Fair_IconsFishorSodaStand.svg",
    "Substitute Helper":"assets/icons/SFB_Fair_IconsSubstitute.svg",
    "Coach":"assets/icons/SFB_Fair_IconsCoach.svg",
    "Point Coach":"assets/icons/SFB_Fair_IconsPointCoach.svg"
  };
  return map[d] || map["Fish Stand"];
}

function findPointCoach(date){
  const day = dayKey(date);
  return pointCoaches.find(c => dayKey(c.date) === day) || null;
}

function dayKey(date){
  const s = String(date || "").toLowerCase();
  const m = s.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/);
  return m ? m[0] : s;
}

function runSearch(){
  const q = els.searchInput.value.trim().toLowerCase();
  els.searchResults.innerHTML = "";
  if (!q){
    els.searchStatus.textContent = "";
    return;
  }
  const digits = onlyDigits(q);
  const results = assignments.filter(a =>
    a.searchText.includes(q) ||
    a.familyName.toLowerCase().includes(q) ||
    a.lastname.toLowerCase().includes(q) ||
    (digits && onlyDigits(a.phone1 + a.phone2).includes(digits))
  ).slice(0,50);
  els.searchStatus.textContent = `${results.length} matching assignment${results.length === 1 ? "" : "s"} found.`;
  results.forEach(a => els.searchResults.appendChild(assignmentCard(a)));
}

function assignmentCard(a){
  const confirmed = state.confirmed[a.slot];
  const selectedCoach = confirmed?.sportCoach || "";
  const div = document.createElement("div");
  div.className = "assignment-card" + (confirmed ? " confirmed" : "");
  const coachOptions = `<option value="">Select sport coach...</option>` +
    sportCoaches.map(c => `<option value="${escapeAttr(c.fullName)}" ${c.fullName===selectedCoach?"selected":""}>${escapeHtml(c.fullName)}</option>`).join("");

  div.innerHTML = `
    <div>
      <div class="assignment-head">
        <img class="position-icon" src="${iconFor(a.position)}" alt="${escapeAttr(displayPosition(a.position))}">
        <div>
          <span class="badge ${confirmed?"confirmed":""}">Slot ${escapeHtml(a.slot)} • ${escapeHtml(displayPosition(a.position))}</span>
          <div class="people">${escapeHtml(a.familyName)} ${confirmed ? "✓" : ""}</div>
          <div class="detail-grid">
            <div><span class="label">Date:</span> ${escapeHtml(a.date)}</div>
            <div><span class="label">Time:</span> ${escapeHtml(a.time || "Time not listed")}</div>
            <div><span class="label">Email:</span> ${escapeHtml(joinSlash(a.email1,a.email2))}</div>
            <div><span class="label">Phone:</span> ${escapeHtml(joinSlash(a.phone1,a.phone2))}</div>
          </div>
          ${a.notes ? `<div class="notes"><span class="label">Notes:</span> ${escapeHtml(a.notes)}</div>` : ""}
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-navy" data-action="confirm">Confirm Assignment</button>
        <button class="btn btn-gold" data-action="calendar">Add To Calendar</button>
        <button class="btn" data-action="email">Email Confirmation</button>
        <button class="btn" data-action="trade">Request Trade</button>
      </div>
    </div>
    <div class="side-box">
      <label class="label" for="coach-${escapeAttr(a.slot)}">Sport Coach</label>
      <select id="coach-${escapeAttr(a.slot)}" class="coach-select">${coachOptions}</select>
      <div class="point-coach">
        <div class="label">Point Coach</div>
        ${pointCoachShortHtml(a.pointCoach)}
      </div>
    </div>
  `;

  div.querySelector('[data-action="confirm"]').addEventListener("click", () => {
    const coach = div.querySelector("select").value;
    if (!coach){ alert("Choose your sport coach/contact before confirming."); return; }
    confirmAssignment(a, coach);
    els.searchResults.innerHTML = "";
    els.searchResults.appendChild(assignmentCard(a));
    els.searchStatus.textContent = "Assignment confirmed. Email draft should open next.";
    openConfirmationEmail(a, coach);
  });
  div.querySelector('[data-action="calendar"]').addEventListener("click", () => downloadIcs(a, div.querySelector("select").value));
  div.querySelector('[data-action="email"]').addEventListener("click", () => openConfirmationEmail(a, div.querySelector("select").value || selectedCoach));
  div.querySelector('[data-action="trade"]').addEventListener("click", () => requestTrade(a));

  return div;
}

function pointCoachShortHtml(c){
  if (!c) return `<div class="muted">No point coach found.</div>`;
  return `<div class="pc-name">${escapeHtml(c.fullName)}</div><div class="pc-small">Details are in the Coach Directory and calendar file.</div>`;
}

function pointCoachFullHtml(c){
  if (!c) return `<div class="muted">No point coach found for this day.</div>`;
  const photo = headshotFor(c.fullName);
  return `
    <div class="point-coach-feature">
      ${photo ? `<img class="coach-headshot" src="${escapeAttr(photo)}" alt="${escapeAttr(c.fullName)}">` : `<div></div>`}
      <div>
        <div class="point-day">${escapeHtml(c.date)}</div><br>
        <strong>${escapeHtml(c.fullName)}</strong><br>
        ${c.email1 ? `<a href="mailto:${escapeAttr(c.email1)}">${escapeHtml(c.email1)}</a><br>` : ""}
        ${c.phone1 ? `<a href="tel:${escapeAttr(onlyDigits(c.phone1))}">${escapeHtml(c.phone1)}</a>` : ""}
      </div>
    </div>
  `;
}

function confirmAssignment(a, coach){
  state.confirmed[a.slot] = {slot:a.slot, sportCoach:coach, confirmedAt:new Date().toISOString()};
  saveState(); renderBoards(); updateStats();
}

function renderBoards(){
  const confirmed = assignments.filter(a => state.confirmed[a.slot]);
  const awaiting = assignments.filter(a => !state.confirmed[a.slot]);
  els.confirmedCount.textContent = confirmed.length;
  els.awaitingCount.textContent = awaiting.length;
  els.confirmedList.innerHTML = confirmed.length ? "" : `<p class="muted">No confirmations on this device yet.</p>`;
  els.awaitingList.innerHTML = "";
  confirmed.forEach(a => els.confirmedList.appendChild(compactRow(a,true)));
  awaiting.forEach(a => els.awaitingList.appendChild(compactRow(a,false)));
  updateStats();
}

function compactRow(a, isConfirmed){
  const div = document.createElement("div");
  div.className = "compact-row " + (isConfirmed ? "confirmed" : "pending");
  const coach = state.confirmed[a.slot]?.sportCoach || "Not selected";
  div.innerHTML = `
    <strong>${isConfirmed ? "✓ " : "○ "}${escapeHtml(a.familyName)}</strong><br>
    Slot ${escapeHtml(a.slot)} • ${escapeHtml(displayPosition(a.position))}<br>
    ${escapeHtml(a.date)} • ${escapeHtml(a.time || "Time not listed")}<br>
    <span class="small">Sport Coach: ${escapeHtml(coach)}</span>
  `;
  return div;
}

function requestTrade(a){
  showTradeModal(a);
}

function showTradeModal(a){
  closeTradeModal();

  const days = getFairDays();
  const overlay = document.createElement("div");
  overlay.className = "trade-modal-overlay";
  overlay.id = "tradeModalOverlay";

  overlay.innerHTML = `
    <div class="trade-modal" role="dialog" aria-modal="true" aria-labelledby="tradeModalTitle">
      <div class="trade-modal-head">
        <div>
          <h2 id="tradeModalTitle">Request Trade</h2>
          <p class="muted">Slot ${escapeHtml(a.slot)} • ${escapeHtml(displayPosition(a.position))} • ${escapeHtml(a.date)} • ${escapeHtml(a.time || "Time not listed")}</p>
        </div>
        <button class="btn" type="button" data-close-trade>Close</button>
      </div>

      <div class="trade-warning">
        Trade requests are not approved until confirmed. You remain responsible for your assigned shift.
      </div>

      <fieldset class="mode-switch">
        <legend>Trade Preference Mode</legend>
        <label>
          <input type="radio" name="tradeMode" value="available" checked>
          <span>Times I CAN work</span>
        </label>
        <label>
          <input type="radio" name="tradeMode" value="unavailable">
          <span>Times I CANNOT work</span>
        </label>
      </fieldset>

      <h3 id="tradePickerTitle">Times I Can Work</h3>
      <p class="muted" id="tradePickerHelp">Select the days and time blocks that would work for a trade.</p>

      <div class="unavailable-grid">
        ${days.map(day => tradeDayRow(day)).join("")}
      </div>

      <label class="checkbox-line">
        <input type="checkbox" id="canStillWork" checked>
        <span>My current shift still works if needed.</span>
      </label>

      <label class="label" for="tradeNote">Notes</label>
      <textarea id="tradeNote" placeholder="Example: I can work Saturday afternoon or Sunday morning."></textarea>

      <div id="possibleMatches" class="possible-matches"></div>

      <div class="actions">
        <button class="btn btn-gold" type="button" data-show-matches>Show Possible Trade Slots</button>
        <button class="btn btn-navy" type="button" data-post-trade>Post Trade Request</button>
        <button class="btn" type="button" data-close-trade>Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelectorAll("[data-close-trade]").forEach(btn => btn.addEventListener("click", closeTradeModal));
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeTradeModal();
  });

  overlay.querySelectorAll("input[name='tradeMode']").forEach(radio => {
    radio.addEventListener("change", () => {
      const mode = getTradeMode();
      document.getElementById("tradePickerTitle").textContent =
        mode === "available" ? "Times I Can Work" : "Times I Cannot Work";
      document.getElementById("tradePickerHelp").textContent =
        mode === "available"
          ? "Select the days and time blocks that would work for a trade."
          : "Select the days and time blocks that would not work for you.";
      renderPossibleMatches(a);
    });
  });

  overlay.querySelectorAll(".day-toggle").forEach(cb => {
    cb.addEventListener("change", () => {
      const row = cb.closest(".trade-day");
      row.classList.toggle("active", cb.checked);
      row.querySelectorAll("input[type='radio']").forEach(r => {
        r.disabled = !cb.checked;
        if (!cb.checked) r.checked = false;
      });
      renderPossibleMatches(a);
    });
  });

  overlay.querySelectorAll(".time-radio").forEach(r => {
    r.addEventListener("change", () => renderPossibleMatches(a));
  });

  overlay.querySelector("[data-show-matches]").addEventListener("click", () => renderPossibleMatches(a, true));
  overlay.querySelector("[data-post-trade]").addEventListener("click", () => {
    const mode = getTradeMode();
    const data = collectTradeDayData();
    const note = overlay.querySelector("#tradeNote").value.trim();
    const matches = getPossibleMatches(a, data, mode).map(m => m.slot);

    state.trades[a.slot] = {
      slot:a.slot,
      note,
      mode,
      dayTimes:data,
      canStillWork: overlay.querySelector("#canStillWork").checked,
      possibleMatches: matches,
      createdAt:new Date().toISOString()
    };
    saveState();
    renderTrades();
    updateStats();
    closeTradeModal();
    location.hash = "trade-board";
  });

  renderPossibleMatches(a);
}

function tradeDayRow(day){
  const id = day.toLowerCase().replace(/\W/g,"");
  return `
    <div class="trade-day" data-day="${escapeAttr(day)}">
      <label class="day-label">
        <input type="checkbox" class="day-toggle" value="${escapeAttr(day)}">
        <span>${escapeHtml(day)}</span>
      </label>
      <div class="time-options" role="radiogroup" aria-label="${escapeAttr(day)} trade time">
        ${["Morning","Afternoon","Evening","All Day"].map(block => `
          <label>
            <input disabled class="time-radio" type="radio" name="trade-${escapeAttr(id)}" value="${escapeAttr(block)}">
            <span>${escapeHtml(block)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function closeTradeModal(){
  const existing = document.getElementById("tradeModalOverlay");
  if (existing) existing.remove();
}

function getTradeMode(){
  const checked = document.querySelector("input[name='tradeMode']:checked");
  return checked ? checked.value : "available";
}

function getFairDays(){
  const order = ["Wednesday","Thursday","Friday","Saturday","Sunday","Monday","Tuesday"];
  const found = [...new Set(assignments.map(a => dayNameFromDate(a.date)).filter(Boolean))];
  return order.filter(d => found.includes(d));
}

function dayNameFromDate(date){
  const s = String(date || "");
  const m = s.match(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i);
  if (m) return titleCase(m[0]);
  const d = new Date(s);
  if (!isNaN(d)) return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
  return "";
}

function titleCase(s){
  return String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1).toLowerCase();
}

function collectTradeDayData(){
  const overlay = document.getElementById("tradeModalOverlay");
  if (!overlay) return {};
  const data = {};
  overlay.querySelectorAll(".trade-day").forEach(row => {
    const cb = row.querySelector(".day-toggle");
    if (!cb.checked) return;
    const chosen = row.querySelector("input[type='radio']:checked");
    data[cb.value] = chosen ? chosen.value : "All Day";
  });
  return data;
}

function renderPossibleMatches(current, forceOpen=false){
  const box = document.getElementById("possibleMatches");
  if (!box) return;

  const mode = getTradeMode();
  const data = collectTradeDayData();
  const matches = getPossibleMatches(current, data, mode);

  if (!forceOpen && Object.keys(data).length === 0){
    box.innerHTML = `<p class="muted">Select days/times to preview possible trade slots.</p>`;
    return;
  }

  if (!matches.length){
    box.innerHTML = `<div class="match-box"><strong>No obvious matches found.</strong><br><span class="muted">You can still post the trade request with a note.</span></div>`;
    return;
  }

  box.innerHTML = `
    <h3>Possible Trade Slots <span class="match-note">Showing all matches based on your choices</span></h3>
    <div class="match-list">
      ${matches.map(m => `
        <div class="match-box">
          <strong>Slot ${escapeHtml(m.slot)} • ${escapeHtml(displayPosition(m.position))}</strong><br>
          ${escapeHtml(m.familyName)}<br>
          ${escapeHtml(m.date)} • ${escapeHtml(m.time || "Time not listed")}
        </div>
      `).join("")}
    </div>
  `;
}

function getPossibleMatches(current, dayTimes, mode="available"){
  return assignments.filter(a => {
    if (String(a.slot) === String(current.slot)) return false;

    const selectedDays = Object.keys(dayTimes || {});
    if (!selectedDays.length) return true;

    const day = dayNameFromDate(a.date);
    const block = timeBlock(a.time);
    const selectedBlock = dayTimes[day];

    if (mode === "available"){
      if (!selectedBlock) return false;
      if (selectedBlock === "All Day") return true;
      return block === selectedBlock;
    }

    if (!selectedBlock) return true;
    if (selectedBlock === "All Day") return false;
    return block !== selectedBlock;
  });
}

function timeBlock(time){
  const s = String(time || "").toUpperCase();
  const first = s.split("-")[0] || "";
  const m = first.match(/(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)/);
  if (!m) return "Unknown";
  let h = Number(m[1]);
  const ap = m[3];
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  if (h < 12) return "Morning";
  if (h < 16) return "Afternoon";
  return "Evening";
}

function formatTradePreference(mode, dayTimes){
  const entries = Object.entries(dayTimes || {});
  if (!entries.length) return "Not specified";
  const label = mode === "unavailable" ? "Cannot work" : "Can work";
  return `${label}: ` + entries.map(([day, block]) => `${day} ${block}`).join("; ");
}

function formatUnavailable(unavailable){
  return formatTradePreference("unavailable", unavailable);
}

function renderTrades(){
  const trades = Object.values(state.trades);
  els.tradeCount.textContent = trades.length;
  els.tradeList.innerHTML = trades.length ? "" : `<p class="muted">No trade requests on this device yet.</p>`;
  trades.forEach(t => {
    const a = assignments.find(x => x.slot == t.slot);
    if (!a) return;
    const div = document.createElement("div");
    div.className = "trade-item";
    const matchSlots = (t.possibleMatches || []).slice(0,6).join(", ");
    div.innerHTML = `
      <strong>${escapeHtml(a.familyName)}</strong><br>
      Slot ${escapeHtml(a.slot)} • ${escapeHtml(displayPosition(a.position))}<br>
      ${escapeHtml(a.date)} • ${escapeHtml(a.time || "Time not listed")}<br>
      <div class="notes">
        <strong>Preference:</strong> ${escapeHtml(formatTradePreference(t.mode || "available", t.dayTimes || t.unavailable))}<br>
        <strong>Can still work current shift:</strong> ${t.canStillWork ? "Yes" : "No"}<br>
        ${matchSlots ? `<strong>Possible slots:</strong> ${escapeHtml(matchSlots)}<br>` : ""}
        <strong>Notes:</strong> ${escapeHtml(t.note || "No note entered.")}
      </div>
      <div class="actions">
        <button class="btn btn-gold">Offer Trade</button>
        <button class="btn btn-danger">Remove</button>
      </div>`;
    div.querySelector(".btn-gold").addEventListener("click", () => offerTrade(a,t));
    div.querySelector(".btn-danger").addEventListener("click", () => { delete state.trades[a.slot]; saveState(); renderTrades(); updateStats(); });
    els.tradeList.appendChild(div);
  });
}

function offerTrade(target, trade){
  const mySlot = prompt("Enter the slot number you are offering to trade:");
  if (!mySlot) return;
  const offered = assignments.find(a => String(a.slot) === String(mySlot).trim());
  if (!offered){ alert("Could not find that slot number."); return; }
  const subject = `Borgia Fair Trade Request • Slot ${offered.slot} for Slot ${target.slot}`;
  const pointEmails = [target.pointCoach?.email1, offered.pointCoach?.email1].filter(Boolean);
  const body = [
    "A trade has been proposed. This is not approved until confirmed by the proper coach/contact.",
    "",
    "Requested Trade:",
    `${target.familyName} — Slot ${target.slot} — ${displayPosition(target.position)} — ${target.date} — ${target.time}`,
    `Preference: ${formatTradePreference(trade.mode || "available", trade.dayTimes || trade.unavailable)}`,
    `Can still work current shift: ${trade.canStillWork ? "Yes" : "No"}`,
    `Trade note: ${trade.note || ""}`,
    "",
    "Offered Shift:",
    `${offered.familyName} — Slot ${offered.slot} — ${displayPosition(offered.position)} — ${offered.date} — ${offered.time}`,
    "",
    "Point Coach Contact(s):",
    pointEmails.join(", ") || "Not found",
    "",
    "Please review and approve or deny this trade."
  ].join("\n");
  location.href = mailtoUrl(pointEmails.join(","), subject, body);
}

function renderDirectories(){
  els.pointCoachDirectory.innerHTML = "";
  pointCoaches.forEach(c => {
    const div = document.createElement("div");
    div.innerHTML = pointCoachFullHtml(c);
    els.pointCoachDirectory.appendChild(div);
  });

  els.sportCoachDirectory.innerHTML = "";
  els.sportCoachDirectory.classList.add("head-coach-list");

  sportCoaches
    .filter(c => c.position.toLowerCase() === "coach")
    .forEach(c => {
      const div = document.createElement("div");
      div.className = "directory-item";
      div.innerHTML = `
        <strong>${escapeHtml(c.fullName)}</strong><br>
        ${c.email1 ? `<a href="mailto:${escapeAttr(c.email1)}">${escapeHtml(c.email1)}</a>` : ""}
      `;
      els.sportCoachDirectory.appendChild(div);
    });
}

function downloadIcs(a, coach){
  const time = parseDateTime(a.date, a.time);
  if (!time){ alert("This record does not have a usable date/time, so a calendar file cannot be created."); return; }
  const pc = a.pointCoach;
  const desc = [
    "Borgia Fair Volunteer Shift","",displayPosition(a.position),`Slot #${a.slot}`,"",
    `Volunteer: ${a.familyName}`,
    `Sport Coach: ${coach || state.confirmed[a.slot]?.sportCoach || "Not selected"}`,"",
    "Point Coach:", pc ? `${pc.fullName}\n${pc.phone1 || ""}\n${pc.email1 || ""}` : "Not found","",
    "Report To: Fish & Chips Stand", a.notes ? `Notes: ${a.notes}` : ""
  ].filter(Boolean).join("\\n");
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Borgia Fair Volunteer Portal//EN","BEGIN:VEVENT",
    `UID:borgia-fair-slot-${a.slot}@borgia-volunteer`,
    `DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(time.start)}`,`DTEND:${icsDate(time.end)}`,
    `SUMMARY:Borgia Fair Volunteer Shift - ${escapeIcs(displayPosition(a.position))}`,
    `LOCATION:${escapeIcs("Washington Town & Country Fair")}`,
    `DESCRIPTION:${escapeIcs(desc)}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href=url; link.download=`Borgia_Fair_Slot_${a.slot}.ics`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

function openConfirmationEmail(a, coach){
  if (!coach){ alert("Choose a sport coach first."); return; }
  const pc = a.pointCoach;
  const to = [a.email1, a.email2].filter(Boolean).join(",");
  const coachEmail = sportCoaches.find(c => c.fullName === coach)?.email1 || "";
  const cc = [coachEmail, pc?.email1].filter(Boolean).join(",");
  const subject = `Borgia Fair Confirmed • Slot ${a.slot} • ${shortDateTime(a)}`;
  const body = [
    "Thank you for confirming your Borgia Fair volunteer assignment.","",
    `Volunteer: ${a.familyName}`,`Slot #${a.slot}`,`${displayPosition(a.position)}`,`${a.date}`,`${a.time || "Time not listed"}`,"",
    `Sport Coach: ${coach}`,"","Point Coach:", pc ? `${pc.fullName}\n${pc.phone1 || ""}\n${pc.email1 || ""}` : "Not found","",
    a.notes ? `Notes: ${a.notes}\n` : "",
    "Add to Calendar:", calendarLink(a.slot),"","View Assignment Portal:", portalBaseLink(),"",
    "If your availability changes, use the Trade Board. You remain responsible for your shift until a trade is approved.","",
    "Thank you for supporting Borgia Athletics.","We Are Borgia."
  ].join("\n");
  location.href = mailtoUrl(to, subject, body, cc);
}



function runPassLookup(){
  if (!els.passLookupResults) return;

  const q = els.passLookupInput.value.trim().toLowerCase();
  els.passSlotInput.value = "";

  if (!q){
    els.passLookupResults.innerHTML = "";
    return;
  }

  const digits = onlyDigits(q);
  const results = assignments.filter(a =>
    String(a.slot).toLowerCase() === q ||
    a.searchText.includes(q) ||
    a.familyName.toLowerCase().includes(q) ||
    a.lastname.toLowerCase().includes(q) ||
    (digits && onlyDigits(a.phone1 + a.phone2).includes(digits))
  ).slice(0, 12);

  if (!results.length){
    els.passLookupResults.innerHTML = `<div class="pass-lookup-empty">No matching assignments found.</div>`;
    return;
  }

  els.passLookupResults.innerHTML = results.map(a => `
    <button type="button" class="pass-lookup-choice" data-slot="${escapeAttr(a.slot)}">
      <strong>${escapeHtml(a.familyName)}</strong>
      <span>Slot ${escapeHtml(a.slot)} • ${escapeHtml(displayPosition(a.position))} • ${escapeHtml(a.date)} • ${escapeHtml(a.time || "Time not listed")}</span>
    </button>
  `).join("");

  els.passLookupResults.querySelectorAll(".pass-lookup-choice").forEach(btn => {
    btn.addEventListener("click", () => {
      const a = assignments.find(x => String(x.slot) === String(btn.dataset.slot));
      if (a) {
        setPassAssignment(a);
        renderPassMatches(a);
      }
    });
  });
}

function setPassAssignment(a){
  els.passSlotInput.value = a.slot;
  els.passLookupInput.value = `${a.familyName} — Slot ${a.slot}`;
  els.passLookupResults.innerHTML = `
    <div class="pass-selected">
      Selected: <strong>${escapeHtml(a.familyName)}</strong><br>
      Slot ${escapeHtml(a.slot)} • ${escapeHtml(displayPosition(a.position))} • ${escapeHtml(a.date)} • ${escapeHtml(a.time || "Time not listed")}
    </div>
  `;
}

function getSelectedPassAssignment(){
  const slot = els.passSlotInput ? els.passSlotInput.value.trim() : "";
  return assignments.find(a => String(a.slot) === String(slot));
}


function renderPassMatches(current){
  if (!els.passMatches) return;

  const matches = getPassMatches(current).slice(0, 24);
  if (!matches.length){
    els.passMatches.innerHTML = `<div class="match-box"><strong>No strong pass matches found.</strong><br><span class="muted">Try posting a request so others can contact you.</span></div>`;
    return;
  }

  els.passMatches.innerHTML = `
    <h3>Compatible Pass Split Matches</h3>
    <div class="match-list">
      ${matches.map(m => `
        <div class="match-box">
          <strong>${escapeHtml(m.scoreLabel)}</strong><br>
          Slot ${escapeHtml(m.assignment.slot)} • ${escapeHtml(m.assignment.familyName)}<br>
          ${escapeHtml(displayPosition(m.assignment.position))}<br>
          ${escapeHtml(m.assignment.date)} • ${escapeHtml(m.assignment.time || "Time not listed")}<br>
          <button class="btn btn-gold pass-contact" type="button" data-slot="${escapeAttr(m.assignment.slot)}">Contact About Pass</button>
        </div>
      `).join("")}
    </div>
  `;

  els.passMatches.querySelectorAll(".pass-contact").forEach(btn => {
    btn.addEventListener("click", () => {
      const other = assignments.find(a => String(a.slot) === String(btn.dataset.slot));
      if (other) contactPassMatch(current, other);
    });
  });
}

function getPassMatches(current){
  const currentDay = dayNameFromDate(current.date);
  const currentBlock = timeBlock(current.time);

  return assignments
    .filter(a => String(a.slot) !== String(current.slot))
    .map(a => {
      const day = dayNameFromDate(a.date);
      const block = timeBlock(a.time);
      let score = 0;
      let scoreLabel = "Possible Match";

      if (day !== currentDay){
        score += 100;
        scoreLabel = "Best Match: Different Day";
      } else if (block !== currentBlock){
        score += 50;
        scoreLabel = "Good Match: Same Day, Different Time";
      } else {
        score -= 100;
        scoreLabel = "Poor Match: Same Shift Window";
      }

      const request = state.passSplits && state.passSplits[a.slot];
      if (request && request.mode !== "found"){
        score += 25;
        scoreLabel += " + Posted Request";
      }

      return {assignment:a, score, scoreLabel};
    })
    .filter(m => m.score > 0)
    .sort((a,b) => b.score - a.score || Number(a.assignment.slot) - Number(b.assignment.slot));
}

function contactPassMatch(current, other){
  const to = [other.email1, other.email2].filter(Boolean).join(",");
  const subject = `Borgia Fair Pass Split • Slot ${current.slot} and Slot ${other.slot}`;
  const body = [
    "Hi,",
    "",
    "I found your shift on the Borgia Fair Volunteer Portal and wanted to ask about possibly splitting a fair pass.",
    "",
    "My shift:",
    `${current.familyName} — Slot ${current.slot} — ${displayPosition(current.position)} — ${current.date} — ${current.time}`,
    "",
    "Your shift:",
    `${other.familyName} — Slot ${other.slot} — ${displayPosition(other.position)} — ${other.date} — ${other.time}`,
    "",
    "Let me know if you would be interested.",
    "",
    "Thanks!"
  ].join("\\n");

  location.href = mailtoUrl(to, subject, body);
}

function renderPassBoard(){
  if (!els.passBoard) return;

  const entries = Object.values(state.passSplits || {});
  if (els.passCount) els.passCount.textContent = entries.length;

  if (!entries.length){
    els.passBoard.innerHTML = `<p class="muted">No pass split requests on this device yet.</p>`;
    return;
  }

  els.passBoard.innerHTML = "";
  entries.forEach(entry => {
    const a = assignments.find(x => String(x.slot) === String(entry.slot));
    if (!a) return;
    const modeText = entry.mode === "have" ? "Has a pass to share" :
      entry.mode === "found" ? "Partner found" :
      "Looking to split a pass";
    const div = document.createElement("div");
    div.className = "trade-item";
    div.innerHTML = `
      <strong>${escapeHtml(a.familyName)}</strong><br>
      Slot ${escapeHtml(a.slot)} • ${escapeHtml(displayPosition(a.position))}<br>
      ${escapeHtml(a.date)} • ${escapeHtml(a.time || "Time not listed")}<br>
      <div class="notes">
        <strong>Status:</strong> ${escapeHtml(modeText)}<br>
        <strong>Notes:</strong> ${escapeHtml(entry.note || "No note entered.")}
      </div>
      <div class="actions">
        <button class="btn btn-gold">Find Matches</button>
        <button class="btn btn-danger">Remove</button>
      </div>
    `;
    div.querySelector(".btn-gold").addEventListener("click", () => {
      setPassAssignment(a);
      renderPassMatches(a);
      location.hash = "pass-splitter";
    });
    div.querySelector(".btn-danger").addEventListener("click", () => {
      delete state.passSplits[a.slot];
      saveState();
      renderPassBoard();
      updateStats();
    });
    els.passBoard.appendChild(div);
  });
}


function updateStats(){
  if(!els.statAssignments) return;
  const confirmed = Object.keys(state.confirmed).length;
  els.statAssignments.textContent = assignments.length;
  els.statConfirmed.textContent = confirmed;
  els.statAwaiting.textContent = Math.max(assignments.length - confirmed, 0);
  els.statTrades.textContent = Object.keys(state.trades).length;
}
function mailtoUrl(to, subject, body, cc=""){
  let url = `mailto:${encodeURIComponent(to || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (cc) url += `&cc=${encodeURIComponent(cc)}`;
  return url;
}
function calendarLink(slot){ const base = portalBaseLink(); return `${base}${base.includes("?") ? "&" : "?"}slot=${encodeURIComponent(slot)}&calendar=1`; }
function portalBaseLink(){ return location.href.split("#")[0].split("?")[0]; }
function handleCalendarDeepLink(){
  const params = new URLSearchParams(location.search);
  if (params.get("calendar") === "1" && params.get("slot")){
    const a = assignments.find(x => String(x.slot) === String(params.get("slot")));
    if (a) setTimeout(() => downloadIcs(a, state.confirmed[a.slot]?.sportCoach || ""), 500);
  }
}
function parseDateTime(dateStr, timeStr){
  if (!dateStr || !timeStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  const parts = String(timeStr).replace(/\s/g,"").toUpperCase().split("-");
  if (parts.length < 2) return null;
  const start = parseTimeOnDate(date, parts[0]); let end = parseTimeOnDate(date, parts[1]);
  if (!start || !end) return null;
  if (end <= start) end.setDate(end.getDate()+1);
  return {start,end};
}
function parseTimeOnDate(date, t){
  const m = t.match(/^(\d{1,2})(?::?(\d{2}))?(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]); const min = Number(m[2] || 0); const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  const d = new Date(date); d.setHours(h,min,0,0); return d;
}
function icsDate(d){ return d.toISOString().replace(/[-:]/g,"").split(".")[0] + "Z"; }
function escapeIcs(s){ return String(s || "").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"); }
function shortDateTime(a){ return `${a.date.split(",")[0] || a.date} ${a.time || ""}`.trim(); }
function joinSlash(a,b){ return [a,b].filter(Boolean).join(" / ") || "Not listed"; }
function onlyDigits(s){ return String(s || "").replace(/\D/g,""); }
function escapeHtml(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function escapeAttr(s){ return escapeHtml(s).replace(/`/g,"&#096;"); }
function loadState(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {confirmed:{},trades:{}}; } catch(e){ return {confirmed:{},trades:{}}; } }
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
