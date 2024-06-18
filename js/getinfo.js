let projectdetails
let PM_Email
let APM_Email
let DM_Email
let ADM_Email
let HM_Email
let QM_Email
let AQM_Email
let IM_Email
let DC_Email
let ProjectRoles
let ProjectList =[]
let ProjectListRaw
let projectListDetails =[]
let ACC_project_input_dropdown
let marketDropdown
let roleDropdown
let rolesData

const hubID = "b.24d2d632-e01b-4ca0-b988-385be827cb04"
const account_id = "24d2d632-e01b-4ca0-b988-385be827cb04"

//rolesData = JSON.parse(sessionStorage.getItem(ProjectRoles));

document.addEventListener('DOMContentLoaded', function() {
  // JavaScript code here
  marketDropdown = document.getElementById('ACC_input_4');
  roleDropdown = document.getElementById('ACC_input_5');
  ACC_project_input_dropdown = document.getElementById('ACC_project_input');

  loadingScreen = document.getElementById('loadingScreen');
  // Show the loading screen
  function showLoadingScreen() {
      loadingScreen.style.display = 'flex';
  }
  // Add the change event listener
  ACC_project_input_dropdown.addEventListener('change', function() {
    // Get the selected value
    const selectedValue = ACC_project_input_dropdown.value;
    getProjectDetails(selectedValue)
    // Perform an action based on the selected value
    console.log('Selected value:', selectedValue);
  });

  // Hide the loading screen
  async function hideLoadingScreen() {
      loadingScreen.style.display = 'none';
  }
  initalStartUp()
  async function initalStartUp(){

    await listProjects()
    checkURL()
    rolesData = await getProjectRoles()
    console.log("ACC Roles",rolesData);
    filterRoles();
    hideLoadingScreen()
  }
});
// Select the dropdown element





//getRawProjectList()

async function getProjects(AccessToken){

  const bodyData = {

      };

  const headers = {
      'Authorization':"Bearer "+AccessToken,
      'Content-Type':'application/json'
  };

  const requestOptions = {
      method: 'GET',
      headers: headers,
      //body: JSON.stringify(bodyData)
  };

  const apiUrl = "https://developer.api.autodesk.com/project/v1/hubs/"+hubID+"/projects";
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


async function listProjects(){
  try{
    accessToken = await getAccessToken("account:read")
  }catch{
    console.log("Error")
  }
  try{
    accessTokenDataRead = await getAccessToken("data:read")
  }catch{
    console.log("Error")
  }
  ProjectListRaw = await getProjects(accessTokenDataRead)
  console.log("Raw Project List",ProjectListRaw.data)
  for(let i = 0; i < ProjectListRaw.data.length; i++){
    ProjectList.push({'ProjectName':ProjectListRaw.data[i].attributes.name,'ProjectID':ProjectListRaw.data[i].id})
}
  CompaniesList = await getCompnaies(accessToken)
  CompaniesList = CompaniesList.sort((a, b) => a.name.localeCompare(b.name))

  console.log("Filtered Project List",ProjectList)
  sessionStorage.setItem(ProjectList,JSON.stringify(ProjectList));
  console.log("Companies List",CompaniesList)
  sessionStorage.setItem(CompaniesList,JSON.stringify(CompaniesList));

  const projectDropdown = document.getElementById('ACC_project_input');
  projectDropdown.innerHTML = '<option value=""></option>'
  ProjectList.forEach(project => {
    const option = document.createElement('option');
    option.text = project.ProjectName;
    option.value = project.ProjectID;
    projectDropdown.add(option);
  });

  const companyDropdown = document.getElementById('ACC_company_input');
  companyDropdown.innerHTML = '<option value=""></option>'
  CompaniesList.forEach(project => {
    const option = document.createElement('option');
    option.text = project.name;
    option.value = project.id;
    companyDropdown.add(option);
  });
}


function getProjectDetails(pID){

  async function fetchData(){
    var apiUrl_getProjectDetails = 'https://prod-28.uksouth.logic.azure.com:443/workflows/5bd3209073b748bc8b0089d5a52e5670/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Jyr6aOn2mx8vnBHIhhlJBsJU3d-4-3T2I_WWWBiTUUw';
    fetch(apiUrl_getProjectDetails)
      .then(response => response.json())
      .then(data => {
        console.log(pID)
        console.log(data);
        let projectdetails = []
        for (let i= 0; i < data.length; i++) {
          //console.log(data[i].ProjectID)
          //console.log(sessionStorage.getItem('selectedProjectID'))
          if (data[i].ProjectID === pID) {
            projectdetails = [...projectdetails, data[i]];
          }
        }
        if(projectdetails.length > 0){
          var ProjectName_Local = projectdetails[0].ProjectName;
          sessionStorage.setItem('ProjectName',ProjectName_Local);
  
          //document.getElementById('IMEmail').innerHTML = sessionStorage.getItem('ProjectName');
          var IM_Email_Local = projectdetails[0].IM;
          sessionStorage.setItem('IM_Email',IM_Email_Local);
          //document.getElementById('IMEmail').innerHTML = sessionStorage.getItem('IM_Email');
          var PM_Email_Local = projectdetails[0].PM;
          sessionStorage.setItem('PM_Email',PM_Email_Local);
          //document.getElementById('PMEmail').innerHTML = sessionStorage.getItem('PM_Email');
          var DC_Email_Local = projectdetails[0].DC;
          sessionStorage.setItem('DC_Email',DC_Email_Local);
          //document.getElementById('DCEmail').innerHTML = sessionStorage.getItem('DC_Email');
          var DM_Email_Local = projectdetails[0].DM;
          sessionStorage.setItem('DM_Email',DM_Email_Local);
          //document.getElementById('DMEmail').innerHTML = sessionStorage.getItem(DM_Email);
          var ADM_Email_Local = projectdetails[0].ADM;
          sessionStorage.setItem('ADM_Email',ADM_Email_Local);
          //document.getElementById('ADMEmail').innerHTML = sessionStorage.getItem(ADM_Email);
          var QM_Email_Local = projectdetails[0].QM;
          sessionStorage.setItem('QM_Email',QM_Email_Local);
          //document.getElementById('QMEmail').innerHTML = sessionStorage.getItem(QM_Email);
          var AQM_Email_Local = projectdetails[0].AQM;
          sessionStorage.setItem('AQM_Email',AQM_Email_Local);
          //document.getElementById('AQMEmail').innerHTML = sessionStorage.getItem(AQM_Email);
          var HM_Email_Local = projectdetails[0].HM;
          sessionStorage.setItem('HM_Email',HM_Email_Local);
          //document.getElementById('HMEmail').innerHTML = sessionStorage.getItem(HM_Email);
          var OM_Email_Local = projectdetails[0].OM;
          sessionStorage.setItem('OM_Email',OM_Email_Local);
          //document.getElementById('HMEmail').innerHTML = sessionStorage.getItem(HM_Email);
          console.log("Project Details List",projectdetails);
        } else{
          sessionStorage.setItem('IM_Email',"");
          sessionStorage.setItem('PM_Email',"");
          sessionStorage.setItem('DC_Email',"");
          sessionStorage.setItem('DM_Email',"");
          sessionStorage.setItem('ADM_Email',"");
          sessionStorage.setItem('QM_Email',"");
          sessionStorage.setItem('AQM_Email',"");
          sessionStorage.setItem('HM_Email',"");
          sessionStorage.setItem('OM_Email',"");
          console.log("No details found")
          alert("No data found for the selected project, please contact accsupportdigital@keltbray.com if you require access to this project")
          
          const SubmitButton = document.getElementById('ACC_Request_Form_btn');
          //console.log(SubmitButton)
          SubmitButton.disabled = true
          location.reload()
        }


      })
      .catch(error => console.error('Error fetching data:', error));
  }

  fetchData()

}

async function getProjectRoles(){
      var apiUrl_getProjectRoles = 'https://prod-21.uksouth.logic.azure.com:443/workflows/e56b0f45849e4042bbb0619e6d98048c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NyZXTcmNXZbbC5TioPESi5D7nlG0_xvB5jlyeLVVSQ0';
      data = fetch(apiUrl_getProjectRoles)
        .then(response => response.json())
        .then(data => {
          //console.log(data)
            let projectRoles_Local = []
            for (let i= 0; i < data.length; i++) {
              if (data[i].IsRole==="1" && data[i].Required ==="Y") {
                projectRoles_Local = [...projectRoles_Local, data[i]];
              }
            }
            sessionStorage.setItem(ProjectRoles,JSON.stringify(projectRoles_Local));
            //console.log(data);
            return projectRoles_Local
        })
        .catch(error => console.error('Error fetching data:', error));
        return data
    }


  // Function to filter roles based on selected market
function filterRoles() {
    //console.log(marketDropdown)
    const selectedMarket = marketDropdown.value;
    // Clear existing options
    roleDropdown.innerHTML = '<option value=""></option>';
    if(selectedMarket){
      console.log(selectedMarket)
      const filteredRoles = rolesData.filter(role => role.Market === selectedMarket || (selectedMarket === 'Rail' && role.Market === 'All') || (selectedMarket === 'Energy' && role.Market === 'All')|| (selectedMarket === 'Highways' && role.Market === 'All'));

      // Populate the role dropdown with filtered roles
      filteredRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.Role;
        option.text = role.Role;
        roleDropdown.add(option);
      });
    }else{
      rolesData.forEach(role => {
        const option = document.createElement('option');
        option.value = role.Role;
        option.text = role.Role;
        roleDropdown.add(option);
      });
    }



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

  const apiUrl = "https://prod-18.uksouth.logic.azure.com:443/workflows/d8f90f38261044b19829e27d147f0023/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-N-bYaES64moEe0gFiP5J6XGoZBwCVZTmYZmUbdJkPk";
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

async function generateTokenAccountRead(clientId,clientSecret){
  const bodyData = {
  client_id: clientId,
  client_secret: clientSecret,
  grant_type:'client_credentials',
  scope:'account:read'
  };

  var formBody = [];
  for (var property in bodyData) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(bodyData[property]);
      formBody.push(encodedKey + "=" + encodedValue);
  };
  formBody = formBody.join("&")

  const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
  };

  const requestOptions = {
      method: 'POST',
      headers: headers,
      body: formBody,
  };
  const apiUrl = 'https://developer.api.autodesk.com/authentication/v1/authenticate';
  //console.log(requestOptions)
  AccessToken_Local = await fetch(apiUrl,requestOptions)
      .then(response => response.json())
      .then(data => {
      //console.log(data)
      //console.log(data.access_token)
      return data.access_token
      })
      .catch(error => console.error('Error fetching data:', error));
      return AccessToken_Local
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
    signedURLData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data

        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return signedURLData
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
    var defaultValue = "b."+id; // Replace '456' with the desired default value
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