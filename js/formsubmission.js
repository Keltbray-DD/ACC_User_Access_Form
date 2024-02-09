
// ACC Access Request form

async function checkSelectedOptions() {
  const FirstNameInput = document.getElementById('ACC_first_6');
  const LastNameInput = document.getElementById('ACC_last_6');
  const EmailInput = document.getElementById('ACC_input_7');
  const sectorDropdown = document.getElementById('ACC_input_3');
  const marketDropdown = document.getElementById('ACC_input_4');
  const roleDropdown = document.getElementById('ACC_input_5');

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
  postUserToSP()
}

async function postUserToSP(){

  const bodyData = {
        Email: $("#ACC_input_7").val(),
        Name: $("#ACC_first_6").val()+" "+$("#ACC_last_6").val(),
        Sector: $("#ACC_input_3").val(),
        Market: $("#ACC_input_4").val(),
        ProjectRole: $("#ACC_input_5").val(),
        PMEmail: sessionStorage.getItem('PM_Email'),
        IMEmail: sessionStorage.getItem('IM_Email'),
        DCEmail: sessionStorage.getItem('DC_Email'),
        Project: sessionStorage.getItem('selectedProjectName'),
        ProjectID: sessionStorage.getItem('selectedProjectID'),
      };

  const headers = {
    'Content-Type':"application/json",
  };

  const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyData)
  };

  const apiUrl = "https://prod-01.uksouth.logic.azure.com:443/workflows/aab4903ff9134198b2d8fc8155540935/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rQYpFtt5DRGFd6hV62APsRjOVbjC2oGA-ZdxG1Wu3Fo";
  //console.log(apiUrl)
  console.log(requestOptions)
  signedURLData = await fetch(apiUrl,requestOptions)




  return signedURLData
  }

$(document).ready(function() {
    $('#ACC_Request_Form').click(function() {
      var formData = {
        Email: $("#ACC_input_7").val(),
        Name: $("#ACC_first_6").val()+" "+$("#ACC_last_6").val(),
        Sector: $("#ACC_input_3").val(),
        Market: $("#ACC_input_4").val(),
        Internal_External: sessionStorage.getItem('selectedValue'),
        OCRARoles:"Originator, Checker",
        ProjectRole: $("#ACC_input_5").val(),
        PMEmail: sessionStorage.getItem('PM_Email'),
        IMEmail: sessionStorage.getItem('IM_Email'),
        DCEmail: sessionStorage.getItem('DC_Email'),
        Project: sessionStorage.getItem('ProjectName'),
      };
      $.ajax({
        contentType:"application/json",
        type:"POST",
          url:"https://prod-01.uksouth.logic.azure.com:443/workflows/aab4903ff9134198b2d8fc8155540935/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rQYpFtt5DRGFd6hV62APsRjOVbjC2oGA-ZdxG1Wu3Fo",
          data: JSON.stringify(formData),
          success: function(data){
            $("postResult").val("Success")
            //alert("Form submitted");
            window.location.href = "../pages/accsubmission.html"
          },
          error: function(){
            $("postResult").val("Failed")
          }
    });
  })
  });

// FAQ Question submit form

  $(document).ready(function() {
    $('#FAQ_Submit_btn').click(function() {
      var formData = {
        Question: $("#FAQ_Question").val(),
        UserEmail:"josh.cole@keltbray.com",
        Project: sessionStorage.getItem('ProjectName'),
      };
      $.ajax({
        contentType:'application/json',
        type:"POST",
          url:"https://prod-07.uksouth.logic.azure.com:443/workflows/b8024d387e4a42f9ab253fdbbbac88cb/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5mAH0-RnaIC7K9REiCS9OF36NatbGqlGsWnAYNbGSGI",
          data: JSON.stringify(formData),
          success: function(data){
            $("postResult").val("Success")
            off();
            document.getElementById("faqform").reset()
          },
          error: function(){
            $("postResult").val("Failed")
            alert("Failed to submit FAQ form")
          }
    });
  })
  });

// Lessons Learnt submit form

  $(function(){
    $('#LessonsLearnt_Submit_btn').click(function() {
      var formData = {
        LessonLearntTitle: $("#LessonLearntTitle").val(),
        EventType: $("#EventType").val(),
        ActualConsequence: $("#ActualConsequence").val(),
        PotentialConsequence: $("#PotentialConsequence").val(),
        IncidentDescription: $("#IncidentDescription").val(),
        IncidentAnalysis: $("#IncidentAnalysis").val(),
        ImmediateCause: $("#ImmediateCause").val(),
        UnderlyingCause: $("#UnderlyingCause").val(),
        RootCause: $("#RootCause").val(),
        Approver: sessionStorage.getItem('PM_Email'),
        Project: sessionStorage.getItem('ProjectName'),
      };
      $.ajax({
        contentType:'application/json',
        type:"POST",
          url:"https://prod-27.uksouth.logic.azure.com:443/workflows/c099d88312c74741b000dc17f2ff53d6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=1WgONoFRmmu5Bqevg_3i-K1rQs3anrRb84TQBXREnWU",
          data: JSON.stringify(formData),
          success: function(data){
            $("postResult").val("Success")
            off();
            document.getElementById("llform").reset()
          },
          error: function(){
            $("postResult").val("Failed")
            alert("Failed to submit lessons learnt form")
          }
    });
  })
  });

// Project Induction Sign off Form

  function submitSignOff_PI(){
    var formData = {
            Email: $("#userEmail").val(),
            Induction_Type: "Project Scheme 3a Induction",
            Project: sessionStorage.getItem('ProjectName'),
            IM_Email: sessionStorage.getItem('IM_Email'),
            OM_Email:sessionStorage.getItem('OM_Email'),
    };
    $.ajax({
            contentType:'application/json',
            type:"POST",
              url:"https://prod-25.uksouth.logic.azure.com:443/workflows/7ee24c1283d8475487324472bee20eb6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-UzVROSDFsLlwDnhMYluAgVg2e2HGH8oCEHAzbcgNBM",
              data: JSON.stringify(formData),
              success: function(data){
                $("postResult").val("Success")
                window.location.href = '../pages/inductionsubmission.html';
              },
              error: function(){
                $("postResult").val("Failed")
              }
    });
  }

// Schemewide Induction Sign off form

function submitSignOff_SWI(){
  var formData = {
          Email: $("#userEmail").val(),
          Induction_Type: "Project Schemewide Induction",
          Project: sessionStorage.getItem('ProjectName'),
          IM_Email: sessionStorage.getItem('IM_Email'),
          OM_Email: sessionStorage.getItem('OM_Email'),
  };
  $.ajax({
          contentType:'application/json',
          type:"POST",
            url:"https://prod-25.uksouth.logic.azure.com:443/workflows/7ee24c1283d8475487324472bee20eb6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-UzVROSDFsLlwDnhMYluAgVg2e2HGH8oCEHAzbcgNBM",
            data: JSON.stringify(formData),
            success: function(data){
              $("postResult").val("Success")
              window.location.href = '../pages/inductionsubmission.html';
            },
            error: function(){
              $("postResult").val("Failed")
            }

  });
  window.location.href = '../pages/home.html';
}