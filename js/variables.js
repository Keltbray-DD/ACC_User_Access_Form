const appName = "ACC Access Request";
const appVersion = "v1.3.2";

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
let marketDropdown
let roleDropdown
let rolesData
let accRoles
let additionalRoles
let roleIDsArray

let emailStringProjectManagers
let emailStringDocumentControllers
let emailStringAccessApprovers

let selectedCompanyNameOption

let accessToken;

let aureosCompanyList = [
    {code:"AID", name:"Aureos IDEC"},
    {code:"ARE", name:"Aureos Renewables"},
    {code:"ATS", name:"Aureos Technical Solutions"},
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
