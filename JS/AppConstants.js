const CommonConstant = {
    SPSITEURL: _spPageContextInfo.webAbsoluteUrl,
    ROOTURL: "https://synoverge.sharepoint.com/sites/dms",
    SPHOST: "https://synoverge.sharepoint.com/sites/dev",
    HOSTWEBURL: "https://synoverge.sharepoint.com/sites/dev",
    APPLICATIONSHORTNAME: "Capex",
    APPLICATIONNAME: "Capex",
    FORMNAME: "Capex Requisition Form",
    HTMLFILSEPATH: _spPageContextInfo.webAbsoluteUrl + "/SiteAssets/Inventia/HtmlFiles/",
    SETITEMPERMISSION: "https://prod-05.centralindia.logic.azure.com:443/workflows/068a2cd297de410ab19fc808be3a2735/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=eSrKcDBAxAwGqTouTX6xZ8sUpoQIl--H02rmq8EW3c8",
    SAVEEMAILINLIST: "https://prod-03.centralindia.logic.azure.com:443/workflows/2aebe35deb8b46768a76916d9aec7af9/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=r1Z9IKQ91LLVBHA08SD76oAQq67XvWw_ecOCl_V8Mj4"
    // BREAKROLEINHERITANCEWF: "https://prod-03.centralindia.logic.azure.com:443/workflows/4e21e3cc14a44e5f94d6e1b06f115805/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=emkY71m_1tA7TIpyXbWK_lYn1OvC1_6EP7C_R7UTu6c",
    // SETPERMISSIONWF: "https://prod-23.centralindia.logic.azure.com:443/workflows/8e3e13be36b5411490959f445a556c80/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-W769LTWezxRd7UTewtEnShmeV_cr8LEu4ANy8qDrwk",

}
Object.freeze(CommonConstant);

const ListNames = {
    MAINLIST: "CapexRequisition",
    ACTIVITYLOGLIST: "ActivityLog",
    APPROVALMATRIXLIST: "ApprovalMatrix",
    APPROVERMASTERLIST: "ApproverMaster",
    GLOBALAPPROVALMATRIXLIST: "ApprovalMatrix",
    BUTTONLIST: "Buttons",
    CAPEXVENDORLIST: "CapexVendorDetails",
    EMAILTEMPLATELIST: "EmailTemplate",
    EMAILNOTIFICATION: "EmailNotification",
    DEPTFUNCTIONMASTER: "DepartmentFunctionMapping",
    BUDGETMASTER: "BudgetMaster",
    ATTACHMENTLIST: "Attachments"
}
Object.freeze(ListNames);

const SectionNames =
    {
        INITIATORSECTION: "Initiator Section",
        PURCHASESECTION: "Purchase Section",
        HODSECTION: "Initiator HOD Section",
        FUNCTIONHEADSECTION: "Function Head Section",
        MANAGEMENTSECTION: "Management Section"
    }
Object.freeze(SectionNames);


const Roles = {
    CREATOR: "Creator",
    VIEWER: "Viewer",
    EDITOR: "Editor",
    INITIATOR: "Initiator",
    PURCHASE: "Purchase",
    INITIATORHOD: "Initiator HOD",
    FUNCTIONHEAD: "Function Head",
    MANAGEMENT: "Management",
    ADMIN: "Admin"

}
Object.freeze(Roles);

const WFStatus = {
    COMPLETED: "Closed",
    PENDINGWITH: "Pending for "
}
Object.freeze(WFStatus);


