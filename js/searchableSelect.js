// =====================================================================
// Searchable select (combobox) — generic, reused for project / company / role
// =====================================================================
// Turns a native <select> into a type-to-filter combobox while keeping the
// <select> as the hidden source of truth, so all the existing populate / enable
// / change logic keeps working untouched. Picking a row sets the select's value
// and dispatches a 'change' event — exactly like a native selection.
//
// The box mirrors the select's state (its options + its disabled attribute) via
// a MutationObserver, so it enables itself when the list is filled and clears
// when the list is rebuilt — both of which the app already does to the selects
// (e.g. company is repopulated per project, role per company).
//
// Ported from the Aureos TIDP Tool combobox; originally project-only here.
// =====================================================================

function makeSearchableSelect(cfg) {
  const select = document.getElementById(cfg.selectId);
  const input = document.getElementById(cfg.inputId);
  const list = document.getElementById(cfg.listId);
  const combo = document.getElementById(cfg.comboId);
  if (!select || !input || !list || !combo) return;

  let activeIdx = -1;

  // [{ name, value, sub }] from the select's current options (skip the empty
  // placeholder). `sub` is an optional second line, e.g. the project code.
  const options = () =>
    Array.from(select.options)
      .filter((o) => o.value !== "")
      .map((o) => ({ name: o.text, value: o.value, sub: o.dataset.sub || "" }));

  function selectedText() {
    const o = select.options[select.selectedIndex];
    return o && o.value !== "" ? o.text : "";
  }

  const open = () => { if (input.disabled) return; renderList(input.value); list.hidden = false; };
  const close = () => { list.hidden = true; activeIdx = -1; };

  function paintActive(rows) {
    rows.forEach((r, i) => r.classList.toggle("active", i === activeIdx));
    if (rows[activeIdx]) rows[activeIdx].scrollIntoView({ block: "nearest" });
  }

  // Commit a pick. In single mode: reflect the name in the box and drive the
  // hidden <select>. In multi mode: hand the pick to cfg.onCommit (which tracks
  // it elsewhere, e.g. as a chip), clear the search box and keep the list open
  // so more picks can be made in a row.
  function commit(opt) {
    if (cfg.multi) {
      if (typeof cfg.onCommit === "function") cfg.onCommit(opt);
      // Keep the current search text and the list open so the user can pick
      // several matches from one search without re-typing. The just-picked row
      // is re-rendered with a ✓ (click again to remove it).
      renderList(input.value);
      list.hidden = false;
      input.focus();
      return;
    }
    input.value = opt.name;
    close();
    if (select.value !== opt.value) {
      select.value = opt.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function renderList(query) {
    const q = (query || "").trim().toLowerCase();
    const all = options();
    const matches = q
      ? all.filter((o) => o.name.toLowerCase().includes(q) || (o.sub && o.sub.toLowerCase().includes(q)))
      : all;
    if (!matches.length) {
      list.innerHTML = '<div class="combo-empty">No matches</div>';
      return;
    }
    list.innerHTML = "";
    const selectedCheck = cfg.multi && typeof cfg.isSelected === "function";
    matches.slice(0, 200).forEach((o) => {
      const row = document.createElement("div");
      row.className = "combo-row";
      const already = selectedCheck && cfg.isSelected(o.value);
      if (already) row.classList.add("combo-row--selected");

      const main = document.createElement("div");
      main.className = "combo-row__main";
      // In multi mode, show a tick in front of rows that are already chosen.
      main.textContent = already ? "✓ " + o.name : o.name;
      row.appendChild(main);

      if (o.sub) {
        const sub = document.createElement("div");
        sub.className = "combo-row__sub";
        sub.textContent = o.sub;
        row.appendChild(sub);
      }

      row.addEventListener("mousedown", (ev) => ev.preventDefault()); // keep input focus on click
      // Clicking an already-selected row removes it; otherwise it commits.
      if (already) {
        row.addEventListener("click", () => {
          if (typeof cfg.onRemove === "function") cfg.onRemove(o);
          renderList(input.value);
          input.focus();
        });
      } else {
        row.addEventListener("click", () => commit(o));
      }
      list.appendChild(row);
    });
  }

  input.addEventListener("focus", open);
  input.addEventListener("input", () => { activeIdx = -1; open(); });
  input.addEventListener("keydown", (e) => {
    const rows = Array.from(list.querySelectorAll(".combo-row"));
    if (e.key === "ArrowDown") { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, rows.length - 1); paintActive(rows); }
    else if (e.key === "ArrowUp") { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); paintActive(rows); }
    else if (e.key === "Enter") { e.preventDefault(); if (rows[activeIdx]) rows[activeIdx].click(); }
    else if (e.key === "Escape") { close(); }
  });
  document.addEventListener("click", (e) => {
    // Ignore clicks whose target was removed from the DOM by a re-render — in
    // multi mode, picking a row rebuilds the list and detaches the clicked row,
    // so testing combo.contains() on it would wrongly read as an outside click
    // and close the list. A detached target is never a genuine outside click.
    if (!document.contains(e.target)) return;
    if (!combo.contains(e.target)) close();
  });

  // Keep the box in step with the select: enabled only when the select is
  // enabled and has options; text follows the committed selection.
  function sync() {
    const count = options().length;
    const ready = !select.disabled && count > 0;
    input.disabled = !ready;
    // In multi mode the box is a search field that clears after each pick, so
    // never stamp a single "selected" value into it; selections live as chips.
    if (!cfg.multi) input.value = selectedText();
    input.placeholder = ready ? cfg.searchLabel + " " + count + "…" : cfg.waitingPlaceholder;
  }
  new MutationObserver(sync).observe(select, {
    childList: true,
    attributes: true,
    attributeFilter: ["disabled"],
  });
  sync();
}

document.addEventListener("DOMContentLoaded", function () {
  makeSearchableSelect({
    selectId: "ACC_project_input", inputId: "projectSearch", listId: "projectList", comboId: "projectCombo",
    searchLabel: "Search", waitingPlaceholder: "Loading projects…",
    // Projects are multi-select: each pick becomes a chip and drives one access
    // request. addProject / removeProject / selectedProjects live in getinfo.js.
    multi: true,
    onCommit: (opt) => { if (typeof addProject === "function") addProject(opt.value, opt.name); },
    onRemove: (opt) => { if (typeof removeProject === "function") removeProject(opt.value); },
    isSelected: (value) =>
      typeof selectedProjects !== "undefined" &&
      selectedProjects.some((p) => p.ProjectID === value),
  });
  makeSearchableSelect({
    selectId: "ACC_company_input", inputId: "companySearch", listId: "companyList", comboId: "companyCombo",
    searchLabel: "Search", waitingPlaceholder: "Search for your company…",
  });
  makeSearchableSelect({
    selectId: "ACC_input_5", inputId: "roleSearch", listId: "roleList", comboId: "roleCombo",
    searchLabel: "Search", waitingPlaceholder: "Select your company first…",
  });
});
