//rolesData = JSON.parse(sessionStorage.getItem(ProjectRoles));

document.addEventListener('DOMContentLoaded', async function() {
  // JavaScript code here
  marketDropdown = document.getElementById('ACC_input_4');
  roleDropdown = document.getElementById('ACC_input_5');
  ACC_project_input_dropdown = document.getElementById('ACC_project_input');
  document.getElementById("appInfo").textContent = `${appName} ${appVersion}`;
  loadingScreen = document.getElementById('loadingScreen');

  // Projects are now multi-select: the hidden <select> is only the search
  // source for the combobox, and picks are handled by addProject / removeProject
  // (driven from searchableSelect.js), not a native 'change' event.

  initalStartUp()
  async function initalStartUp(){
    await showLoadingScreen(loadingScreen)
    setLoadingStep('auth', 'active')
    try{
      accessToken = await getAccessToken("account:read data:read")
    }catch{
      console.log("Error")
    }
    setLoadingStep('auth', 'done')

    setLoadingStep('projects', 'active')
    await runGetProjects()
    checkURL()
    setLoadingStep('projects', 'done')

    setLoadingStep('bus', 'active')
    await runGetAureosBUs()
    setLoadingStep('bus', 'done')

    setLoadingStep('roles', 'active')
    await runGetRoles()
    setLoadingStep('roles', 'done')

    await hideLoadingScreen(loadingScreen)
    // const enriched = getProjectAdminRoleIdsFor("Project Manager", rolesData, accRoles);
    // console.log(enriched);
  }
});

  // Show the loading screen
  async function showLoadingScreen(element) {
    element.style.display = 'flex';
}
  // Hide the loading screen
  async function hideLoadingScreen(element) {
    element.style.display = 'none';
  }

  // Mark a startup step as pending / active / done in the loading checklist.
  function setLoadingStep(stepId, stateName) {
    const li = document.querySelector(`#loadingSteps [data-step="${stepId}"]`);
    if (!li) return;
    li.classList.remove('pending', 'active', 'done');
    li.classList.add(stateName);
    const icon = li.querySelector('.step-icon');
    if (icon) icon.textContent = stateName === 'done' ? '✓' : '';
  }
// Select the dropdown element

// Fetch the ACC company list for a single project and return it as a sorted
// [{ name, id }] array (used to build the per-project Company union). Each
// project has its own company list with project-specific company IDs.
async function fetchProjectCompanies(projectID) {
  const companies = await getCompnaies(accessToken, projectID);
  if (!Array.isArray(companies)) return [];
  return companies
    .map((c) => ({ name: c.name, id: c.id }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

// Fetch a single project's approvers (Project Managers / Access Approvers /
// Document Controllers) from the Power Automate flow. Returns
// { ProjectName, PM, AA, DC } or null when the flow reports no data for the
// project (in which case that project is skipped at submit).
async function fetchProjectApprovers(projectID) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectCode: projectID })
  };
  const apiUrl_getProjectDetails = 'https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6aa2657ac7f6493daa4a7d22650501f0/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8EtCrlcGu4TjxhRuJMR1kp6aS8iX_nlvYvddpBX0IRE';
  try {
    const response = await fetch(apiUrl_getProjectDetails, requestOptions);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        ProjectName: data[0].ProjectName,
        PM: data[0].Project_Managers || '',
        AA: data[0].Access_Approvers || '',
        DC: data[0].Document_Controller || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching approvers for', projectID, error);
    throw error;
  }
}

// -------------------------------------------------------------------------
// Multi-project selection: add / remove projects, render chips + approvers,
// and keep the Company dropdown as a distinct union across selected projects.
// -------------------------------------------------------------------------

async function addProject(projectID, projectName) {
  if (selectedProjects.some((p) => p.ProjectID === projectID)) return;

  const entry = {
    ProjectID: projectID,
    ProjectName: projectName,
    buCode: (projectName || "").substring(0, 3),
    companies: [],
    approvers: null,
    loading: true,
    error: null
  };
  selectedProjects.push(entry);
  renderProjectChips();
  renderProjectApprovers();
  unlockIdentityFields();

  try {
    const [companies, approvers] = await Promise.all([
      fetchProjectCompanies(projectID),
      fetchProjectApprovers(projectID)
    ]);
    entry.companies = companies;
    entry.approvers = approvers;
    entry.error = approvers ? null : 'noApprovers';
  } catch (err) {
    console.error('Error loading project', projectID, err);
    entry.error = 'loadFailed';
  } finally {
    entry.loading = false;
    renderProjectChips();
    renderProjectApprovers();
    rebuildCompanyUnion();
  }
}

function removeProject(projectID) {
  selectedProjects = selectedProjects.filter((p) => p.ProjectID !== projectID);
  renderProjectChips();
  renderProjectApprovers();
  rebuildCompanyUnion();
}

function unlockIdentityFields() {
  document.getElementById('ACC_first_6').disabled = false;
  document.getElementById('ACC_last_6').disabled = false;
  document.getElementById('ACC_input_7').disabled = false;
  // If an email is already present (e.g. starting another request for yourself),
  // re-validate so the company gate opens without retyping.
  const emailEl = document.getElementById('ACC_input_7');
  if (emailEl.value && typeof validateEmail === 'function') validateEmail();
}

function renderProjectChips() {
  const wrap = document.getElementById('projectChips');
  if (!wrap) return;
  wrap.innerHTML = '';
  selectedProjects.forEach((p) => {
    const chip = document.createElement('span');
    chip.className = 'project-chip'
      + (p.error ? ' project-chip--warn' : '')
      + (p.loading ? ' project-chip--loading' : '');

    const label = document.createElement('span');
    label.className = 'project-chip__label';
    label.textContent = p.ProjectName;
    chip.appendChild(label);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'project-chip__remove';
    remove.setAttribute('aria-label', 'Remove ' + p.ProjectName);
    remove.textContent = '×';
    remove.addEventListener('click', () => removeProject(p.ProjectID));
    chip.appendChild(remove);

    wrap.appendChild(chip);
  });
}

function renderProjectApprovers() {
  const el = document.getElementById('projectDetails');
  if (!el) return;
  if (!selectedProjects.length) { el.innerHTML = ''; return; }

  const rows = selectedProjects.map((p) => {
    const name = escapeHtml(p.ProjectName);
    if (p.loading) {
      return `<p><strong>${name}:</strong> loading approvers…</p>`;
    }
    if (p.error === 'loadFailed') {
      return `<p class="project-detail--warn"><strong>${name}:</strong> ⚠ Could not load project details — this project will be skipped.</p>`;
    }
    if (!p.approvers) {
      return `<p class="project-detail--warn"><strong>${name}:</strong> ⚠ No approver data found — this project will be skipped. Contact accsupportdigital@keltbray.com if you require access.</p>`;
    }
    return `<p><strong>${name} approvers:</strong> ${escapeHtml(p.approvers.AA || '—')}</p>`;
  });
  el.innerHTML = rows.join('');
}

// Rebuild the Company dropdown as the distinct set of company names across all
// selected projects. The option value is the company NAME (company IDs differ
// per project and are resolved at submit time by matching this name in each
// project's own company list).
function rebuildCompanyUnion() {
  const companyDropdown = document.getElementById('ACC_company_input');
  const prevName = (selectedCompanyNameOption || '').toLowerCase();

  const seen = new Map(); // lowercased name -> display name
  selectedProjects.forEach((p) => (p.companies || []).forEach((c) => {
    const key = (c.name || '').toLowerCase();
    if (key && !seen.has(key)) seen.set(key, c.name);
  }));
  const names = Array.from(seen.values()).sort((a, b) => a.localeCompare(b));

  companyDropdown.innerHTML = '<option value=""></option>';
  names.forEach((name) => {
    const option = document.createElement('option');
    option.text = name;
    option.value = name;
    companyDropdown.add(option);
  });

  // Preserve the current company selection if it still exists in the new union,
  // otherwise clear the company + everything downstream of it.
  const stillThere = prevName && seen.has(prevName);
  if (stillThere) {
    companyDropdown.value = seen.get(prevName);
  } else {
    companyDropdown.value = '';
    if (typeof resetCompanyDownstream === 'function') resetCompanyDownstream();
  }

  updateCompanyGate();
}

// The Company dropdown is usable only once there is at least one company to pick
// (i.e. at least one project loaded) AND the requester's email has been
// accepted. Called whenever either precondition changes.
function updateCompanyGate() {
  const companyDropdown = document.getElementById('ACC_company_input');
  const hasOptions = companyDropdown.querySelectorAll('option').length > 1;
  companyDropdown.disabled = !(hasOptions && emailAccepted);
}

// Clear the Company selection and relock everything downstream of it
// (role, justification, submit). Defined here so the company-change handler and
// the union rebuild can share it.
function resetCompanyDownstream() {
  selectedCompanyNameOption = '';
  const role = document.getElementById('ACC_input_5');
  role.value = '';
  role.innerHTML = '<option value=""></option>';
  role.disabled = true;
  document.getElementById('ACC_justification').disabled = true;
  document.getElementById('ACC_Request_Form_btn').disabled = true;
  document.getElementById('roleAccessDisplay').innerHTML = '';
}

async function runGetProjects() {
  ProjectListRaw = await fetchProjects();
  //console.log("Raw Project List",ProjectListRaw)
  for (let i = 0; i < ProjectListRaw.length; i++) {
    ProjectList.push({
      ProjectName: ProjectListRaw[i].ProjectName,
      ProjectID: ProjectListRaw[i].Title,
      ProjectCode: ProjectListRaw[i].ProjectCode,
      buCode: ProjectListRaw[i].ProjectName.substring(0,3)
    });
  }
  ProjectList.sort((a, b) => a.ProjectName.localeCompare(b.ProjectName))
  console.log("Project List", ProjectList);
  sessionStorage.setItem(ProjectList, JSON.stringify(ProjectList));

  const projectDropdown = document.getElementById("ACC_project_input");
  projectDropdown.innerHTML = '<option value=""></option>';
  ProjectList.forEach((project) => {
    const option = document.createElement("option");
    option.text = project.ProjectName;
    option.value = project.ProjectID;
    option.dataset.sub = project.ProjectCode || "";
    projectDropdown.add(option);
  });
}

async function runGetRoles() {
  rolesData = await getProjectRoles()
  rolesData.sort((a, b) => a.role.localeCompare(b.role))
  await populateRoles(rolesData);
  accRoles = await getACCRoles()
  console.log("ACC Roles",accRoles);
  console.log("Aureos Roles",rolesData);
}

async function runGetAureosBUs() {
  aureosBUs = await getAureosBUList()
  console.log("Aureos BUs",aureosBUs);
}

function getProjectAdminRoleIdsFor(inputRole, rolesArray, metadataArray) {
  // Find the role entry for the input role
  const matchedRole = rolesArray.find(r => r.role.trim().toLowerCase() === inputRole.trim().toLowerCase());
  if (!matchedRole) return [];

  // Create lookup map for metadata
  const metadataMap = new Map(
    metadataArray.map(item => [item.name.trim().toLowerCase(), item.id])
  );

  // Enrich the projectAdminRoles with their metadata `id`
  const enrichedRoles = matchedRole.projectAdminRoles.map(role => {
    const roleName = role.Value.trim().toLowerCase();
    const roleId = metadataMap.get(roleName) || null;

    return {
      ...role,
      roleId
    };
  });

  return enrichedRoles;
}


async function getProjectRoles(){
      var apiUrl_getProjectRoles = 'https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/38dde2d38944467ead65e2349ef9867d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3CBUvD9tKoADVOfaVPpXjeGPPvkSpBseEFe4DqgqZOE';
      data = fetch(apiUrl_getProjectRoles)
        .then(response => response.json())
        .then(data => {
          //console.log(data)
            // let projectRoles_Local = []
            // for (let i= 0; i < data.length; i++) {
            //   if (data[i].IsRole==="1" && data[i].Required ==="Y") {
            //     projectRoles_Local = [...projectRoles_Local, data[i]];
            //   }
            // }
            // sessionStorage.setItem(ProjectRoles,JSON.stringify(projectRoles_Local));
            //console.log(data);
            return data
        })
        .catch(error => console.error('Error fetching data:', error));
        return data
    }


  // Function to filter roles based on selected market


  async function getACCRoles(){
 
    const headers = {
      'Authorization':"Bearer "+accessToken,
      'Content-Type':'application/json'
    };
  
    const requestOptions = {
        method: 'GET',
        headers: headers,
        //body: JSON.stringify(bodyData)
    };
  
    const apiUrl = `https://developer.api.autodesk.com/hq/v2/regions/eu/accounts/${account_id}/projects/${default_project_id}/industry_roles`;
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
  
        //console.log(JSONdata)
  
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
  
  
    return responseData
    }
  

async function getAccessToken(scopeInput){

  const bodyData = {
      scope: scopeInput,
      };

  const headers = {
      'Content-Type':'application/json'
  };

  const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyData)
  };

  const apiUrl = "https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/df0aebc4d2324e98bcfa94699154481f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=igiodIb-lGf7MTGYIlPATMr-JbyDeztuALW5F6IIaNs";
  //console.log(apiUrl)
  //console.log(requestOptions)
  repsonseData = await fetch(apiUrl,requestOptions)
      .then(response => response.json())
      .then(data => {
          const JSONdata = data

      //console.log(JSONdata)

      return JSONdata.access_token
      })
      .catch(error => console.error('Error fetching data:', error));


  return repsonseData
  }

  async function getCompnaies(AccessToken,projectID){

    const bodyData = {

        };

    const headers = {
        'Authorization':"Bearer "+AccessToken,
        //'Content-Type':'application/json'
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
        //body: JSON.stringify(bodyData)
    };

    const apiUrl = "https://developer.api.autodesk.com/hq/v1/accounts/"+account_id+"/projects/"+projectID+"/companies?limit=100";
    //console.log(apiUrl)
    //console.log(requestOptions)
    repsonseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
            console.log(JSONdata)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return repsonseData
  }
  async function getAureosBUList(){

    const headers = {
        'Content-Type':'application/json'
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/be34064024814312ac95d2ce0ba03b40/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7bEsh2LzW06yCZFpQEQRtkmyJmFtyCPjoeiw747jF7U";
    //console.log(apiUrl)
    //console.log(requestOptions)
    repsonseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
            // console.log(JSONdata)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return repsonseData
  }

  async function getProjectFromURL(){
    // Get the URL of the current page
    var url = window.location.href;

    // Check if the URL contains a parameter named 'id'
    if (url.indexOf('id=') !== -1) {
        // Extract the value of the 'id' parameter
        var id = url.split('id=')[1];

        // Display the extracted ID
        console.log('Extracted ID:', id);

        setDefaultSelectedValue(id)

    } else {
        console.log('No ID parameter found in the URL');
    }
  }

  function checkURL(){
    // Get the query string portion of the URL
    var queryString = window.location.search;

    // Check if the query string contains an 'id' parameter
    if (queryString.includes('id=')) {
        console.log('The URL contains an Project ID parameter');
        getProjectFromURL()
    } else {
        console.log('The URL does not contain an Project ID parameter');
    }
  }

  // Preselect a project passed in the URL (?id=...) by adding it as a chip,
  // exactly as if the user had picked it from the combobox.
  async function setDefaultSelectedValue(id) {
    var dropdown = document.getElementById('ACC_project_input');
    for (var i = 0; i < dropdown.options.length; i++) {
      if (dropdown.options[i].value === id) {
        const name = dropdown.options[i].text;
        if (typeof addProject === 'function') await addProject(id, name);
        break;
      }
    }
}