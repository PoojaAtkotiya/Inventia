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

const ConstantKeys = {
    SENDTOLEVEL: 'SendToLevel',
    SENDTOROLE: 'SendToRole',
    SENDBACKTO: 'SendBackTo',
    ACTIONPERFORMED: 'ActionPerformed',
}
Object.freeze(ConstantKeys);

////here button action status is set as per ID(list item id) not 'value' column as we are getting lookup id from buttons
const ButtonActionStatus = {
    None: 1,
    SaveAsDraft: 2,
    Save: 3,
    ReadyToPublish: 4,
    SendMailNotification: 5,
    Exit: 6,
    Print: 7,
    Reschedule: 8,
    Cancel: 9,
    Replace: 10,
    NextApproval: 11,
    BackToCreator: 12,
    Guidelines: 13,
    ReAssign: 14,
    Complete: 15,
    Forward: 16,
    Integrate: 17,
    SaveAsDraftAndSetPermission: 18,
    SaveAndSetPermission: 19,
    NextApprovalAndSetPermission: 20,
    SendOAAP: 21,
    MeetingConducted: 22,
    SendBack: 23,
    MeetingNotConducted: 24,
    CopySchedule: 25,
    SendForward: 26,
    Submit: 27,
    Counducted: 28,
    UpdateAndRepublish: 29,
    GenerateLSMW: 30,
    UpdateAndReschedule: 31,
    ConfirmSave: 32,
    SaveAndStatusUpdate: 33,
    SaveAndNoStatusUpdate: 34,
    SaveAndStatusUpdateWithEmail: 35,
    SaveAndNoStatusUpdateWithEmail: 36,
    SendForSAP: 37,
    ReviseDate: 38,
    RemovedTask: 39,
    RemovedTask: 40,
    Rejected: 41,
    Delegate: 42,
    Hold: 43,
    Resume: 44,
    RestartToUpdate: 45
}
Object.freeze(ButtonActionStatus);

const JsFunctionValue = {
    Submit: 1,
    Guideline: 2,
    ConfirmSubmit: 3,
    SendOAAP: 4,
    ForwardAndSubmit: 5,
    SendApproval: 6,
    Print: 7,
    SendMail: 8,
    SubmitNoRedirect: 9,
    CancelMeeting: 10,
    SendMSDSDoc: 11,
    ExtractAttachments: 12,
    RescheduleMeetingPopup: 14,
    ReAssignAndSubmit: 15,
    MultipleReAssignAndSubmit: 16,
    ForwardAndSubmitWithComment: 17,
    ReAssignAndSubmitWithComment: 18,
    ChangePersonAndSubmit: 19,
    OpenChangeResponsiblePersonPopup: 20,
    OpenChangeSuggestionCoordinatorPopup: 21,
    GenerateLSMW: 22,
    ForwardPM: 23,
    SAPIntegration: 24,
    SubmitForm: 25,
    PrintWithAttachment: 26,
    OpenPrintModel: 27,
    ConfirmHold: 28,
    OnResume: 29,
    OnDelete: 30,
    ConfirmSubmitNoRedirect: 31
}
Object.freeze(JsFunctionValue);

const ApproverStatus = {
    NOTASSIGNED: "Not Assigned",
    PENDING: "Pending",
    APPROVED: "Approved",
    COMPLETED: "Completed",
    SENDBACK: "Send Back",
    SENDFORWARD: "Send Forward",
    NOTREQUIRED: "Not Required"
}
Object.freeze(ApproverStatus);

const DayOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
}
Object.freeze(DayOfWeek);

const SharePointPermission = {
    READER: "Read",
    CONTRIBUTOR: "Contribute"
}
Object.freeze(SharePointPermission);

const SPPermissionID = {
    READ: "1073741826",
    CONTRIBUTE: "1073741827",
    FULLCONTROL: "1073741829"
}

const CurrentApprover = {
    APPROVERID: "ApproverId",
    COMMENTS: "Comments",
    ASSIGNDATE: "AssignDate",
    DUEDATE: "DueDate",
    APPROVEBYID: "ApproveById",
    STATUS: "Status"
}
Object.freeze(CurrentApprover);


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


const SectionNames =
    {
        INITIATORSECTION: "Initiator Section",
        PURCHASESECTION: "Purchase Section",
        HODSECTION: "Initiator HOD Section",
        FUNCTIONHEADSECTION: "Function Head Section",
        MANAGEMENTSECTION: "Management Section"
    }
Object.freeze(SectionNames);


const EmailTemplateName =
    {
        APPROVALMAIL: "ApprovalMail",
        SENDBACKMAIL: "SendBackMail"
    }
Object.freeze(EmailTemplateName);

const ItemActionStatus = {
    NEW: "New",
    UPDATED: "Updated",
    DELETED: "Deleted",
    NOCHANGE: "NoChange"
}
Object.freeze(ItemActionStatus);