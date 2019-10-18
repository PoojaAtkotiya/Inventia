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
    NOTREQUIRED: "Not Required",
    REJECTED : "Rejected"
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

const EmailTemplateName =
    {
        APPROVALMAIL: "ApprovalMail",
        SENDBACKMAIL: "SendBackMail",
        REQUESTREJECTED:"Reject",
        REQUESTCLOSERMAIL:"Complete"
    }
Object.freeze(EmailTemplateName);

const ItemActionStatus = {
    NEW: "New",
    UPDATED: "Updated",
    DELETED: "Deleted",
    NOCHANGE: "NoChange"
}
Object.freeze(ItemActionStatus);