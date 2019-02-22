const CommonConstant = {
    SPSITEURL: _spPageContextInfo.webAbsoluteUrl,
    APPLICATIONSHORTNAME: "Capex",
    APPLICATIONNAME: "Capex",
    FORMNAME: "Capex Requisition Form",
    HTMLFILSEPATH: _spPageContextInfo.webAbsoluteUrl + "/SiteAssets/Inventia/HtmlFiles/",
    ROOTURL: "https://synoverge.sharepoint.com/sites/dms",

    /*Dev */
    /*
    SETITEMPERMISSION: "https://prod-05.centralindia.logic.azure.com:443/workflows/068a2cd297de410ab19fc808be3a2735/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=eSrKcDBAxAwGqTouTX6xZ8sUpoQIl--H02rmq8EW3c8",
    SAVEEMAILINLIST: "https://prod-03.centralindia.logic.azure.com:443/workflows/2aebe35deb8b46768a76916d9aec7af9/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=r1Z9IKQ91LLVBHA08SD76oAQq67XvWw_ecOCl_V8Mj4",
  
    */
    /*QA */
    SETITEMPERMISSION: "https://prod-09.centralindia.logic.azure.com:443/workflows/af272fa2e21b4ccab37d736a790f7424/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Rzv-URVzOF6Jxclr8_I4f4rcbtCUUiB8OzBPRRviJZU",
    SAVEEMAILINLIST: "https://prod-28.centralindia.logic.azure.com:443/workflows/39aadd88abae45ce92cc56e5d60c16c6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=gZi0rLYpjmoGdTEr_Zg6FZvx12v_NKXyyGEhnpVzDQ8",


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
    DEPTFUNCTIONMASTER: "FunctionDepartmentMaster",
    ASSETCLASSIFICATIONMASTER: "AssetClassificationMaster",
    BUDGETMASTER: "BudgetMaster",
    ATTACHMENTLIST: "Attachments",
    ASSETNUMBERMASTER: "AssetNumberMaster"
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

