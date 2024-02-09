const folders =[
    "urn:adsk.wipemea:fs.folder:co.zxGPBWfVTxqvS6KYiTFHbQ", // 0C.KELTBRAY - WIP
    "urn:adsk.wipemea:fs.folder:co.tcYHcSUGR-eZyS9zfZ103Q", // 0D.SUB-CONTRACTORs - JACOBS - WIP
    //"urn:adsk.wipemea:fs.folder:co.XUG4NnuhQhitF0EJV3Ta4A", // 0D.SUB-CONTRACTORs - WENTWORTH HOUSE - WIP
    "urn:adsk.wipemea:fs.folder:co.mRskcAmVS420xLXVgxF8ZA", // 0E.SHARED
    "urn:adsk.wipemea:fs.folder:co.7WXxzz59TIeOn-7A3G9LZw", // 0F.CLIENT_SHARED
    "urn:adsk.wipemea:fs.folder:co.eAYof_jAT4CEEWexlbl35w", // 0G.PUBLISHED
    "urn:adsk.wipemea:fs.folder:co.zKkBY6rfQGadO5owcDYKIQ", // 0H.ARCHIVED
]
const clientId = "UMPIoFc8iQoJ2eKS6GsJbCGSmMb4s1PY";
const clientSecret = "3VP1GrzLLvOUoEzu";

const projectID = "7c7ca0c5-bfc3-4ef1-9396-c72c6270f457";
const namingstandardID ="142f8789-4126-5e87-b60e-e1a565ccdb67"

let namingstandard;
let filelist =[];
let arrayprojectPin=[];
let arrayOriginator=[];
let arrayfunction=[];
let arraySpatial=[];
let arrayForm=[];
let arrayDiscipline=[];

getfileslist()
getNamingStandard()

function generateDocName(){
    ProjectPin = document.querySelector('#ProjectPin_input')
    console.log(ProjectPin.value)
    Originator = document.querySelector("#Originator_input")
    console.log(Originator.value)
    vFunction = document.querySelector('#Function_input')
    console.log(vFunction.value)
    Spatial = document.querySelector("#Spatial_input")
    console.log(Spatial.value)
    Form = document.querySelector('#Form_input')
    console.log(Form.value)
    Discipline = document.querySelector("#Discipline_input")
    console.log(Discipline.value)
    const varDocNumber_noNum = ProjectPin.value+"-"+Originator.value+"-"+vFunction.value+"-"+Spatial.value+"-"+Form.value+"-"+Discipline.value
    console.log(varDocNumber_noNum)

    const PartialMatch = filelist.filter(item => item.includes(varDocNumber_noNum));

    if (PartialMatch.length >=1) {
        console.log(`Partial match '${varDocNumber_noNum}' found in the array.`);
        const partialMatchesArray = PartialMatch.map(match => match.replace(/\.[^.]+$/, ''));
        console.log('Partial matches array:', partialMatchesArray);

        // Extract the numbers from the filenames
        const numbers = partialMatchesArray.map(filename => {
            const match = filename.match(/(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
        });

        // Find the maximum number
        const maxNumber = Math.max(...numbers);

        // Calculate the next number
        const nextNumber = maxNumber + 1;

        // Pad the next number with zeros and set the fixed length to 6
        const paddedNextNumber = String(nextNumber).padStart(6, '0');

        console.log('Next number with padded zeros and fixed length 6:', paddedNextNumber);

        newNumber = paddedNextNumber
    } else {
        console.log(`No partial match '${varDocNumber_noNum}' found in the array.`);
        newNumber = "000001"
    }

    const varDocNumber_Full = varDocNumber_noNum+"-"+newNumber
    console.log('New Document Number: ', varDocNumber_Full);
    document.getElementById("DocNumber").value = varDocNumber_Full.toString()


}

async function getNamingStandard() {
    try {
        access_token = await generateTokenDataCreate(clientId, clientSecret);
    } catch {
        console.log("Error: Getting Access Token");
    }
    //console.log("Access Token: ", access_token);

    try {
        namingstandard = await getNamingStandardforproject(access_token,namingstandardID,projectID)

    } catch (error) {
        console.error("Error iterating through folders:", error);
    }
    arrayprojectPin = namingstandard.find(item => item.name === "Project PIN")
    arrayprojectPin = arrayprojectPin ? arrayprojectPin.options : [];

    // Get the dropdown container
    const dropdownContainerProjectPin = document.getElementById("ProjectPin_input");

    // Create and append options to the dropdown
    arrayprojectPin.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerProjectPin.appendChild(optionElement);
    });

    arrayOriginator = namingstandard.find(item => item.name === "Originator")
    arrayOriginator = arrayOriginator ? arrayOriginator.options : [];

    // Get the dropdown container
    const dropdownContainerOriginator = document.getElementById("Originator_input");

    // Create and append options to the dropdown
    arrayOriginator.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerOriginator.appendChild(optionElement);
    });

    arrayfunction = namingstandard.find(item => item.name === "Function")
    arrayfunction = arrayfunction ? arrayfunction.options : [];

    // Get the dropdown container
    const dropdownContainerfunction = document.getElementById("Function_input");

    // Create and append options to the dropdown
    arrayfunction.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerfunction.appendChild(optionElement);
    });

    arraySpatial = namingstandard.find(item => item.name === "Spatial")
    arraySpatial = arraySpatial ? arraySpatial.options : [];

    // Get the dropdown container
    const dropdownContainerSpatial = document.getElementById("Spatial_input");

    // Create and append options to the dropdown
    arraySpatial.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerSpatial.appendChild(optionElement);
    });

    arrayForm = namingstandard.find(item => item.name === "Form")
    arrayForm = arrayForm ? arrayForm.options : [];

    // Get the dropdown container
    const dropdownContainerForm = document.getElementById("Form_input");

    // Create and append options to the dropdown
    arrayForm.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerForm.appendChild(optionElement);
    });

    arrayDiscipline = namingstandard.find(item => item.name === "Discipline")
    arrayDiscipline = arrayDiscipline ? arrayDiscipline.options : [];

    // Get the dropdown container
    const dropdownContainerDiscipline = document.getElementById("Discipline_input");

    // Create and append options to the dropdown
    arrayDiscipline.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerDiscipline.appendChild(optionElement);
    });

    //console.log(namingstandard)
    console.log(arrayprojectPin)
    console.log(arrayOriginator)
    console.log(arrayfunction)
    console.log(arraySpatial)
    console.log(arrayForm)
    console.log(arrayDiscipline)
}

async function getfileslist() {
    try {
        access_token = await generateTokenDataCreate(clientId, clientSecret);
    } catch {
        console.log("Error: Getting Access Token");
    }
    //console.log("Access Token: ", access_token);

    try {
        for (const folderID of folders) {
            try {
                filelist_temp = await getfolderItems(folderID, access_token, projectID);

            } catch (error) {
                console.error("Error getting folder items:", error);
            }
            filelist = filelist.concat(filelist_temp.data.map(item => item.attributes.displayName))
        }

    } catch (error) {
        console.error("Error iterating through folders:", error);
    }
    console.log(filelist)
}

async function generateTokenDataCreate(clientId,clientSecret){
    const bodyData = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type:'client_credentials',
    scope:'data:read'
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

async function getfolderItems(folder_id,AccessToken,project_id){

    const headers = {
        'Authorization':"Bearer "+AccessToken,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+project_id+"/folders/"+folder_id+"/contents";
    //console.log(apiUrl)
    //console.log(requestOptions)
    signedURLData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
    return signedURLData
    }

async function getNamingStandardforproject(access_token,ns_id,project_id){

    const headers = {
        'Authorization':"Bearer "+access_token,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/bim360/docs/v1/projects/"+project_id+"/naming-standards/"+namingstandardID;
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata.definition.fields
        })
        .catch(error => console.error('Error fetching data:', error));
    return responseData
    }