document.addEventListener("DOMContentLoaded", async function () {
  companyDropdown = document.getElementById("ACC_company_input");
  roleDropdown = document.getElementById("ACC_input_5");
  projectDropdown = document.getElementById('ACC_project_input');

  // Projects are multi-select (chips), handled by addProject / removeProject in
  // getinfo.js — there is no native 'change' event on the hidden project select.

  companyDropdown.addEventListener("change", async function () {
    // The Company dropdown is now a UNION across the selected projects, so its
    // option value is the company NAME (project-specific IDs are resolved per
    // project at submit time).
    selectedCompanyNameOption = companyDropdown.value;
    sessionStorage.setItem("selectedCompanyName", selectedCompanyNameOption);

    // Changing (or clearing) the company invalidates any previously chosen role.
    if (typeof resetCompanyDownstream === "function") resetCompanyDownstream();
    selectedCompanyNameOption = companyDropdown.value;

    if (!selectedCompanyNameOption) return;

    console.log(selectedCompanyNameOption);
    // Roles are tagged to the user's business unit (i.e. the selected company).
    // The same role can exist once per BU (e.g. "Temporary Works Co-ordinator"
    // for both Aureos Renewables and Aureos Transmission), each with different
    // folder/admin access. Match the role list against the SELECTED COMPANY's
    // BU code. Guard the lookup: if it misses, fall back to no bu_code rather
    // than crashing.
    const matchedCompanyBU = aureosBUs.filter(item => item.bu_name == selectedCompanyNameOption)
    // Rail split into six discipline BUs, but the Rail roles are still tagged to
    // the original "AUR" code. Picking matchedCompanyBU[0] would grab an arbitrary
    // discipline (OLE/AEP/...) and filter the dropdown to just that slice, so
    // collapse any Rail company back to AUR to show the full Rail role list.
    const rawBuCode = matchedCompanyBU[0] && matchedCompanyBU[0].bu_code;
    const buCode = resolveBuCode(selectedCompanyNameOption, rawBuCode);
    const filteredRoles = await filterRoles(rolesData, selectedCompanyNameOption, buCode)
    await populateRoles(filteredRoles)

    document.getElementById("ACC_input_5").disabled = false;
  });

  roleDropdown.addEventListener("change", async function () {
    // The role + justification are shared across every selected project; the
    // project-specific role payload (project-admin / OCRA roles, which depend on
    // each project's BU) is built per project at submit time in formsubmission.js.
    if (!roleDropdown.value) {
      document.getElementById("ACC_justification").disabled = true;
      document.getElementById("ACC_Request_Form_btn").disabled = true;
      document.getElementById("roleAccessDisplay").innerHTML = "";
      return;
    }

    // Unlock the final step. The access-display lookup below can legitimately
    // miss; a miss must never leave the user with a role selected but
    // justification + Submit still greyed out.
    document.getElementById("ACC_justification").disabled = false;
    document.getElementById("ACC_Request_Form_btn").disabled = false;

    const mainAureosRole = rolesData.find((r) => r.role === roleDropdown.value);
    if (mainAureosRole) {
      await createRoleAccessDisplay(mainAureosRole);
    } else {
      document.getElementById("roleAccessDisplay").innerHTML = "";
    }
  });
});

// Auto-populate First / Last name from the email's local part, e.g.
// "josh.cole@aureos.com" -> First: "Josh", Last: "Cole". Splits on . _ -, strips
// digits, and only writes to a field that is empty or still holds a value this
// function previously set (so manual edits are never overwritten).
function autofillNamesFromEmail() {
  const emailEl = document.getElementById("ACC_input_7");
  const firstEl = document.getElementById("ACC_first_6");
  const lastEl = document.getElementById("ACC_last_6");
  if (!emailEl || !firstEl || !lastEl) return;

  const email = (emailEl.value || "").trim();
  const at = email.indexOf("@");
  if (at <= 0) return;

  const tokens = email
    .slice(0, at)
    .split(/[._\-]+/)
    .map((t) => t.replace(/[^a-zA-Z]/g, ""))
    .filter(Boolean);
  if (!tokens.length) return;

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const first = cap(tokens[0]);
  const last = tokens.length > 1 ? tokens.slice(1).map(cap).join(" ") : "";

  applyIfUntouched(firstEl, first);
  applyIfUntouched(lastEl, last);
}

function applyIfUntouched(el, value) {
  const prevAuto = el.dataset.autofilled || "";
  if (el.value === "" || el.value === prevAuto) {
    el.value = value;
    el.dataset.autofilled = value;
  }
}

async function createRoleAccessDisplay(roleData) {
  const roleAccessDisplay = document.getElementById("roleAccessDisplay")
  if (!roleData || !Array.isArray(roleData.folderAccess)) {
    roleAccessDisplay.innerHTML = ""
    return
  }
  roleAccessDisplay.innerHTML = '<p>The role you have select will have access to the folders listed below</p>'
  const roleFolders = roleData.folderAccess.sort((a, b) => a.Value.localeCompare(b.Value))
  
  roleFolders.forEach(element => {
    const folder = document.createElement("div");
    folder.classList.add('folder-name');
    folder.textContent = element.Value;
    roleAccessDisplay.appendChild(folder)
  });

}

async function populateRoles(role_array) {
  // Clear existing options
  roleDropdown.innerHTML = '<option value=""></option>';

  role_array.forEach((role) => {
    const option = document.createElement("option");
    option.value = role.role;
    option.text = role.role;
    roleDropdown.add(option);
  });
}

async function filterRoles(role_array,company,bu_code) {
    let returnData
    if(company.includes("Aureos")){
        const filtered_array = role_array.filter(item => item.external_or_internal == "Internal")
        // console.log(filtered_array,bu_code)
        let tempRoleArray = []
        filtered_array.forEach(element => {
            
            if(element.bu.filter(item => item.Value.includes(bu_code)).length != 0){
                tempRoleArray.push(element)
            } 
        });
        returnData = tempRoleArray
    }else{
        returnData = role_array.filter(item => item.external_or_internal == "External")
    }
    console.log("Filtered Roles",returnData)
    return returnData
}