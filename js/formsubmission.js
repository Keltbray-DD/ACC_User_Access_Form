
// ACC Access Request form

let searchList =[]

// Validate the shared fields, then fan out one request per selected project.
async function checkSelectedOptions() {
  const FirstNameInput = document.getElementById('ACC_first_6');
  const LastNameInput = document.getElementById('ACC_last_6');
  const EmailInput = document.getElementById('ACC_input_7');
  const roleDropdown = document.getElementById('ACC_input_5');
  const companyDropdown = document.getElementById('ACC_company_input');
  const justificationInput = document.getElementById('ACC_justification');

  if (!selectedProjects.length) {
    alert("Please select at least one project.");
    return
  }

  if (FirstNameInput.value === "") {
    alert("Please enter your first name.");
    return
  }

  if (LastNameInput.value === "") {
    alert("Please enter your last name.");
    return
  }

  if (EmailInput.value === "") {
    alert("Please enter your company email.");
    return
  }

  if (companyDropdown.value === "") {
    alert("Please select a company from the dropdown.");
    return
  }

  if (roleDropdown.value === "") {
    alert("Please select an option from the role dropdown.");
    return
  }

  if (justificationInput.value.trim() === "") {
    alert("Please provide a justification for why you require this access.");
    return
  }

  await submitAllRequests()
}

// Submit one access request per selected project, each routed to that project's
// own approvers. The role, company (by name), justification and requester
// identity are shared; the company ID and role payload are resolved per project.
async function submitAllRequests() {
  const btn = document.getElementById('ACC_Request_Form_btn');
  const companyName = document.getElementById('ACC_company_input').value;
  const selectedRole = document.getElementById('ACC_input_5').value;

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  const results = { submitted: [], skipped: [], failed: [] };

  for (const project of selectedProjects) {
    // A project that failed to load, or has no approver data, can't be routed.
    if (!project.approvers) {
      results.skipped.push({
        name: project.ProjectName,
        reason: project.error === 'loadFailed' ? 'could not load project details' : 'no approver data'
      });
      continue;
    }

    // Resolve the chosen company (by name) to this project's own company ID.
    const match = (project.companies || []).find(
      (c) => (c.name || '').toLowerCase() === companyName.toLowerCase()
    );
    if (!match) {
      results.skipped.push({
        name: project.ProjectName,
        reason: `company "${companyName}" is not enrolled on this project`
      });
      continue;
    }

    // Build the role payload against THIS project's BU (project-admin roles are
    // only granted when the project's BU matches the company's BU).
    const roleResult = buildRolesForProject(companyName, project.buCode, selectedRole);

    try {
      const resp = await postUserToSP(project, match.id, companyName, roleResult);
      if (resp && resp.status === 202) {
        results.submitted.push({ name: project.ProjectName });
      } else {
        results.failed.push({ name: project.ProjectName, status: resp && resp.status });
      }
    } catch (err) {
      console.error('Submit failed for', project.ProjectName, err);
      results.failed.push({ name: project.ProjectName });
    }
  }

  btn.textContent = originalText;
  btn.disabled = false;

  showSubmissionSummary(results);
}

// Build the ACC role payload { additionalRoles, roleIDs } for one project.
// Mirrors the original single-project logic: start with the main role, and for
// Aureos companies add project-admin roles (only when the project's BU matches
// the company's BU) and the BU-specific OCRA roles.
function buildRolesForProject(companyName, projectBuCodeRaw, selectedRole) {
  let additionalRolesLocal = [];
  let roleIDsLocal = [];

  const mainRole = accRoles.find((r) => r.name === selectedRole);
  if (mainRole) {
    additionalRolesLocal.push({ name: selectedRole, id: mainRole.id });
    roleIDsLocal.push(mainRole.id);
  } else {
    console.warn("No matching ACC role found for", selectedRole);
  }

  if (companyName && companyName.includes("Aureos")) {
    try {
      const selectedAureosBU = aureosBUs.filter((item) => item.bu_name == companyName);
      // Rail was split into six discipline BUs (OLE/AEP/AEC/SPC/ART/ARL) but the
      // Rail roles are still tagged to the original "AUR" code, so collapse both
      // the project's and the company's BU to "AUR" for any Rail company.
      const companyIsRail = isRailCompany(companyName);
      const projectBuCode = (companyIsRail && RAIL_DISCIPLINE_CODES.includes(projectBuCodeRaw))
        ? RAIL_BU_CODE
        : projectBuCodeRaw;
      const aureosBuCode = companyIsRail
        ? RAIL_BU_CODE
        : (selectedAureosBU[0] && selectedAureosBU[0].bu_code);

      if (projectBuCode && aureosBuCode && projectBuCode == aureosBuCode) {
        const extraRoles = generateAdditionalRolesFor(selectedRole);
        if (extraRoles && extraRoles.length) {
          additionalRolesLocal = extraRoles;
          extraRoles.forEach((role) => roleIDsLocal.push(role.id));
        }
      }

      const ocraRoles = generateOCRARolesFor(selectedRole, companyName);
      if (ocraRoles) {
        ocraRoles.forEach((role) => {
          additionalRolesLocal.push(role);
          roleIDsLocal.push(role.id);
        });
      }
    } catch (err) {
      console.error("Error building additional Aureos roles:", err);
    }
  }

  return { additionalRoles: additionalRolesLocal, roleIDs: roleIDsLocal };
}

function showSuccessModal() {
  document.getElementById("successModal").style.display = "flex";
}
function hideSuccessModal() {
  document.getElementById("successModal").style.display = "none";
}

// Populate the success modal with a per-project breakdown (submitted / skipped /
// failed) and show it.
function showSubmissionSummary(results) {
  const msg = document.getElementById('successMessage');
  const summary = document.getElementById('successSummary');
  const s = results.submitted.length;
  const k = results.skipped.length;
  const f = results.failed.length;
  const total = s + k + f;

  if (msg) {
    if (s === 0) {
      msg.textContent = 'No requests were submitted.';
    } else if (k === 0 && f === 0) {
      msg.textContent = s === 1
        ? "Your request has been sent to the project's approvers for review."
        : `${s} requests have been sent to each project's approvers for review.`;
    } else {
      msg.textContent = `${s} of ${total} request(s) submitted and sent to their project approvers.`;
    }
  }

  if (summary) {
    let html = '';
    if (s) {
      html += '<div class="summary-group summary-group--ok"><strong>Submitted</strong><ul>'
        + results.submitted.map((r) => `<li>${escapeHtml(r.name)}</li>`).join('')
        + '</ul></div>';
    }
    if (k) {
      html += '<div class="summary-group summary-group--warn"><strong>Skipped</strong><ul>'
        + results.skipped.map((r) => `<li>${escapeHtml(r.name)} — ${escapeHtml(r.reason)}</li>`).join('')
        + '</ul></div>';
    }
    if (f) {
      html += '<div class="summary-group summary-group--fail"><strong>Failed — please try again</strong><ul>'
        + results.failed.map((r) => `<li>${escapeHtml(r.name)}</li>`).join('')
        + '</ul></div>';
    }
    summary.innerHTML = html;
  }

  showSuccessModal();
}

// Modal actions. "myself" keeps the requester's name + email so they can raise
// another request without retyping; "someone else" clears everything.
function newRequestForMyself() { startNewForm(true); hideSuccessModal(); }
function newRequestForSomeoneElse() { startNewForm(false); hideSuccessModal(); }

// Reset the form back to its initial, fully-locked state (projects -> email ->
// company -> role). Optionally keep the requester's identity fields.
function startNewForm(keepIdentity) {
  const first = document.getElementById("ACC_first_6");
  const last = document.getElementById("ACC_last_6");
  const email = document.getElementById("ACC_input_7");
  const savedFirst = first.value, savedLast = last.value, savedEmail = email.value;

  document.getElementById("ACC_Access_Request_Form").reset();

  // Clear the multi-project selection + its UI.
  selectedProjects = [];
  if (typeof renderProjectChips === "function") renderProjectChips();
  const projectSearch = document.getElementById("projectSearch");
  if (projectSearch) projectSearch.value = "";

  // Re-lock the cascade exactly as on first load.
  first.disabled = true;
  last.disabled = true;
  email.disabled = true;
  emailAccepted = false;
  delete first.dataset.autofilled;
  delete last.dataset.autofilled;

  const company = document.getElementById("ACC_company_input");
  const role = document.getElementById("ACC_input_5");
  company.innerHTML = '<option value=""></option>';
  company.disabled = true;
  role.innerHTML = '<option value=""></option>';
  role.disabled = true;

  document.getElementById("ACC_justification").disabled = true;
  document.getElementById("ACC_Request_Form_btn").disabled = true;

  // Clear transient UI + state left over from the previous request.
  document.getElementById("message").textContent = "";
  const override = document.getElementById("override");
  if (override) override.style.display = "none";
  document.getElementById("roleAccessDisplay").innerHTML = "";
  document.getElementById("projectDetails").innerHTML = "";
  selectedCompanyNameOption = "";
  additionalRoles = [];
  roleIDsArray = [];

  if (keepIdentity) {
    first.value = savedFirst;
    last.value = savedLast;
    email.value = savedEmail;
  }
}

// Submit a single project's access request to the Power Automate flow. All the
// project-specific routing (approvers, company ID, role payload) is passed in.
async function postUserToSP(project, companyID, companyName, roleResult){
  const approvers = project.approvers || {};
  const bodyData = {
        Email: $("#ACC_input_7").val(),
        Name: $("#ACC_first_6").val()+" "+$("#ACC_last_6").val(),
        firstName:$("#ACC_first_6").val(),
        lastName:$("#ACC_last_6").val(),
        ProjectRole: $("#ACC_input_5").val(),
        Justification: $("#ACC_justification").val(),
        AdditionalRoles: roleResult.additionalRoles,
        roleIDs: roleResult.roleIDs,
        PMEmail: approvers.PM || '',
        AAEmail: approvers.AA || '',
        DCEmail: approvers.DC || '',
        Project: project.ProjectName,
        ProjectID: project.ProjectID,
        Company: companyName,
        CompanyID: companyID,
      };

  const headers = {
    'Content-Type':"application/json",
  };

  const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyData)
  };

  const apiUrl = "https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4d506fa59a2745dca8d9c5a691389862/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=sjqyWoXJXKofdM3HDiZwLIOcayRtjbHmO0QYnqZIUgY";
  console.log(requestOptions)
  const signedURLData = await fetch(apiUrl,requestOptions)
  console.log(signedURLData)

  return signedURLData
  }

  // Build the project-admin ("additional") ACC roles for a given role name.
  function generateAdditionalRolesFor(selectedRole) {
    const role = rolesData.find(p => p.role === selectedRole);
    if (!role) {
      console.log("Role not found");
      return [];
    }
    return role.projectAdminRoles.map(roleName => {
      const accRole = accRoles.find(r => r.name === roleName.Value);
      return accRole ? { name: roleName.Value, id: accRole.id } : null;
    }).filter(item => item !== null);
  }

  // Build the BU-specific OCRA ACC roles for a given role name + company.
  function generateOCRARolesFor(selectedRole, companyName) {
    const role = rolesData.find(p => p.role === selectedRole);
    const companyCode = aureosBUs.find(r => r.bu_name === companyName);
    // Rail OCRA roles are coded under "AUR" even after the Rail BU split.
    const ocraBuCode = resolveBuCode(companyName, companyCode && companyCode.bu_code);
    if (!role) {
      console.log("Role not found");
      return [];
    }
    return role.ocraRoles.map(roleName => {
      const combinedName = `${ocraBuCode}_OCRA_${roleName.Value}`;
      const accRole = accRoles.find(r => r.name === combinedName);
      return accRole ? { name: combinedName, id: accRole.id } : null;
    }).filter(item => item !== null);
  }
