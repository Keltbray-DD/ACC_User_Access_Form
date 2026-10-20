document.addEventListener("DOMContentLoaded", async function () {
  companyDropdown = document.getElementById("ACC_company_input");
  roleDropdown = document.getElementById("ACC_input_5");
  projectDropdown = document.getElementById('ACC_project_input');

    projectDropdown.addEventListener('change', function () {
        selectedProjectNameOption = projectDropdown.options[projectDropdown.selectedIndex].innerText;
        sessionStorage.setItem('selectedProjectName', selectedProjectNameOption);

        selectedProjectIDOption = projectDropdown.value;
        sessionStorage.setItem('selectedProjectID', selectedProjectIDOption);

        console.log(selectedProjectNameOption, selectedProjectIDOption)

        document.getElementById('ACC_first_6').disabled = false
        document.getElementById('ACC_last_6').disabled = false
        document.getElementById('ACC_input_7').disabled = false

        // If the email is already filled (e.g. starting another request for
        // yourself), re-validate it so the company field unlocks without retyping.
        const emailEl = document.getElementById('ACC_input_7');
        if (emailEl.value && typeof validateEmail === 'function') validateEmail();

    });

  companyDropdown.addEventListener("change", async function () {
    let selectedCompanyIDOption =
      companyDropdown.options[companyDropdown.selectedIndex].value;
    sessionStorage.setItem("selectedCompanyID", selectedCompanyIDOption);
    selectedCompanyNameOption =
      companyDropdown.options[companyDropdown.selectedIndex].innerText;
    sessionStorage.setItem("selectedCompanyName", selectedCompanyNameOption);

    console.log(selectedCompanyNameOption, selectedCompanyIDOption);
    // Guard the project lookup: if it misses, reading .buCode used to throw and
    // abort the handler, so the role field never unlocked. Fall back to no
    // bu_code (filterRoles just matches nothing extra) rather than crashing.
    const selectedProjectDetails = ProjectList.filter(item => item.ProjectID == selectedProjectIDOption)
    const buCode = selectedProjectDetails[0] && selectedProjectDetails[0].buCode;
    const filteredRoles = await filterRoles(rolesData, selectedCompanyNameOption, buCode)
    await populateRoles(filteredRoles)

    document.getElementById("ACC_input_5").disabled = false;
  });

  roleDropdown.addEventListener("change", async function () {
    additionalRoles = [];
    roleIDsArray = [];

    // Unlock the final step up front. Everything below is optional enrichment of
    // the request payload (additional / OCRA roles, access display) that depends
    // on data lookups which can legitimately miss; a miss must never leave the
    // user with a role selected but justification + Submit still greyed out.
    document.getElementById("ACC_justification").disabled = false;
    document.getElementById("ACC_Request_Form_btn").disabled = false;

    const mainRole = accRoles.find((r) => r.name === roleDropdown.value);
    const mainAureosRole = rolesData.find((r) => r.role === roleDropdown.value);

    // Only add the main ACC role id when we actually matched one. A name
    // mismatch between the Aureos role list and the ACC role list used to throw
    // on mainRole.id and abort the handler before the unlock above ran.
    if (mainRole) {
      additionalRoles.push({ name: roleDropdown.value, id: mainRole.id });
      roleIDsArray.push(mainRole.id);
    } else {
      console.warn("No matching ACC role found for", roleDropdown.value);
    }

    const selectedProjectDetails = ProjectList.filter(item => item.ProjectID == selectedProjectIDOption)

    if (
      selectedCompanyNameOption &&
      selectedCompanyNameOption.includes("Aureos")
    ) {
      try {
        const selectedAureosBU = aureosBUs.filter(item => item.bu_name == selectedCompanyNameOption)
        const projectBuCode = selectedProjectDetails[0] && selectedProjectDetails[0].buCode;
        const aureosBuCode = selectedAureosBU[0] && selectedAureosBU[0].bu_code;
        console.log(projectBuCode, aureosBuCode)
        if (projectBuCode && aureosBuCode && projectBuCode == aureosBuCode) {
          const extraRoles = await generateAdditionalRoles();
          if (extraRoles) {
            additionalRoles = extraRoles;
            extraRoles.forEach((role) => {
              roleIDsArray.push(role.id);
            });
          }
        }

        const ocraRoles = await generateOCRARoles(selectedCompanyNameOption);
        if (ocraRoles) {
          ocraRoles.forEach((role) => {
            additionalRoles.push(role);
            roleIDsArray.push(role.id);
          });
        }
      } catch (err) {
        console.error("Error building additional Aureos roles:", err);
      }
    }

    console.log("additionalRoles", additionalRoles);
    console.log("roleIDsArray", roleIDsArray);

    if (mainAureosRole) {
      await createRoleAccessDisplay(mainAureosRole)
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