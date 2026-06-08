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

  // [{ name, value }] from the select's current options (skip the empty placeholder).
  const options = () =>
    Array.from(select.options)
      .filter((o) => o.value !== "")
      .map((o) => ({ name: o.text, value: o.value }));

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

  // Commit a pick: reflect the name in the box and drive the hidden <select>.
  function commit(opt) {
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
    const matches = q ? all.filter((o) => o.name.toLowerCase().includes(q)) : all;
    if (!matches.length) {
      list.innerHTML = '<div class="combo-empty">No matches</div>';
      return;
    }
    list.innerHTML = "";
    matches.slice(0, 200).forEach((o) => {
      const row = document.createElement("div");
      row.className = "combo-row";
      row.textContent = o.name;
      row.addEventListener("mousedown", (ev) => ev.preventDefault()); // keep input focus on click
      row.addEventListener("click", () => commit(o));
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
  document.addEventListener("click", (e) => { if (!combo.contains(e.target)) close(); });

  // Keep the box in step with the select: enabled only when the select is
  // enabled and has options; text follows the committed selection.
  function sync() {
    const count = options().length;
    const ready = !select.disabled && count > 0;
    input.disabled = !ready;
    input.value = selectedText();
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
