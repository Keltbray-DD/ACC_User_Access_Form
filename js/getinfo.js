//rolesData = JSON.parse(sessionStorage.getItem(ProjectRoles));

document.addEventListener('DOMContentLoaded', async function() {
  // JavaScript code here
  marketDropdown = document.getElementById('ACC_input_4');
  roleDropdown = document.getElementById('ACC_input_5');
  ACC_project_input_dropdown = document.getElementById('ACC_project_input');
  document.getElementById("appInfo").textContent = `${appName} ${appVersion}`;
  loadingScreen = document.getElementById('loadingScreen');

  // Add the change event listener
  ACC_project_input_dropdown.addEventListener('change', function() {
    // Get the selected value
    const selectedValue = ACC_project_input_dropdown.value;
    getProjectDetails(selectedValue)
    // Perform an action based on the selected value
    console.log('Selected value:', selectedValue);
  });

  initalStartUp()
  async function initalStartUp(){
    await showLoadingScreen(loadingScreen)
    try{
      accessToken = await getAccessToken("account:read data:read")
    }catch{
      console.log("Error")
    }
    await runGetProjects()
    checkURL()
    await runGetCompanies()
    await runGetRoles()

    await hideLoadingScreen(loadingScreen)
    const enriched = getProjectAdminRoleIdsFor("Project Manager", rolesData, accRoles);
    console.log(enriched);
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
// Select the dropdown element

async function runGetCompanies() {
  CompaniesList = await getCompnaies(accessToken)
  CompaniesList = CompaniesList.sort((a, b) => a.name.localeCompare(b.name))
  console.log("Companies List",CompaniesList)
  sessionStorage.setItem(CompaniesList,JSON.stringify(CompaniesList));

  const companyDropdown = document.getElementById('ACC_company_input');
  companyDropdown.innerHTML = '<option value=""></option>'
  CompaniesList.forEach(project => {
    const option = document.createElement('option');
    option.text = project.name;
    option.value = project.id;
    companyDropdown.add(option);
  });
}

async function runGetProjects() {
  ProjectListRaw = await fetchProjects();
  //console.log("Raw Project List",ProjectListRaw)
  for (let i = 0; i < ProjectListRaw.length; i++) {
    ProjectList.push({
      ProjectName: ProjectListRaw[i].ProjectName,
      ProjectID: ProjectListRaw[i].Title,
    });
  }

  console.log("Filtered Project List", ProjectList);
  sessionStorage.setItem(ProjectList, JSON.stringify(ProjectList));

  const projectDropdown = document.getElementById("ACC_project_input");
  projectDropdown.innerHTML = '<option value=""></option>';
  ProjectList.forEach((project) => {
    const option = document.createElement("option");
    option.text = project.ProjectName;
    option.value = project.ProjectID;
    projectDropdown.add(option);
  });
}

async function runGetRoles() {
  rolesData = await getProjectRoles()
  console.log("Aureos Roles",rolesData);
  await populateRoles();
  accRoles = await getACCRoles()
  console.log("ACC Roles",accRoles);
  console.log("Aureos Roles",rolesData);
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


function getProjectDetails(pID){

  async function fetchData(){

    const bodyData = {
      projectCode: pID,
      };

  const headers = {
      'Content-Type':'application/json'
  };

  const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyData)
  };

    var apiUrl_getProjectDetails = 'https://prod-49.uksouth.logic.azure.com:443/workflows/6aa2657ac7f6493daa4a7d22650501f0/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5joSV1MRVUbO7SK-o15RMdnzSD2w39R-ynkFsTM2Uw0';
    fetch(apiUrl_getProjectDetails,requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log(pID)
        console.log(data);
        let projectdetails = data


        if(projectdetails.length > 0){
          var ProjectName_Local = projectdetails[0].ProjectName;
          sessionStorage.setItem('ProjectName',ProjectName_Local);
  
          let projectManagers = projectdetails[0].Project_Managers || ''
          let documentControllers = projectdetails[0].Document_Controller || ''
          let accessApprovers = projectdetails[0].Access_Approvers || ''
  
          console.log(projectManagers)
          console.log(accessApprovers)
          console.log(documentControllers)

          PM_Email = projectManagers 
          AA_Email = accessApprovers
          DC_Email = documentControllers
          // if (projectManagers) {
          //  emailStringProjectManagers = projectManagers.Email
          // }
          // if (documentControllers) {
          //   emailStringDocumentControllers = documentControllers
          //     .map((user) => user.Email)
          //     .join(", ");
          // }
          // if (accessApprovers) {
          //   emailStringAccessApprovers = accessApprovers
          //     .map((user) => user.Email)
          //     .join(", ");
          // }

          // console.log(emailStringProjectManagers)
          // console.log(emailStringDocumentControllers)
          // console.log(emailStringAccessApprovers)

          // PM_Email = emailStringProjectManagers
          // AA_Email = emailStringAccessApprovers
          // DC_Email = emailStringDocumentControllers

          console.log('PM_Email',PM_Email)
          console.log('AA_Email',AA_Email)
          console.log('DC_Email',DC_Email)
          document.getElementById('projectDetails').innerHTML = `<p><strong>Project Approvers: </strong>${AA_Email}</p>`
        } else{
          sessionStorage.setItem('PM_Email',"");
          sessionStorage.setItem('DC_Email',"");
          sessionStorage.setItem('Approvers_Email_Local',"");
          console.log("No details found")
          alert("No data found for the selected project, please contact accsupportdigital@keltbray.com if you require access to this project")
          
          const SubmitButton = document.getElementById('ACC_Request_Form_btn');
          //console.log(SubmitButton)
          SubmitButton.disabled = true
          //location.reload()
        }


      })
      .catch(error => console.error('Error fetching data:', error));
  }

  fetchData()

}

async function getProjectRoles(){
      var apiUrl_getProjectRoles = 'https://prod-07.uksouth.logic.azure.com:443/workflows/38dde2d38944467ead65e2349ef9867d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fdBObPGteUBN6_WeI3A1eQMkhGaGrjh1RkydvSYkHQQ';
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
async function populateRoles() {

    // Clear existing options
    roleDropdown.innerHTML = '<option value=""></option>';

      rolesData.forEach(role => {
        const option = document.createElement('option');
        option.value = role.role;
        option.text = role.role;
        roleDropdown.add(option);
      });
  }

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

  const apiUrl = "https://prod-30.uksouth.logic.azure.com:443/workflows/df0aebc4d2324e98bcfa94699154481f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jHsW0eISklveK7XAJcG0nhfEnffX62AP0mLqJrtLq9c";
  //console.log(apiUrl)
  //console.log(requestOptions)
  signedURLData = await fetch(apiUrl,requestOptions)
      .then(response => response.json())
      .then(data => {
          const JSONdata = data

      //console.log(JSONdata)

      return JSONdata.access_token
      })
      .catch(error => console.error('Error fetching data:', error));


  return signedURLData
  }

  async function getCompnaies(AccessToken){

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

    const apiUrl = "https://developer.api.autodesk.com/hq/v1/regions/eu/accounts/"+account_id+"/companies?limit=100";
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

  // Function to set the default selected value
  function setDefaultSelectedValue(id) {
    var dropdown = document.getElementById('ACC_project_input');
    var defaultValue = id; // Replace '456' with the desired default value
    console.log(defaultValue)
    for (var i = 0; i < dropdown.options.length; i++) {
      console.log(dropdown.options[i].value)
        if (dropdown.options[i].value === defaultValue) {
            dropdown.options[i].selected = true;
            let selectedProjectNameOption = dropdown.options[dropdown.selectedIndex].innerText;
            sessionStorage.setItem('selectedProjectName', selectedProjectNameOption);
            console.log()
            let selectedProjectIDOption = dropdown.value;
            console.log(selectedProjectIDOption)

            sessionStorage.setItem('selectedProjectID', selectedProjectIDOption);

            getProjectDetails(defaultValue)
            break;
        }
    }
}