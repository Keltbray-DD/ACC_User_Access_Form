const appName = "Forma Access Request";
const appVersion = "v1.7.4";

const hubID = "b.24d2d632-e01b-4ca0-b988-385be827cb04"
const account_id = "24d2d632-e01b-4ca0-b988-385be827cb04"
const default_project_id = "bc44c453-d23a-46ce-8b83-6bea9e90c4b9"

let projectdetails
let PM_Email
let AA_Email
let DC_Email
let ProjectRoles
let ProjectList =[]
let ProjectListRaw
let projectListDetails =[]
let ACC_project_input_dropdown
let projectDropdown
let marketDropdown
let roleDropdown
let companyDropdown
let rolesData
let accRoles
let additionalRoles
let roleIDsArray
let aureosBUs

let emailStringProjectManagers
let emailStringDocumentControllers
let emailStringAccessApprovers

let selectedCompanyNameOption
let selectedProjectNameOption
let selectedProjectIDOption

let accessToken;

let aureosCompanyList = [
    {code:"AID", name:"Aureos IDEC"},
    {code:"ARE", name:"Aureos Renewables"},
    {code:"AUT", name:"Aureos Technical Solutions"},
    {code:"AUE", name:"Aureos Energy"},
    {code:"AUH", name:"Aureos Highways"},
    {code:"AUI", name:"Aureos Infrastructure"},
    {code:"AUR", name:"Aureos Rail"},
    {code:"AEL", name:"Aureos Energy Limited"},
    {code:"AIL", name:"Aureos International"},
    {code:"ADT", name:"Aureos Distribution & Transmission"},
    {code:"SPC", name:"Aureos SP&C"},
    {code:"EWX", name:"Aureos Electricityworx"},
]

// Aureos Rail used to be a single BU coded "AUR". It has since been split into
// six discipline BUs (OLE, AEP, AEC, SPC, ART, ARL), all still named
// "Aureos Rail". The shared Rail OCRA and project-admin roles in ACC are still
// coded under the original "AUR", so any Rail discipline must be collapsed back
// to "AUR" when building those role names or matching a user's BU to a project.
// Detection keys off the company NAME ("Aureos Rail"), not the code, so the
// Rail "SPC" discipline is never confused with the separate "Aureos SP&C" BU.
const RAIL_BU_CODE = "AUR";
const RAIL_DISCIPLINE_CODES = ["OLE", "AEP", "AEC", "SPC", "ART", "ARL"];

function isRailCompany(companyName) {
    return typeof companyName === "string" &&
        companyName.toLowerCase().includes("rail");
}

// BU code to use for role lookups/filtering (role dropdown, AUR_* OCRA roles,
// project-admin matching): AUR for any Rail company, otherwise the BU's own code.
function resolveBuCode(companyName, buCode) {
    return isRailCompany(companyName) ? RAIL_BU_CODE : buCode;
}
