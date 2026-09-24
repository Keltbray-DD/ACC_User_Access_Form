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
    const selectedProjectDetails = ProjectList.filter(item => item.ProjectID == selectedProjectIDOption)
    const filteredRoles = await filterRoles(rolesData,selectedCompanyNameOption,selectedProjectDetails[0].buCode)
    await populateRoles(filteredRoles)

    document.getElementById("ACC_input_5").disabled = false;
  });

  roleDropdown.addEventListener("change", async function () {
    additionalRoles = [];
    roleIDsArray = [];

    const mainRole = accRoles.find((r) => r.name === roleDropdown.value);
    const mainAureosRole = rolesData.find((r) => r.role === roleDropdown.value);
    additionalRoles.push({ name: roleDropdown.value, id: mainRole.id });
    roleIDsArray.push(mainRole.id);
    const selectedProjectDetails = ProjectList.filter(item => item.ProjectID == selectedProjectIDOption)
    
    if (
      selectedCompanyNameOption &&
      selectedCompanyNameOption.includes("Aureos")
    ) {
        const selectedAureosBU = aureosBUs.filter(item => item.bu_name == selectedCompanyNameOption)
        console.log(selectedProjectDetails[0].buCode, selectedAureosBU[0].bu_code)
        if(selectedProjectDetails[0].buCode == selectedAureosBU[0].bu_code){
            additionalRoles = await generateAdditionalRoles();
            additionalRoles.forEach((role) => {
                roleIDsArray.push(role.id);
            });
        }
      
      ocraRoles = await generateOCRARoles(selectedCompanyNameOption);
      ocraRoles.forEach((role) => {
        additionalRoles.push(role);
        roleIDsArray.push(role.id);
      });
    }

    console.log("additionalRoles", additionalRoles);
    console.log("roleIDsArray", roleIDsArray);
    document.getElementById("ACC_justification").disabled = false;
    document.getElementById("ACC_Request_Form_btn").disabled = false;

    await createRoleAccessDisplay(mainAureosRole)
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