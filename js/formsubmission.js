
// ACC Access Request form

let searchList =[]

async function checkSelectedOptions() {
  const projectDropdown = document.getElementById('ACC_project_input');
  const FirstNameInput = document.getElementById('ACC_first_6');
  const LastNameInput = document.getElementById('ACC_last_6');
  const EmailInput = document.getElementById('ACC_input_7');
  const sectorDropdown = document.getElementById('ACC_input_3');
  const marketDropdown = document.getElementById('ACC_input_4');
  const roleDropdown = document.getElementById('ACC_input_5');
  const companyDropdown = document.getElementById('ACC_company_input');

  if (projectDropdown.value === "") {
    alert("Please select a project from the dropdown.");
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

  if (sectorDropdown.value === "") {
    alert("Please select an option from the Sector dropdown.");
    return
  }

  if (marketDropdown.value === "") {
    alert("Please select an option from the Market dropdown.");
    return
  }

  if (roleDropdown.value === "") {
    alert("Please select an option from the role dropdown.");
    return
  }

  response = await postUserToSP()
  if(response.status === 202){
    alert("Access Request Successfully Submitted")
    resetForm()
  }else{
    alert("Access Request was not Submitted")
  }
}
function resetForm() {
  document.getElementById("ACC_Access_Request_Form").reset()
}
async function postUserToSP(){
  OCRARole_Local = await searchArray($("#ACC_input_5").val());
  console.log(OCRARole_Local)
  const bodyData = {
        Email: $("#ACC_input_7").val(),
        Name: $("#ACC_first_6").val()+" "+$("#ACC_last_6").val(),
        firstName:$("#ACC_first_6").val(),
        lastName:$("#ACC_last_6").val(),
        Sector: $("#ACC_input_3").val(),
        Market: $("#ACC_input_4").val(),
        ProjectRole: $("#ACC_input_5").val(),
        OCRARole: OCRARole_Local,
        PMEmail: sessionStorage.getItem('PM_Email'),
        IMEmail: sessionStorage.getItem('IM_Email'),
        DCEmail: sessionStorage.getItem('DC_Email'),
        Project: sessionStorage.getItem('selectedProjectName'),
        ProjectID: sessionStorage.getItem('selectedProjectID'),
        Company: sessionStorage.getItem('selectedCompanyName'),
        CompanyID: sessionStorage.getItem('selectedCompanyID'),
      };

  const headers = {
    'Content-Type':"application/json",
  };

  const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyData)
  };

  const apiUrl = "https://prod-11.uksouth.logic.azure.com:443/workflows/4d506fa59a2745dca8d9c5a691389862/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fp87OrOP9k2j-mFiKdOfqrcO-FfCIfY3ZwCxCBmNcxo";
  //console.log(apiUrl)
  console.log(requestOptions)
  signedURLData = await fetch(apiUrl,requestOptions)
  console.log(signedURLData)




  return signedURLData
  }

  async function searchArray(selectedValue) {

    searchList = JSON.parse(sessionStorage.getItem(ProjectRoles))
    console.log(searchList)
    //const foundItem = searchList.find(item => item.Role === selectedValue);
    let foundItem;
    console.log("selectedValue:",selectedValue)
    for (let i = 0; i < searchList.length; i++) {
      if (searchList[i].Role === selectedValue) {
        foundItem = searchList[i];
        //break;
      }
    }
    console.log("foundItem:",foundItem)
    if (foundItem) {
      return foundItem.OCRARoles;
    }
  }
