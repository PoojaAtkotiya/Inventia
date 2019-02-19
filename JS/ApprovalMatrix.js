var globalApprovalMatrix;
var currentUserRole;
var localApprovalMatrixdata;
var activeSectionName = "";
var web, clientContext, oList, perMask;
var currentApproverList;
var tempApproverMatrix;
var tcurrentLevel;
var permItem = null;


/*Himil Jani */
function GetGlobalApprovalMatrix(id) {
    // GetFormDigest().then(function (data) {
    AjaxCall(
        {
            url: CommonConstant.ROOTURL + "/_api/web/lists/getbytitle('" + ListNames.GLOBALAPPROVALMATRIXLIST + "')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><Query><Where><And><Eq><FieldRef Name='ApplicationName' /><Value Type='TaxonomyFieldType'>" + CommonConstant.APPLICATIONNAME + "</Value></Eq><Eq><FieldRef Name='FormName' /><Value Type='Text'>" + CommonConstant.FORMNAME + "</Value></Eq></And></Where></Query></View>\"}",
            httpmethod: 'POST',
            calldatatype: 'JSON',
            async: false,
            headers:
                {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json; odata=verbose",
                    "X-RequestDigest": gRequestDigestValue// data.d.GetContextWebInformation.FormDigestValue
                },
            sucesscallbackfunction: function (data) {
                globalApprovalMatrix = data.d.results;
                /*Pooja Atkotiya */
                SetSectionWiseRoles(id = 0);
                SetApprovalMatrix(id, '');
                //setCustomApprovers(tempApproverMatrix);
                GetButtons(id, currentUserRole, 'New');
            }
        });
    //  });
}

/*Himil Jani*/
function GetLocalApprovalMatrixData(id, mainListName) {
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.APPROVALMATRIXLIST + "')/Items?$select=*,Approver/UserName&$expand=Approver&$filter=RequestID eq '" + id + "'&$orderby= Levels asc",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            headers:
                {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
            sucesscallbackfunction: function (data) {
                /*Pooja Atkotiya */
                localApprovalMatrixdata = data.d.results;
                SetSectionWiseRoles(id);
                SetApprovalMatrix(id, mainListName);
            }
        });
}

/*Pooja Atkotiya */
function SetApprovalMatrix(id, mainListName) {
    var isSuperAdmin = false;
    if (id > 0) {
        //set role name from local approval matrix
        GetCurrentUserRole(id, mainListName).done(function () {
            if (IsStrNullOrEmpty(currentUserRole)) {
                // isSuperAdmin = IsGroupMember(currentUser.Id, Roles.ADMIN);
                // if (isSuperAdmin) {
                //     currentUserRole = "Capex Admin";
                // }
                // else if (IsGroupMember(currentUser.Id, Roles.VIEWER)) {
                //     currentUserRole = Roles.VIEWER;
                // }
                // console.log("Called GetCurrentUserRole and Role=" + currentUserRole);
            }
            // if (!IsStrNullOrEmpty(currentUserRole)) {
            GetEnableSectionNames(id);
            tempApproverMatrix = localApprovalMatrixdata;
            SetApproversInApprovalMatrix(id);
            //}
        }).fail(function () {
            console.log("Execute  second after the retrieve list items  failed");
        });
    } else {
        currentUserRole = Roles.CREATOR;
        //get active/inactive section name from globalApprovalMatrix
        GetEnableSectionNames(id = 0);
        tempApproverMatrix = globalApprovalMatrix;
        tempApproverMatrix.forEach(temp => {
            temp.RequestIDId = null;
            temp.Status = "";
            temp.Comments = "";
            temp.AssignDate = null;
            temp.DueDate = null;
            temp.ApprovalDate = null;
            temp.EscalationToId = null;
            temp.EscalationOn = null;
            temp.ApproveById = null;
            temp.ReasonForDelay = "";
            temp.ReasonForChange = "";
            temp.IsHOLD = "";
        });
        SetApproversInApprovalMatrix(id);
    }
}

/*Pooja Atkotiya */
function SetApproversInApprovalMatrix(id) {
    GetMasterData(ListNames.APPROVERMASTERLIST);
    var approverMaster = masterDataArray;
    //set status(of all levels) and approver(current)
    if (!IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length > 0) {
        ////Get all roles which have FillByRole = currentUserRole
        tempApproverMatrix.filter(function (t) {
            if (!IsNullOrUndefined(t.FillByRole) && !IsNullOrUndefined(currentUserRole) && t.FillByRole == currentUserRole) {
                if (!IsNullOrUndefined(approverMaster) && approverMaster.length > 0) {
                    approverMaster.filter(function (a) {
                        if (t.Role == a.Role && a.UserSelection == true) {
                            if (a.UserNameId.results.length > 0) {
                                t.ApproverId = a.UserNameId.results;
                            }
                        }
                    });
                }
            }
            if (id == 0) {
                t.Status = "Not Assigned";
            }
        });
        DisplayApplicationStatus(tempApproverMatrix);
    }
}

/*Pooja Atkotiya */
function GetCurrentUserRole(id, mainListName) {
    var deferred = $.Deferred();
    web = currentContext.get_web();
    oList = web.get_lists().getByTitle(mainListName);
    this._currentUser = web.get_currentUser();

    var oListItem = oList.getItemById(id);
    currentContext.load(oListItem, 'EffectiveBasePermissions', 'HasUniqueRoleAssignments', 'FormLevel', 'Status');
    currentContext.load(web);
    currentContext.load(this._currentUser);
    currentContext.executeQueryAsync(function () {

        // SP.PermissionKind.manageWeb  == Full Control
        if (oListItem.get_effectiveBasePermissions().has(SP.PermissionKind.editListItems) && oListItem.get_effectiveBasePermissions().has(SP.PermissionKind.addListItems)) {
            console.log("user has add+edit permission");
            tcurrentLevel = oListItem.get_item('FormLevel').split("|")[1];
            GetRoleFromApprovalMatrix(tcurrentLevel, id, currentUser.Id);
            //  if (!IsNullOrUndefined(currentUserRole)) {
            GetButtons(id, currentUserRole, oListItem.get_item('Status'));
            //}
        }
        else if (oListItem.get_effectiveBasePermissions().has(SP.PermissionKind.viewListItems)) {
            console.log("user has Read permission");
            currentUserRole = Roles.VIEWER;
            GetButtons(id, currentUserRole, oListItem.get_item('Status'));
        }
        else {
            console.log("user doesn't have any(edit/view) permission");
        }
        deferred.resolve(currentUserRole);

    }, function (sender, args) {
        console.log('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
        deferred.reject(currentUserRole);
    });
    return deferred.promise();
}

/*Pooja Atkotiya */
function GetRoleFromApprovalMatrix(tcurrentLevel, requestId, currUserId) {
    localApprovalMatrixdata.filter(function (i) {
        if (i.ApplicationName == CommonConstant.APPLICATIONNAME && i.FormName == CommonConstant.FORMNAME && i.Levels == tcurrentLevel && i.RequestIDId == requestId && (!IsNullOrUndefined(i.ApproverId) && !IsNullOrUndefined(i.ApproverId.results) && i.ApproverId.results.some(item => item == currUserId))) {
            currentUserRole = i.Role;
        }
    });
}

/*Pooja Atkotiya */
function GetEnableSectionNames(id) {
    var formNames = '#' + $($('div').find('[mainlistname]')).attr('id');
    if (id == 0) {
        //get active section name
        var activeSectionItem = globalApprovalMatrix.filter(function (i) {
            return (i.ApplicationName.Label == CommonConstant.APPLICATIONNAME && i.FormName.Label == CommonConstant.FORMNAME && i.Role == currentUserRole);
        })[0];
        activeSectionName = getTermFromManagedColumn(activeSectionItem.SectionName);

        $(formNames).find('div.card-body').filter(function () {
            var sectionName = $(this).attr('section');
            if (sectionName == activeSectionName) {
                var sectionId = $(this).attr('id');
                $("#" + sectionId).removeClass("disabled");
                $("#" + sectionId).find('input,select,textarea').removeAttr("disabled");
            }
        });
        // $("div.disabled.form-control").attr("disabled", "disabled");
        $("div .disabled").attr("disabled", "disabled");
        $("div .disabled .form-control").attr("disabled", "disabled");
        $("div .disabled input").attr("disabled", "disabled"); // for radio buttons
    }
    else if (id > 0) {
        //get active section name
        var activeSectionItem = localApprovalMatrixdata.filter(function (l) {
            return (l.ApplicationName == CommonConstant.APPLICATIONNAME && l.FormName == CommonConstant.FORMNAME && l.Levels == tcurrentLevel && l.Role == currentUserRole);
        })[0];

        activeSectionName = !IsNullOrUndefined(activeSectionItem) ? activeSectionItem.SectionName : '';
        if (activeSectionName) {
            $(formNames).find('div.card-body').filter(function () {
                var sectionName = $(this).attr('section');
                if (sectionName == activeSectionName) {
                    var sectionId = $(this).attr('id');
                    $("#" + sectionId).removeClass("disabled");
                    $("#" + sectionId).find('input,select,textarea').removeAttr("disabled");
                }
            });
        }
        // $("div.disabled.form-control").attr("disabled", "disabled");
        $("div .disabled").attr("disabled", "disabled");
        $("div .disabled .form-control").attr("disabled", "disabled");
        $("div .disabled input").attr("disabled", "disabled"); // for radio buttons 

    }
}

/*Pooja Atkotiya */
function SaveLocalApprovalMatrix(sectionName, requestId, mainListName, isNewItem, mainListItem, approvalMatrixListName) {
    var nextApprover = [], nextApproverRole = '';
    var previousLevel = mainListItem.get_item('FormLevel').split("|")[0];
    var currentLevel = mainListItem.get_item('FormLevel').split("|")[1];
    var nextLevel = currentLevel;
    var formFieldValues = [];

    ////get value from ActionStatus from html
    var actionStatus = $("#ActionStatus").val();
    var sendToRole = $("#SendToRole").val();
    var sendBackTo = $("#SendBackTo").val();
    //var keys = Object.keys(ButtonActionStatus).filter(k => ButtonActionStatus[k] == actionStatus);
    //actionPerformed = keys.toString();
    actionPerformed = parseInt(actionStatus);

    ///Pending -- temporary
    var param = {};
    param[ConstantKeys.SENDTOLEVEL] = 0;                 // ConstantKeys.SENDTOLEVEL
    param[ConstantKeys.SENDTOROLE] = sendToRole;
    param[ConstantKeys.SENDBACKTO] = sendBackTo;
    param[ConstantKeys.ACTIONPERFORMED] = actionPerformed;

    var sendToLevel = ((ConstantKeys.SENDTOLEVEL in param) && !IsNullOrUndefined(param[ConstantKeys.SENDTOLEVEL])) ? param[ConstantKeys.SENDTOLEVEL] : null;

    if (isNewItem) {
        // var sectionOwner = currentUserRole;
        formFieldValues["RaisedBy"] = currentUser.Id;
        ////Save CurrentApprover as Creator in tempApprovalMatrix
        tempApproverMatrix.filter(function (temp) {
            if (temp.Role == Roles.CREATOR) {
                temp.ApproverId = currentUser.Id;
                temp.RequestIDId = requestId;
            }
        });
    }

    ////Update status of all approvers in tempapprovalmatrix
    UpdateStatusofApprovalMatrix(tempApproverMatrix, currentLevel, previousLevel, actionPerformed, param);

    ////Set NextApprover and NextApproverRole
    if (!IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length > 0) {
        ////set RequestID for all Roles
        tempApproverMatrix.forEach(t => {
            t.RequestIDId = requestId;
        });
        if (actionPerformed != ButtonActionStatus.SendBack && actionPerformed != ButtonActionStatus.Forward && tempApproverMatrix.some(t => t.Levels != currentLevel)) {
            ////Get Next Level
            var nextLevelRow = tempApproverMatrix.sort(function (a, b) {
                return a.Levels - b.Levels;
            }).filter(function (temp) {
                return (temp.Status != "Not Required" && !IsNullOrUndefined(temp.ApproverId) && temp.Levels > currentLevel);
            })[0];
            nextLevel = (!IsNullOrUndefined(nextLevelRow)) ? nextLevelRow.Levels : nextLevel;

            var listofNextApprovers = tempApproverMatrix.filter(temp => temp.Levels == nextLevel);

            listofNextApprovers.forEach(next => {
                if (isNewItem) {
                    if (!IsNullOrUndefined(next.ApproverId)) {
                        if (nextApprover == '') {
                            nextApproverRole = next.Role;
                            nextApprover = next.ApproverId;
                        } else {
                            if (nextApprover.indexOf(next.ApproverId) == -1) // !Contains
                            {
                                nextApproverRole = nextApproverRole.trim() + "," + next.Role;
                                nextApprover = nextApprover.trim() + "," + next.ApproverId;
                            }
                        }
                    }
                } else {
                    if (!IsNullOrUndefined(next) && !IsNullOrUndefined(next.ApproverId) && !IsNullOrUndefined(next.ApproverId.results) && next.ApproverId.results.length > 0) {
                        if (nextApprover == '') {
                            nextApproverRole = next.Role;
                            nextApprover = next.ApproverId.results;
                        } else {
                            ////Pending to handle multiple approvers from local approval matrix
                            if (nextApprover.indexOf(next.ApproverId) == -1) // !Contains
                            {
                                nextApproverRole = nextApproverRole.trim() + "," + next.Role;
                                nextApprover = nextApprover.trim() + "," + next.ApproverId;
                            }
                        }
                    }
                }
            });
        }
        else {
            if (actionPerformed == ButtonActionStatus.NextApproval || actionPerformed == ButtonActionStatus.Delegate) {
                var approvers = tempApproverMatrix.sort(function (a, b) {
                    return a.Levels - b.Levels;
                }).filter(a => a.Levels > currentLevel && !IsNullOrUndefined(a.ApproverId) && a.Status != "Not Required")[0];
                if (!IsNullOrUndefined(approvers)) {
                    var listofNextApprovers = tempApproverMatrix.filter(temp => (temp.Levels == nextLevel && temp.Status == "Pending"));

                    listofNextApprovers.forEach(next => {
                        if (!IsNullOrUndefined(next.ApproverId)) {
                            if (nextApprover == '') {
                                nextApproverRole = next.Role;
                                nextApprover = next.ApproverId;
                            }
                            else {
                                if (nextApprover.indexOf(next.ApproverId) == -1) {

                                    debugger;
                                    if (nextApproverRole.lastIndexOf(',') != -1) {
                                        nextApproverRole = nextApproverRole.trim().substring(0, nextApproverRole.lastIndexOf(','))
                                    }
                                    if (nextApprover.lastIndexOf(',') != -1) {
                                        nextApprover = nextApprover.trim().substring(0, nextApprover.lastIndexOf(','))
                                    }

                                    ///////////// TRIM is PENDING
                                    nextApproverRole = nextApproverRole.trim() + "," + next.Role;
                                    nextApprover = nextApprover.trim() + "," + next.ApproverId;
                                }
                            }
                        }
                    });
                }
                currentLevel = previousLevel;
            }
        }
        if (actionPerformed == ButtonActionStatus.SendBack && !IsNullOrUndefined(sendToLevel)) {
            nextLevel = sendToLevel;
            var listofNextApprovers = tempApproverMatrix.filter(temp => (temp.Levels == nextLevel && temp.Status == "Pending"));
            nextApprover = '';
            listofNextApprovers.each(next => {
                if (!IsNullOrUndefined(next.ApproverId)) {
                    if (nextApprover == []) {
                        nextApproverRole = next.Role;
                        nextApprover = next.ApproverId;
                    }
                    else {
                        if (nextApprover.indexOf(next.ApproverId) == -1) {
                            debugger;
                            if (nextApproverRole.lastIndexOf(',') != -1) {
                                nextApproverRole = nextApproverRole.trim().substring(0, nextApproverRole.lastIndexOf(','))
                            }
                            if (nextApproverRole.lastIndexOf(',') != -1) {
                                nextApprover = nextApprover.trim().substring(0, nextApprover.lastIndexOf(','))
                            }
                            ///////////// TRIM is PENDING
                            nextApproverRole = nextApproverRole.trim(',') + "," + next.Role;
                            nextApprover = nextApprover.trim(',') + "," + next.ApproverId;
                        }
                    }
                }

            });
        }
        if (actionPerformed == ButtonActionStatus.SendForward && !IsNullOrUndefined(sendToLevel)) {
            nextLevel = sendToLevel;
            var approvers = tempApproverMatrix.sort(function (a, b) {
                return a.Levels - b.Levels;
            }).filter(a => a.Levels >= nextLevel && !IsNullOrUndefined(a.ApproverId))[0];
            if (!IsNullOrUndefined(approvers)) {
                nextLevel = approvers.Levels;
                var listofNextApprovers = tempApproverMatrix.filter(temp => !IsNullOrUndefined(temp.ApproverId) && temp.Levels == nextLevel);
                nextApprover = '';
                listofNextApprovers.forEach(next => {
                    if (!IsNullOrUndefined(next.ApproverId)) {
                        if (nextApprover == '') {
                            nextApproverRole = next.Role;
                            nextApprover = next.ApproverId;
                        }
                        else {
                            if (nextApprover.indexOf(next.ApproverId) == -1) {

                                ///////////// TRIM is PENDING
                                nextApproverRole = nextApproverRole + "," + next.Role;
                                nextApprover = nextApprover.trim() + "," + next.ApproverId;
                            }
                        }
                    }
                });
            }
        }
    }

    var makeAllUsersViewer = false;
    var isTaskAssignMailSend = false;
    switch (actionPerformed) {
        case ButtonActionStatus.SaveAsDraft:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            formFieldValues['Status'] = "Draft";
            formFieldValues['NextApprover'] = currentUser.Id;
            break;
        case ButtonActionStatus.SaveAndStatusUpdate:
        case ButtonActionStatus.SaveAndStatusUpdateWithEmail:
        case ButtonActionStatus.ConfirmSave:
            formFieldValues['Status'] = "Save";
            break;
        case ButtonActionStatus.Save:
            formFieldValues['Status'] = "Save";
            makeAllUsersViewer = true;
            break;
        case ButtonActionStatus.Submit:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            formFieldValues['Status'] = "Submitted";
            makeAllUsersViewer = true;
            break;
        case ButtonActionStatus.Hold:
            formFieldValues['Status'] = "Hold";
            formFieldValues['HoldDate'] = new Date().toLocaleDateString();
            formFieldValues['LastActionBy'] = currentUser.Id;
            formFieldValues['LastActionByRole'] = currentUserRole;
            formFieldValues['PendingWith'] = currentUserRole;
            break;
        case ButtonActionStatus.Resume:
            formFieldValues['Status'] = "Submitted";
            formFieldValues['LastActionBy'] = currentUser.Id;
            formFieldValues['LastActionByRole'] = currentUserRole;
            formFieldValues['PendingWith'] = currentUserRole;
            break;
        case ButtonActionStatus.UpdateAndRepublish:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            formFieldValues['Status'] = "Update & Republish";
            break;
        case ButtonActionStatus.Reschedule:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            formFieldValues['Status'] = "Re-Scheduled";
            formFieldValues['IsReschedule'] = false;
            break;
        case ButtonActionStatus.ReadyToPublish:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            formFieldValues['Status'] = "Ready to Publish";
            break;
        case ButtonActionStatus.Delegate:
        case ButtonActionStatus.NextApproval:
            formFieldValues['LastactionPerformed'] = actionPerformed;
            formFieldValues['LastActionBy'] = currentUser.Id;
            formFieldValues['LastActionByRole'] = currentUserRole;
            formFieldValues['PendingWith'] = nextApproverRole;
            if (!IsNullOrUndefined(nextApprover)) {
                formFieldValues['NextApprover'] = nextApprover;
                formFieldValues['FormLevel'] = currentLevel + "|" + nextLevel;
                formFieldValues['ApprovalStatus'] = "In Progress";
                formFieldValues['Status'] = "Submitted";
            }
            else {
                nextLevel = currentLevel;
                formFieldValues['NextApprover'] = '';
                formFieldValues['FormLevel'] = currentLevel + "|" + currentLevel;
                formFieldValues['ApprovalStatus'] = "Completed";
                formFieldValues['Status'] = "Completed";
                makeAllUsersViewer = true;
                isTaskAssignMailSend = true;
            }
            break;
        case ButtonActionStatus.BackToCreator:
            formFieldValues['LastactionPerformed'] = actionPerformed;
            formFieldValues['LastActionBy'] = currentUser.Id;
            formFieldValues['LastActionByRole'] = currentUserRole;
            formFieldValues['PendingWith'] = nextApproverRole;
            formFieldValues['NextApprover'] = '';
            formFieldValues['FormLevel'] = currentLevel + "|" + nextLevel;
            formFieldValues['Status'] = "Sent Back";
            break;
        case ButtonActionStatus.Cancel:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            makeAllUsersViewer = true;
            formFieldValues['NextApprover'] = '';
            formFieldValues['PendingWith'] = '';
            formFieldValues['Status'] = "Cancelled";
            break;
        case ButtonActionStatus.Rejected:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            makeAllUsersViewer = true;
            formFieldValues['Status'] = "Rejected";
            formFieldValues['NextApprover'] = '';
            formFieldValues['PendingWith'] = '';
            break;
        case ButtonActionStatus.Complete:
            formFieldValues['ApprovalStatus'] = "Completed";
            formFieldValues['Status'] = "Completed";
            formFieldValues['FormLevel'] = currentLevel + "|" + currentLevel;
            formFieldValues['NextApprover'] = '';
            formFieldValues['PendingWith'] = '';
            makeAllUsersViewer = true;
            isTaskAssignMailSend = true;
            break;
        case ButtonActionStatus.SendBack:
            formFieldValues['LastactionPerformed'] = actionPerformed;
            if (!IsNullOrUndefined(sendToLevel)) {
                formFieldValues['NextApprover'] = nextApprover;
                formFieldValues['LastActionBy'] = currentUser.Id;
                formFieldValues['LastActionByRole'] = currentUserRole;
                formFieldValues['PendingWith'] = nextApproverRole;
                formFieldValues['FormLevel'] = currentLevel + "|" + nextLevel;
                formFieldValues['Status'] = "Sent Back";
            }
            break;
        case ButtonActionStatus.RestartToUpdate:
            // Since it is restart case so we need to reset currlevel = 0 ;
            currentLevel = 0;
            formFieldValues['LastactionPerformed'] = actionPerformed;
            formFieldValues['NextApprover'] = nextApprover;
            formFieldValues['LastActionBy'] = currentUser.Id;
            formFieldValues['LastActionByRole'] = currentUserRole;
            formFieldValues['PendingWith'] = nextApproverRole;
            formFieldValues['FormLevel'] = currentLevel + "|" + nextLevel;
            formFieldValues['Status'] = "Submitted";
            break;
        case ButtonActionStatus.SendForward:
            formFieldValues = { 'LastactionPerformed': actionPerformed };
            if (!IsNullOrUndefined(sendToLevel)) {
                nextLevel = sendToLevel;
                formFieldValues['LastActionBy'] = currentUser.Id;
                formFieldValues['LastActionByRole'] = currentUserRole;
                formFieldValues['PendingWith'] = nextApproverRole;
                if (!IsNullOrUndefined(nextApprover) && !IsStrNullOrEmpty(nextApprover)) {
                    formFieldValues['NextApprover'] = nextApprover;
                    formFieldValues['FormLevel'] = currentLevel + "|" + nextLevel;
                    formFieldValues['ApprovalStatus'] = "In Progress";
                    formFieldValues['Status'] = "Submitted";
                }
                else {
                    //Complete if no approver found
                    formFieldValues['NextApprover'] = nextApprover;
                    formFieldValues['FormLevel'] = currentLevel + "|" + nextLevel;
                    formFieldValues['ApprovalStatus'] = "In Progress";
                    formFieldValues['Status'] = "Submitted";
                    makeAllUsersViewer = true;
                    isTaskAssignMailSend = true;
                }
            }
            break;
        default:
            nextLevel = currentLevel;
            currentLevel = previousLevel;
            break;
    }

    if (!IsNullOrUndefined(formFieldValues)) {
        if (!IsNullOrUndefined(formFieldValues["Status"]) && !IsStrNullOrEmpty(formFieldValues["Status"])) {
            UpdateWorkflowStatus(formFieldValues);
        }

        ////saveFormFields in Main List
        SaveFormFields(formFieldValues, requestId);
    }

    ////save attachment

    ////Set value in CurrentApprover
    tempApproverMatrix.filter(function (temp) {
        if (temp.Role == currentUserRole && temp.Levels == currentLevel && !IsNullOrUndefined(temp.ApproveById) && (temp.ApproveById.toString().indexOf(currentUser.Id) != -1)) {

            temp.Comments = currentApproverDetails[CurrentApprover.COMMENTS];
            currentApproverDetails[CurrentApprover.APPROVERID] = temp.ApproverId;
            currentApproverDetails[CurrentApprover.STATUS] = temp.Status;
            currentApproverDetails[CurrentApprover.ASSIGNDATE] = temp.AssignDate;
            currentApproverDetails[CurrentApprover.DUEDATE] = temp.DueDate;
            currentApproverDetails[CurrentApprover.APPROVEBYID] = temp.ApproveById;
        }
    });

    ////set permission 
    var userWithRoles = GetPermissionDictionary(tempApproverMatrix, nextLevel, makeAllUsersViewer, isNewItem);
    SetItemPermission(requestId, ListNames.MAINLIST, userWithRoles);

    console.log("Save Approver matrix");
    ////save approval matrix in list
    SaveApprovalMatrixInList(tempApproverMatrix, approvalMatrixListName, isNewItem);

    ////save activity log
    SendMail(actionPerformed, currentUser.Id, requestId, tempApproverMatrix, ListNames.MAINLIST, nextLevel, currentLevel, param, isNewItem);
}

/*Pooja Atkotiya */
function SetItemPermission(requestId, listName, userWithRoles) {
    breakRoleInheritanceOfList(listName, requestId, userWithRoles);
    // BreakRoleInheritance(requestId, listName).done(function () {
    //     var roleDefBindingColl = null;
    //     var users = [];
    //     userWithRoles.forEach((element) => {
    //         try {
    //             roleDefBindingColl = SP.RoleDefinitionBindingCollection.newObject(currentContext);
    //             var userIds = element.user;
    //             var permission = element.permission;
    //             if (!IsNullOrUndefined(userIds) && !IsStrNullOrEmpty(userIds) && !IsNullOrUndefined(permission) && !IsStrNullOrEmpty(permission)) {

    //                 //split users and remove ,
    //                 if (userIds.toString().indexOf(',') == 0) {
    //                     userIds = userIds.substring(1);
    //                     if (userIds.toString().indexOf(',') != -1 && userIds.toString().lastIndexOf(',') == userIds.toString().length - 1) {
    //                         userIds = userIds.substring(userIds.toString().lastIndexOf(','))[0];
    //                     }
    //                 }
    //                 if (!IsNullOrUndefined(userIds) && !IsStrNullOrEmpty(userIds)) {
    //                     var a = (userIds.toString().indexOf(',') != -1) ? userIds.split(',') : parseInt(userIds);

    //                     if (!IsNullOrUndefined(a)) {
    //                         if (a.length == undefined) {
    //                             users.push(a);
    //                         } else {
    //                             a.forEach(element => {
    //                                 users.push(parseInt(element));
    //                             });
    //                         }
    //                     }
    //                 }
    //                 users.forEach(user => {
    //                     if (!isNaN(user)) {
    //                         this.oUser = currentContext.get_web().getUserById(user);
    //                         roleDefBindingColl.add(currentContext.get_web().get_roleDefinitions().getByName(permission));
    //                         permItem.get_roleAssignments().add(this.oUser, roleDefBindingColl);
    //                         currentContext.load(oUser);
    //                         currentContext.load(permItem);
    //                         currentContext.executeQueryAsync(function () {
    //                             console.log("set permission : success User");
    //                         }, function (error) {
    //                             debugger
    //                             console.log(error);
    //                             console.log("set permission : failed");
    //                         }
    //                         );
    //                     }
    //                 });
    //             }
    //         } catch (exc) {
    //             debugger
    //             console.log("catch : error while set permission");
    //             console.log(exc);
    //         }
    //     });
    // }).fail(function () {
    //     console.log("Execute  second after the retrieve list items  failed");
    // });


}


//////////////////////////////////////////////////////////////

/*
  console.log("Inheritance Broken Successfully!");
            var roleDefBindingColl = null;
            console.log(userWithRoles);
            // var headers = {
            //     "Accept": "application/json;odata=verbose",
            //     "content-Type": "application/json;odata=verbose",
            //     "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            // }
            // });
            //Add Role Permissions   
            //1073741827 - contribute
            // 1073741829, Full Control
            // 1073741826, Read

            userWithRoles.forEach((element) => {

                var userIds = element.user;
                var permission = element.permission;
                var permId;
                if (permission == SharePointPermission.CONTRIBUTOR) {
                    permId = 1073741827;
                }
                else if (permission == SharePointPermission.READER) {
                    permId = 1073741826;
                }
                if (!IsNullOrUndefined(userIds) && !IsStrNullOrEmpty(userIds) && !IsNullOrUndefined(permission) && !IsStrNullOrEmpty(permission)) {
                    var users = [];
                    //split users and remove ,
                    if (userIds.toString().indexOf(',') == 0) {
                        userIds = userIds.substring(1);
                        if (userIds.toString().indexOf(',') != -1 && userIds.toString().lastIndexOf(',') == userIds.toString().length - 1) {
                            userIds = userIds.substring(userIds.toString().lastIndexOf(','))[0];
                        }
                    }
                    if (!IsNullOrUndefined(userIds) && !IsStrNullOrEmpty(userIds)) {
                        var a = (userIds.toString().indexOf(',') != -1) ? userIds.split(',') : parseInt(userIds);
                        if (!IsNullOrUndefined(a)) {
                            if (a.length == undefined) {
                                users.push(a);
                            } else {
                                a.forEach(element => {
                                    users.push(parseInt(element));
                                });
                            }
                        }
                    }

                    ////remove duplicates from array
                    users = removeDuplicateFromArray(users);

                    users.forEach(user => {
                        if (!isNaN(user)) {
                            var endPointUrlRoleAssignment = "/_api/web/lists/getByTitle('" + listName + "')/items(" + requestId + ")/roleassignments/addroleassignment(principalid=" + user + ",roleDefId=" + permId + ")";
                            var dataTemplate = { "url": endPointUrlRoleAssignment, "digest": digest.toString() };
                            var httpPostUrl = CommonConstant.SETPERMISSIONWF;
                            jQuery.ajax(
                                {
                                    url: httpPostUrl,   ///endPointUrlRoleAssignment
                                    type: "POST",
                                    data: JSON.stringify(dataTemplate),
                                    headers: {
                                        "content-type": "application/json",
                                         "cache-control": "no-cache"
                                    },
                                    async: false,
                                    success: function (data) {
                                        console.log('Role Permission Added successfully!');
                                    },
                                    error: function (error) {
                                        console.log(JSON.stringify(error));
                                    }
                                });
                        }
                    });
                }
            });
*/
//////////////////////////////////////////////////////////////

/*Pooja Atkotiya */
// Break role inheritance on the list.
function breakRoleInheritanceOfList(listName, requestId, userWithRoles) {
    var finalUserPermDic = [];
    userWithRoles.forEach((element) => {

        var userIds = element.user;
        var permission = element.permission;
        var permId;
        if (permission == SharePointPermission.CONTRIBUTOR) {
            permId = 1073741827;
        }
        else if (permission == SharePointPermission.READER) {
            permId = 1073741826;
        }
        if (!IsNullOrUndefined(userIds) && !IsStrNullOrEmpty(userIds) && !IsNullOrUndefined(permission) && !IsStrNullOrEmpty(permission)) {
            var users = [];
            //split users and remove ,
            if (userIds.toString().indexOf(',') == 0) {
                userIds = userIds.substring(1);
                if (userIds.toString().indexOf(',') != -1 && userIds.toString().lastIndexOf(',') == userIds.toString().length - 1) {
                    userIds = userIds.substring(userIds.toString().lastIndexOf(','))[0];
                }
            }
            if (!IsNullOrUndefined(userIds) && !IsStrNullOrEmpty(userIds)) {
                var a = (userIds.toString().indexOf(',') != -1) ? userIds.split(',') : parseInt(userIds);
                if (!IsNullOrUndefined(a)) {
                    if (a.length == undefined) {
                        users.push(a);
                    } else {
                        a.forEach(element => {
                            users.push(parseInt(element));
                        });
                    }
                }
            }

            ////remove duplicates from array
            users = removeDuplicateFromArray(users);

            users.forEach(user => {
                if (!isNaN(user)) {
                    finalUserPermDic.push({ user, permId });
                }
            });
        }
    });

    console.log(finalUserPermDic);

    var resetUrl = '/_api/web/lists/getbytitle(\'' + listName + '\')/items(' + requestId + ')/resetroleinheritance';
    var breakRoleUrl = '/_api/web/lists/getbytitle(\'' + listName + '\')/items(' + requestId + ')/breakroleinheritance(copyRoleAssignments=false, clearsubscopes=false)';
    var digest = jQuery("#__REQUESTDIGEST").val();
    var setPermUrl = "/_api/web/lists/getByTitle('" + listName + "')/items(" + requestId + ")/roleassignments/addroleassignment";
    var resetDataTemplate = { "resetUrl": resetUrl, "breakRoleUrl": breakRoleUrl, "setPermUrl": setPermUrl, "digest": digest.toString(), "UserPerm": finalUserPermDic };

    $.ajax({
        url: CommonConstant.SETITEMPERMISSION,
        type: 'POST',
        headers: {
            "content-type": "application/json",
            "cache-control": "no-cache"
        },
        data: JSON.stringify(resetDataTemplate),
        async: false,
        success: function (data) {
            console.log("Permission Set Successfully");
            console.log(data);

        },
        error: function (error) {
            console.log(error);
        }
    });
}

/*Pooja Atkotiya */
function FormatRow() {
    try {
        var content = this;
        for (var i = 0; i < arguments.length; i++) {
            var replacement = '{' + i + '}';
            content = content.replace(replacement, arguments[i]);
        }
        return content;
    }
    catch (e) {
        console.log("Error occurred in FormatRow " + e.message);
    }
}

/*Pooja Atkotiya */
function SetCustomPermission(userWithRoles, requestId, listName) {
    console.log("Inheritance Broken Successfully!");
    console.log(userWithRoles);
    // userWithRoles.forEach(ele => {
    var headers = {
        "Accept": "application/json;odata=verbose",
        "content-Type": "application/json;odata=verbose",
        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
    }
    // });
    //Add Role Permissions   
    //1073741827 - contribute
    // 1073741829, Full Control
    // 1073741826, Read
    var endPointUrlRoleAssignment = CommonConstant.HOSTWEBURL + "/_api/web/lists/getByTitle('" + listName + "')/items(" + requestId + ")/roleassignments/addroleassignment(principalid=20,roleDefId=1073741827)";
    var call = jQuery.ajax(
        {
            url: endPointUrlRoleAssignment,
            type: "POST",
            headers: headers,
            async: false,
            dataType: 'json',
            success: function (data) {
                console.log('Role Permission Added successfully!');
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });

}

/*Pooja Atkotiya */
function onFailbreakRoleInheritance(sender, args) {
    console.log('onFailbreakRoleInheritance : Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*Pooja Atkotiya */
function BreakRoleInheritance(requestId, listName) {
    var deferred = $.Deferred();
    web = currentContext.get_web();
    var oList = web.get_lists().getByTitle(listName);
    permItem = oList.getItemById(requestId);
    permItem.breakRoleInheritance(false, true); // break role inheritance first!
    currentContext.load(web);
    currentContext.load(permItem);
    currentContext.executeQueryAsync(function () {
        deferred.resolve(permItem);
    }, function (sender, args) {
        console.log('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
        deferred.reject(permItem);
    });
    return deferred.promise();
}

/*Pooja Atkotiya */
function onSetItemPermissionFailed(sender, args) {
    console.log('onSetItemPermissionSucceeded : Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*Pooja Atkotiya */
function GetPermissionDictionary(tempApproverMatrix, nextLevel, isAllUserViewer, isNewItem) {
    var permissions = [];
    if (!IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length > 0) {
        var strReader = '';
        var strContributer = '';
        tempApproverMatrix.forEach(temp => {
            if (!IsNullOrUndefined(temp.ApproverId)) {
                if (temp.Levels == nextLevel && temp.Status == "Pending") //ApproverStatus.PENDING)
                {
                    /* All users 
                     * 1) who are pending on current level
                     */
                    if (isNewItem) {
                        if (strContributer.indexOf(temp.ApproverId) == -1) {
                            strContributer = strContributer.trim() + "," + temp.ApproverId;
                        }
                    } else {
                        debugger
                        if (!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0 && strContributer.indexOf(temp.ApproverId.results) == -1) {
                            strContributer = strContributer.trim() + "," + temp.ApproverId.results;
                        }
                    }
                }
                ////Phase 2 :All members who will be in the DCR Process should be able to know the status of all DCR/DCN. 
                //// else if (Convert.ToInt32(p.Levels) <= preLevel || (p.Levels == curLevel.ToString() && p.Status != ApproverStatus.PENDING))
                else if (temp.Status != ApproverStatus.PENDING) {
                    /* All users 
                     * 1) who are less then previous level
                     * 2) who are not pending on current level
                     */
                    if (isNewItem) {
                        if (strReader.indexOf(temp.ApproverId) == -1) {
                            strReader = strReader.trim() + "," + temp.ApproverId;
                        }
                    } else {
                        if (!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0 && strReader.indexOf(temp.ApproverId.results) == -1) {
                            strReader = strReader.trim() + "," + temp.ApproverId.results;
                        }
                    }
                }
                // }
            }
        });

        if (strReader.trim() == strContributer.trim()) {
            var user = strContributer.trim();
            var permission = isAllUserViewer ? 'Read' : 'Contribute';
            permissions.push({ user: user, permission: permission });
        }
        else {
            if (isAllUserViewer) {
                var user = strReader.trim() + "," + strContributer.trim();
                var permission = 'Read';
                permissions.push({ user: user, permission: permission });
            }
            else {
                var user = strReader.trim();
                var permission = 'Read';
                permissions.push({ user: user, permission: permission });

                var user1 = strContributer.trim();
                var permission1 = isAllUserViewer ? 'Read' : 'Contribute';
                permissions.push({ user: user1, permission: permission1 });
            }
        }
    }
    return permissions;
}

var stringifyData = function (isNewItem, approvalMatrixListName, temp, approverResults) {
    var stringifyData;
    if (isNewItem) {
        var sectionName = '';
        if (!IsNullOrUndefined(temp.SectionName)) {
            sectionName = getTermFromManagedColumn(temp.SectionName);
        }
        stringifyData = JSON.stringify({
            __metadata: {
                type: GetItemTypeForListName(approvalMatrixListName)
            },

            ApplicationName: temp.ApplicationName.Label,
            FormName: temp.FormName.Label,
            SectionName: sectionName,
            //HiddenSection : temp.HiddenSection.results[0],
            Levels: parseInt(temp.Levels),
            Role: temp.Role,
            Days: parseInt(temp.Days),
            IsAutoApproval: temp.IsAutoApproval,
            FillByRole: temp.FillByRole,
            Division: temp.Division,
            //SubDivision : 
            ApproverId: { "results": approverResults },
            Status: !IsNullOrUndefined(temp.Status) ? temp.Status.toString() : '',
            Comments: !IsNullOrUndefined(temp.Comments) ? temp.Comments.toString() : '',
            AssignDate: temp.AssignDate,
            DueDate: temp.DueDate,
            ApprovalDate: temp.ApprovalDate,
            IsEscalate: temp.IsEscalate,
            //EscalationToId: temp.EscalationToId,
            //EscalationOn: temp.EscalationOn,
            ApproveById: temp.ApproveById,
            IsOptional: temp.IsOptional,
            FormType: temp.FormType,
            ReasonForDelay: !IsNullOrUndefined(temp.ReasonForDelay) ? temp.ReasonForDelay.toString() : '',
            ReasonForChange: !IsNullOrUndefined(temp.ReasonForChange) ? temp.ReasonForChange.toString() : '',
            IsReminder: temp.IsReminder,
            IsHOLD: !IsNullOrUndefined(temp.IsHOLD) ? temp.IsHOLD.toString() : '',
            RequestIDId: parseInt(temp.RequestIDId),
            //Attachments: false,
            //EscalationDays: temp.EscalationDays,
            //EscalationToId: temp.EscalationToId,
            //IsAutoRejection: temp.IsAutoRejection,
            //Reminder: null,
        });
    }
    else {
        stringifyData = JSON.stringify
            ({
                __metadata: {
                    type: GetItemTypeForListName(approvalMatrixListName)
                },
                ApproverId: { "results": approverResults },
                Status: !IsNullOrUndefined(temp.Status) ? temp.Status.toString() : '',
                Comments: !IsNullOrUndefined(temp.Comments) ? temp.Comments.toString() : '',
                AssignDate: temp.AssignDate,
                DueDate: temp.DueDate,
                ApprovalDate: temp.ApprovalDate,
                IsEscalate: temp.IsEscalate,
                ApproveById: temp.ApproveById,
                IsOptional: temp.IsOptional,
                ReasonForDelay: !IsNullOrUndefined(temp.ReasonForDelay) ? temp.ReasonForDelay.toString() : '',
                ReasonForChange: !IsNullOrUndefined(temp.ReasonForChange) ? temp.ReasonForChange.toString() : '',
                IsReminder: temp.IsReminder,
                IsHOLD: !IsNullOrUndefined(temp.IsHOLD) ? temp.IsHOLD.toString() : '',
            })
    }


    return stringifyData;

}

/*Pooja Atkotiya */
function SaveApprovalMatrixInList(tempApproverMatrix, approvalMatrixListName, isNewItem) {
    var url = '';
    var headers;
    tempApproverMatrix.forEach(temp => {
        //For multiUser field of sharepoint list
        var approverResults = [];
        if (isNewItem) {
            if (!IsNullOrUndefined(temp.ApproverId)) {
                if (IsArray(temp.ApproverId)) {
                    approverResults = temp.ApproverId;
                }
                else {
                    approverResults.push(parseInt(temp.ApproverId));
                }
            }
            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + approvalMatrixListName + "')/items";
            headers = {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "POST"
            };
            AjaxCall({
                url: url,
                httpmethod: 'POST',
                calldatatype: 'JSON',
                headers: headers,
                async: false,
                postData: stringifyData(isNewItem, approvalMatrixListName, temp, approverResults),
                sucesscallbackfunction: function (data) {
                    console.log("SaveApprovalMatrixInList - Item saved Successfully");
                }
            });
        }
        else {
            if (!IsNullOrUndefined(temp.ApproverId)) {
                if (IsArray(temp.ApproverId.results)) {
                    approverResults = temp.ApproverId.results;
                }
                else {
                    approverResults.push(parseInt(temp.ApproverId));
                }
            }
            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + approvalMatrixListName + "')/items(" + temp.Id + ")";
            headers = {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            };

            AjaxCall(
                {
                    url: url,
                    httpmethod: 'POST',
                    calldatatype: 'JSON',
                    headers: headers,
                    async: false,
                    postData: stringifyData(isNewItem, approvalMatrixListName, temp, approverResults),
                    sucesscallbackfunction: function (data) {
                        console.log("SaveApprovalMatrixInList - Item saved Successfully");
                    }
                });
        }
    });
}

/*Pooja Atkotiya */
function SaveFormFields(formFieldValues, requestId) {
    //For multiUser field of sharepoint list
    var nextResults = [];
    if (!IsNullOrUndefined(formFieldValues["NextApprover"]) && formFieldValues["NextApprover"].length > 0) {
        nextResults = IsArray(formFieldValues["NextApprover"]) ? formFieldValues["NextApprover"] : nextResults;
    }

    var mainlistDataArray = {};

    if (!IsNullOrUndefined(formFieldValues['RaisedBy'])) {
        mainlistDataArray['RaisedById'] = formFieldValues['RaisedBy'];
    }
    if (!IsNullOrUndefined(formFieldValues["FormLevel"])) {
        mainlistDataArray['FormLevel'] = formFieldValues["FormLevel"].toString();
    }
    if (!IsNullOrUndefined(nextResults))  ////&& nextResults.length > 0   - removed for case of complete and reject
    {
        mainlistDataArray['NextApproverId'] = { "results": nextResults };
    }
    if (!IsNullOrUndefined(formFieldValues["LastActionBy"])) {
        mainlistDataArray['LastActionBy'] = formFieldValues["LastActionBy"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["LastActionByRole"])) {
        mainlistDataArray['LastActionByRole'] = formFieldValues["LastActionByRole"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["PendingWith"])) {
        mainlistDataArray['PendingWith'] = formFieldValues["PendingWith"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["Status"])) {
        mainlistDataArray['Status'] = formFieldValues["Status"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["WorkflowStatus"])) {
        mainlistDataArray['WorkflowStatus'] = formFieldValues["WorkflowStatus"].toString();
    }

    if (!IsNullOrUndefined(formFieldValues["InitiatorSignature"])) {
        mainlistDataArray['InitiatorSignature'] = formFieldValues["InitiatorSignature"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["HODSignature"])) {
        mainlistDataArray['HODSignature'] = formFieldValues["HODSignature"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["PurchaseSignature"])) {
        mainlistDataArray['PurchaseSignature'] = formFieldValues["PurchaseSignature"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["ManagementSignature"])) {
        mainlistDataArray['ManagementSignature'] = formFieldValues["ManagementSignature"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["FunctionHeadSignature"])) {
        mainlistDataArray['FunctionHeadSignature'] = formFieldValues["FunctionHeadSignature"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["CapitalAssetRequisitionNumber"])) {
        mainlistDataArray['CapitalAssetRequisitionNumber'] = formFieldValues["CapitalAssetRequisitionNumber"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["InitiatorAction"])) {
        mainlistDataArray['InitiatorAction'] = formFieldValues["InitiatorAction"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["HODAction"])) {
        mainlistDataArray['HODAction'] = formFieldValues["HODAction"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["PurchaseAction"])) {
        mainlistDataArray['PurchaseAction'] = formFieldValues["PurchaseAction"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["FuctionHeadAction"])) {
        mainlistDataArray['FuctionHeadAction'] = formFieldValues["FuctionHeadAction"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["ManagementAction"])) {
        mainlistDataArray['ManagementAction'] = formFieldValues["ManagementAction"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["URSAttachment"])) {
        mainlistDataArray['URSAttachment'] = formFieldValues["URSAttachment"].toString();
    }
    if (!IsNullOrUndefined(formFieldValues["SupportDocAttachment"])) {
        mainlistDataArray['SupportDocAttachment'] = formFieldValues["SupportDocAttachment"].toString();
    }

    //ApprovalStatus : formFieldValues["ApprovalStatus"],
    //LastactionPerformed : formFieldValues["LastactionPerformed"],
    //IsReschedule: formFieldValues["IsReschedule"],

    if (!IsNullOrUndefined(mainlistDataArray) && Object.keys(mainlistDataArray).length > 0) {
        mainlistDataArray["__metadata"] = {
            "type": GetItemTypeForListName(ListNames.MAINLIST)
        };
        AjaxCall(
            {
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.MAINLIST + "')/items(" + requestId + ")",
                httpmethod: 'POST',
                calldatatype: 'JSON',
                postData: JSON.stringify(mainlistDataArray),
                async: false,
                headers:
                    {
                        "Accept": "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "IF-MATCH": "*",
                        "X-Http-Method": "MERGE", //PATCH
                    },
                sucesscallbackfunction: function (data) {
                    console.log("Item saved Successfully");
                }
            });
    }
}

/*Pooja Atkotiya */
function UpdateWorkflowStatus(formFieldValues) {
    var wfStatus = '';
    var formStatus = formFieldValues["Status"];
    var pendingWithRole = (!IsNullOrUndefined(formFieldValues["PendingWith"])) ? formFieldValues["PendingWith"] : '';
    var lastActionByRole = (!IsNullOrUndefined(formFieldValues["LastActionByRole"])) ? formFieldValues["LastActionByRole"] : '';
    if (!IsNullOrUndefined(formStatus) && !IsStrNullOrEmpty(formStatus)) {
        switch (formStatus) {
            case "Submitted":
                wfStatus = "Pending With " + pendingWithRole;
                break;
            case "Sent Back":
                wfStatus = "Sent back by " + lastActionByRole;
                break;
            default:
                wfStatus = formStatus;
                break;
        }
    }
    formFieldValues['WorkflowStatus'] = wfStatus;
}

/*Pooja Atkotiya */
function SetSectionWiseRoles(id) {
    var formNames = $($('div').find('[mainlistname]')).attr('id');
    if (id == 0) {
        ////Get data from global approval matrix
        if (!IsNullOrUndefined(globalApprovalMatrix) && globalApprovalMatrix.length > 0) {
            ////Compare by Section Name
            globalApprovalMatrix.filter(function (g) {
                $('#' + formNames).find('div.card-body').each(function () {
                    var divSection = $(this).attr('section');
                    var sectionName = getTermFromManagedColumn(g.SectionName);
                    if (!IsNullOrUndefined(divSection) && sectionName == divSection) {
                        //// if section name are same, get Role and FillByRole
                        $(this).attr('sectionOwner', g.Role);
                        $(this).attr('FillByRole', g.FillByRole);
                    }
                });
            });
        }
    } else if (id > 0) {
        ////Get data from local approval matrix
        if (!IsNullOrUndefined(localApprovalMatrixdata) && localApprovalMatrixdata.length > 0) {
            ////Compare by Section Name
            localApprovalMatrixdata.filter(function (l) {
                $('#' + formNames).find('div.card-body').each(function () {
                    var divSection = $(this).attr('section');
                    if (!IsNullOrUndefined(divSection) && !IsNullOrUndefined(l.SectionName) && l.SectionName == divSection) {
                        //// if section name are same, get Role and FillByRole
                        $(this).attr('sectionOwner', l.Role);
                        $(this).attr('FillByRole', l.FillByRole);
                        var divId = $(this).attr('id');
                        if (!IsNullOrUndefined(l.Comments) && !IsStrNullOrEmpty(l.Comments)) {
                            $('#' + divId + '_Comments').val(l.Comments);
                        }
                    }
                });
            });
        }
    }
}

/*Pooja Atkotiya */
function UpdateStatusofApprovalMatrix(tempApproverMatrix, currentLevel, previousLevel, actionPerformed, param) {
    if (!IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length > 0 && !IsNullOrUndefined(currentUser.Id)) {
        if (currentLevel != previousLevel) {
            var currentUserId = currentUser.Id;
            var nextLevel = currentLevel;
            switch (actionPerformed) {
                case ButtonActionStatus.SaveAndStatusUpdate:
                case ButtonActionStatus.SaveAndStatusUpdateWithEmail:
                case ButtonActionStatus.SaveAndNoStatusUpdate:
                case ButtonActionStatus.SaveAndNoStatusUpdateWithEmail:
                case ButtonActionStatus.Submit:
                case ButtonActionStatus.Reschedule:
                case ButtonActionStatus.UpdateAndRepublish:
                case ButtonActionStatus.ReadyToPublish:
                case ButtonActionStatus.Save:
                case ButtonActionStatus.SaveAsDraft:
                case ButtonActionStatus.None:
                    console.log("Save as draft condition => any approver=" + tempApproverMatrix.some(t => t.Levels == currentLevel));
                    if (tempApproverMatrix.some(t => t.Levels == currentLevel)) {
                        tempApproverMatrix.filter(function (temp) {
                            if (temp.Levels == currentLevel && temp.Status == ApproverStatus.NOTASSIGNED) {
                                temp.Status = ApproverStatus.PENDING;
                                var dueDate = (!isNaN(parseInt(temp.Days))) ? GetDueDate(new Date(), parseInt(temp.Days)) : null;
                                if (!IsNullOrUndefined(dueDate)) {
                                    temp.DueDate = dueDate;
                                }
                                temp.AssignDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                            }
                        });
                    }
                    break;
                case ButtonActionStatus.Delegate:
                case ButtonActionStatus.NextApproval:
                    tempApproverMatrix.filter(function (temp) {
                        ////right now searched by user Id, it may requires to check by name 
                        if (!IsNullOrUndefined(temp.ApproverId) && temp.Levels == currentLevel && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1))) {
                            temp.Status = ApproverStatus.APPROVED; /// "Approved";
                        }
                    });
                    ////Get Next Level
                    var nextLevelRow = tempApproverMatrix.sort(function (a, b) {
                        return a.Levels - b.Levels;
                    }).filter(function (temp) {
                        return (temp.Status != "Not Required" && !IsNullOrUndefined(temp.ApproverId) && temp.Levels > currentLevel);
                    })[0];
                    nextLevel = (!IsNullOrUndefined(nextLevelRow)) ? nextLevelRow.Levels : nextLevel;
                    //var dueDate = null;
                    tempApproverMatrix.forEach(temp => {
                        if (!IsNullOrUndefined(temp.ApproverId) && temp.Levels == currentLevel && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1))) {
                            temp.ApproveById = currentUserId;
                            temp.ApprovalDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                            temp.Status = ApproverStatus.APPROVED; ////"Approved";
                        }
                        else if (temp.Levels == nextLevel && (temp.Status != "Approved" && temp.Status != "Not Required")) {
                            var dueDate = (!isNaN(parseInt(temp.Days))) ? GetDueDate(new Date(), parseInt(temp.Days)) : null;
                            if (!IsNullOrUndefined(dueDate)) {
                                temp.DueDate = dueDate;
                            }
                            temp.AssignDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                            temp.Status = ApproverStatus.PENDING; //"Pending";
                        }
                        else if (temp.Levels > nextLevel && temp.Status != "Not Required") {
                            temp.Status = ApproverStatus.NOTASSIGNED;   // "Not Assigned";
                        }
                    });
                    break;
                case ButtonActionStatus.BackToCreator:
                case ButtonActionStatus.SendBack:
                    var sendtoRole = '';
                    debugger;
                    if ((ConstantKeys.SENDTOLEVEL in param) && !IsNullOrUndefined(param[ConstantKeys.SENDTOLEVEL])) {
                        nextLevel = parseInt(param[ConstantKeys.SENDTOLEVEL]);
                    }
                    if ((ConstantKeys.SENDTOROLE in param) && !IsStrNullOrEmpty(param[ConstantKeys.SENDTOROLE])) {
                        sendtoRole = param[ConstantKeys.SENDTOROLE];
                    }
                    tempApproverMatrix.forEach(temp => {
                        if (!IsNullOrUndefined(temp.ApproverId) && temp.Levels == currentLevel && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1))) {
                            temp.ApproveById = currentUserId;
                            temp.ApprovalDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                            temp.Status = ApproverStatus.SENDBACK;
                        }
                        else if (temp.Levels == nextLevel) {
                            if (IsStrNullOrEmpty(sendtoRole) || (!IsStrNullOrEmpty(sendtoRole) && temp.Role == sendtoRole)) {
                                var dueDate = (!isNaN(parseInt(temp.Days))) ? GetDueDate(new Date(), parseInt(temp.Days)) : null;
                                if (!IsNullOrUndefined(dueDate)) {
                                    temp.DueDate = dueDate;
                                }
                                temp.AssignDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                                temp.Status = ApproverStatus.PENDING;
                            }
                        }
                        else if (temp.Levels > nextLevel) {
                            temp.Status = ApproverStatus.NOTASSIGNED;
                        }
                    });
                    break;
                case ButtonActionStatus.SendForward:
                    debugger
                    if ((ConstantKeys.SENDTOLEVEL in param) && !IsNullOrUndefined(param[ConstantKeys.SENDTOLEVEL])) {
                        nextLevel = parseInt(param[ConstantKeys.SENDTOLEVEL]);
                        ////Get Next Level
                        var nextLevelRow = tempApproverMatrix.sort(function (a, b) {
                            return a.Levels - b.Levels;
                        }).filter(function (temp) {
                            return (!IsNullOrUndefined(temp.ApproverId) && temp.Levels >= nextLevel);
                        })[0];
                        nextLevel = (!IsNullOrUndefined(nextLevelRow)) ? nextLevelRow.Levels : nextLevel;
                    }
                    tempApproverMatrix.ForEach(temp => {
                        if (!IsNullOrUndefined(temp.ApproverId) && temp.Levels == currentLevel && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1))) {
                            temp.ApproveById = currentUserId;
                            temp.ApprovalDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                            temp.Status = ApproverStatus.SENDFORWARD;
                        }
                        else if (temp.Levels == nextLevel) {
                            var dueDate = (!isNaN(parseInt(temp.Days))) ? GetDueDate(new Date(), parseInt(temp.Days)) : null;
                            if (!IsNullOrUndefined(dueDate)) {
                                temp.DueDate = dueDate;
                            }
                            temp.AssignDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                            temp.Status = ApproverStatus.PENDING;
                        }
                        else if (temp.Levels > nextLevel) {
                            temp.Status = ApproverStatus.NOTASSIGNED;
                            // temp.AssignDate = null;
                            // temp.DueDate = null;
                            // temp.Comments = string.Empty;
                        }
                    });
                    break;
                case ButtonActionStatus.Cancel:
                    break;
                case ButtonActionStatus.Rejected:
                    debugger
                    if (tempApproverMatrix.some(temp => temp.Levels == currentLevel && !IsNullOrUndefined(temp.ApproverId) && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1)))) {
                        var approvers = tempApproverMatrix.filter(temp => {
                            return (temp.Levels == currentLevel && !IsNullOrUndefined(temp.ApproverId) && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1)));
                        })[0];
                        approvers.Status = ApproverStatus.APPROVED;
                        approvers.ApprovalDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                        approvers.ApproveById = currentUserId;
                    }
                    break;
                case ButtonActionStatus.Complete:
                    debugger
                    if (tempApproverMatrix.some(temp => temp.Levels == currentLevel && !IsNullOrUndefined(temp.ApproverId) && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1)))) {
                        var approvers = tempApproverMatrix.filter(temp => {
                            return (temp.Levels == currentLevel && !IsNullOrUndefined(temp.ApproverId) && ((!IsNullOrUndefined(temp.ApproverId.results) && temp.ApproverId.results.length > 0) ? temp.ApproverId.results.some(item => item == currentUserId) : (temp.ApproverId.toString().indexOf(currentUserId) != -1)));
                        })[0];
                        approvers.Status = ApproverStatus.APPROVED;
                        approvers.ApprovalDate = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                        approvers.ApproveById = currentUserId;
                    }
                    break;
                case ButtonActionStatus.MeetingConducted:
                case ButtonActionStatus.MeetingNotConducted:
                default:
                    break;
            }
        }
    }
}

/*Pooja Atkotiya */
function GetDueDate(startDate, days) {
    ////Count from Next Day
    startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    for (var i = 0; i < days; i++) {
        var date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        var day = date.getDay();
        switch (day) {
            case DayOfWeek.Saturday:
            case DayOfWeek.Sunday:
                days++;
                break;
            default:
                // if (holidays.Contains(date.ToString("dd/MM")))
                // {
                //days++;
                //}
                break;
        }
    }
    dueDate = new Date(startDate.getTime() + ((days - 1) * 24 * 60 * 60 * 1000)).format("yyyy-MM-ddTHH:mm:ssZ");
    if (IsValidDate(dueDate)) {
        return dueDate;
    }
    else {
        return null;
    }
}