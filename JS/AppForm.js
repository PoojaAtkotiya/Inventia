var listName = ListNames.MAINLIST;
var appName = CommonConstant.APPLICATIONNAME;
var formName = CommonConstant.FORMNAME;
var masterDataArray;
var formData = {};
var mainListData = {};
var sendToLevel = 0;
var collListItem = null;

$(document).ready(function () {

    // GetUsersForDDL(Roles.HOD, "LUMMarketingDelegateId");
    // GetUsersForDDL(Roles.CAPEXCOMMITTEE, "SCMLUMDesignDelegateId");
    // $(document).on("change", "#UploadArtworkAttachment", function () {
    //     BindAttachmentFiles();
    // });
    $(document).on('click', 'a[id*="btnActivityLog_"]', function () {
        var iterationId = jQuery(this).attr('id').split('_')[1];
        var activityChanges = jQuery(this).attr('data-val');
        DisplayActvityLogChanges(iterationId, activityChanges);
    });
});

/*Monal Shah */
function GetSetFormData() {
    //GetTranListData(listItemId);
    GetAllTranlists(listItemId);
    var mainListName = $($('div').find('[mainlistname]')).attr('mainlistname');
    
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + mainListName + "')/items(" + listItemId + ")?$select=RaisedBy/Title,*&$expand=RaisedBy",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            sucesscallbackfunction: function (data) { onGetSetFormDataSuccess(data) }
        });
}

/*Pooja Atkotiya */
function onGetSetFormDataSuccess(data) {
    var mainListName = $($('div').find('[mainlistname]')).attr('mainlistname');
    var activitylogTableId = 'tblActivityLog';
    mainListData = data;
    var item = data;
    if (!IsNullOrUndefined(item) && item != '') {
        $('.dynamic-control').each(function () {
            var listType = $(this).attr('listtype');
            var reflisttype = $(this).attr('reflisttype');
            var elementId = $(this).attr('id');
            var fieldName = $(this).attr('id');
            var elementType = $(this).attr('controlType');
            if (elementType == 'multicheckbox')
                fieldName = $(this).attr("cParent");
            else if (elementType == 'radiogroup')
                fieldName = $(this).attr("cParent");

            if (listType == 'main' || reflisttype == 'main') {
                setFieldValue(elementId, item, elementType, fieldName);
            }
        });
        $(".static-control").each(function () {
            var listType = $(this).attr('listtype');
            var reflisttype = $(this).attr('reflisttype');
            var controlType = $(this).attr("controlType");
            var cType = $(this).attr("type");
            if (controlType == 'multicheckbox')
                fieldName = $(this).attr("cParent");
            else if (controlType == 'radiogroup')
                fieldName = $(this).attr("cParent");

            var id = $(this).attr("id");
            var fieldName = $(this).attr("id");
            if (listType == 'main' || reflisttype == 'main') {
                setStaticFieldValue(id, item, controlType, cType, fieldName);
            }
        });
    }
    GetLocalApprovalMatrixData(listItemId, mainListName);

    GetActivityLog(ListNames.ACTIVITYLOGLIST, listItemId, activitylogTableId);
}

/*Pooja Atkotiya */
function setCustomApprovers(tempApproverMatrix) {
    if (!IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != -1) {
        var smsIncharge = null;
        var smsDelegate = null;
        tempApproverMatrix.filter(function (temp) {
            if (temp.Role == "SMS Incharge" && !IsNullOrUndefined(temp.ApproverId)) {
                smsIncharge = temp.ApproverId;
            }
            else if (temp.Role == "SMS Delegate" && !IsNullOrUndefined(temp.ApproverId)) {
                smsDelegate = temp.ApproverId;
            }
        });
        if (!IsNullOrUndefined(smsIncharge)) {
            tempApproverMatrix.filter(function (temp) {
                if (temp.Role == "Final SMS Incharge" && temp.Status != "Not Required") {
                    temp.ApproverId = smsIncharge;
                }
            });
        }
        if (!IsNullOrUndefined(smsDelegate)) {
            tempApproverMatrix.filter(function (temp) {
                if (temp.Role == "Final SMS Delegate" && temp.Status != "Not Required") {
                    temp.ApproverId = smsDelegate;
                }
            });
        }
    }
}

/*Monal Shah */
function Capex_SaveData(ele) {
    if (activeSectionName == SectionNames.PURCHASESECTION) {
        // gTranArray.push({ "TranListArray": listTempGridDataArray, "TranListName": ListNames.CAPEXVENDORLIST });  ////Vendor tran added in global tran
        if (listTempGridDataArray.length < 3) {
            AlertModal('Error', "Max 3 vendor required");
            return false;
        }
    }
    ValidateForm(ele, SaveDataCallBack);

    function SaveDataCallBack(activeSection) {
        var isError = FormBusinessLogic(activeSection);


        if (!isError) {
            SaveForm(activeSection, ele);
        }
    }
}


function FormBusinessLogic(activeSection) {
    var isError = false;
    try {

        /* Add final saved tran array to global tran array to save in list*/

        gTranArray.push({ "TranListArray": listTempGridDataArray, "TranListName": ListNames.CAPEXVENDORLIST });  ////Vendor tran added in global tran

        //     //check if there any delegate user fillby section owner        
        //     ////Pending to make it dynamic
        //     if (!IsNullOrUndefined(listDataArray.SCMLUMDesignDelegateId)) {
        //         var array = [];
        //         array.push(parseInt(listDataArray.SCMLUMDesignDelegateId));
        //         listDataArray["SCMLUMDesignDelegateId"] = { "results": array };
        //     }
    }
    catch (Exception) {
        isError = true;
        console.log("Error occured in FormBusinessLogic" + Exception);
    }
    return isError;
}

/*Monal Shah */
function SaveForm(activeSection, ele) {
    try {
        SaveFormData(activeSection, ele);
    }
    catch (Exception) {
        console.log("Error occured in SaveForm" + Exception);
    }
}

/*Priya Rane */
// function AddURSAttachments(listname, itemID) {
//     $('#divCapexForm').find('div[section]').not(".disabled").each(function (i, e) {

//         $(e).find('input[type="file"]').each(function () {
//             var elementId = $(this).attr('id');
//             var controlType = $(this).attr('controlType');
//             // if (controlType == "file") {
//             if (!IsNullOrUndefined(fileURSArray)) {
//                 // SaveItemWiseAttachments(listname, itemID);
//                 var formFieldValues = [];
//                 fileURSArray.forEach(element => {
//                     var fileName = element.name;
//                     formFieldValues['URSAttachment'] = fileName;
//                 });
//                 var item = $pnp.sp.web.lists.getByTitle(listname).items.getById(itemID);

//                 item.attachmentFiles.addMultiple(fileURSArray).then(v => {
//                     console.log("files saved successfully in list = " + listname + "for listItemId = " + itemID);
//                 }).catch(function (err) {
//                     console.log(err);
//                     console.log("error while save attachment ib list = " + listname + "for listItemId = " + itemID)
//                 });
//                 SaveFormFields(formFieldValues, itemID);
//             }
//             // }

//         });
//     });
// }

function AddURSAttachments(listname, itemID) {
    $('#divCapexForm').find('div[section]').not(".disabled").each(function (i, e) {
        $(e).find('input[type="file"]').each(function () {


            if (!IsNullOrUndefined(fileURSArray)) {

                var formFieldValues = [];
                fileURSArray.forEach(element => {
                    var fileName = element.name;
                    formFieldValues['URSAttachment'] = fileName;
                });
                var item = $pnp.sp.web.lists.getByTitle("Attachments").items.getById(itemID);

                item.attachmentFiles.addMultiple(fileURSArray).then(v => {
                    console.log("files saved successfully in list = " + listname + "for listItemId = " + itemID);
                }).catch(function (err) {
                    console.log(err);
                    console.log("error while save attachment ib list = " + listname + "for listItemId = " + itemID)
                });
                SaveFormFields(formFieldValues, itemID);
            }


        });
    });
}

function AddSupportiveDocAttachments(listname, itemID) {
    $('#divCapexForm').find('div[section]').not(".disabled").each(function (i, e) {

        $(e).find('input[type="file"]').each(function () {
            var elementId = $(this).attr('id');
            var controlType = $(this).attr('controlType');
            // if (controlType == "file") {
            if (!IsNullOrUndefined(fileSupportDocArray)) {
                // SaveItemWiseAttachments(listname, itemID);
                var formFieldValues = [];
                fileSupportDocArray.forEach(element => {
                    var fileName = element.name;
                    formFieldValues['SupportDocAttachment'] = fileName + ',';
                });
                var item = $pnp.sp.web.lists.getByTitle(listname).items.getById(itemID);

                item.attachmentFiles.addMultiple(fileSupportDocArray).then(v => {
                    console.log("files saved successfully in list = " + listname + "for listItemId = " + itemID);
                }).catch(function (err) {
                    console.log(err);
                    console.log("error while save attachment ib list = " + listname + "for listItemId = " + itemID)
                });
                SaveFormFields(formFieldValues, itemID);
            }
            // }

        });
    });
}

/*Priya Rane */
function GetAttachmentValue(elementId, fileListArray) {
    var input = document.getElementById("UploadArtworkAttachment")
    var fileCount = input.files.length;
    for (var i = 0; i < fileCount; i++) {
        var file = input.files[i];
        var reader = new FileReader();
        reader.onload = (function (file) {
            return function (e) {
                console.log(file.name);
                fileURSArray.push({
                    "name": file.name,
                    "content": e.target.result
                });
            }
        })(file);
        reader.readAsArrayBuffer(file);
    }
}

/*Priya Rane */
function SaveItemWiseAttachments(listname, itemID) {
    var formFieldValues = [];
    fileURSArray.forEach(element => {
        var fileName = element.name;
        formFieldValues['URSAttachment'] = fileName;
    });
    var item = $pnp.sp.web.lists.getByTitle(listname).items.getById(itemID);

    item.attachmentFiles.addMultiple(fileURSArray).then(v => {
        console.log("files saved successfully in list = " + listname + "for listItemId = " + itemID);
    }).catch(function (err) {
        console.log(err);
        console.log("error while save attachment ib list = " + listname + "for listItemId = " + itemID)
    });
    SaveFormFields(formFieldValues, itemID);
}

function GetFormBusinessLogic(listItemId, activeSectionName, department) {
    var sectionName;
    var pendingWithRole; //from mainListData
    if (mainListData.length == 0) {
        pendingWithRole = "Creator";
    }
    if (IsNullOrUndefined(department)) {
        department = mainListData.Department;
    }
    if (listItemId == 0) {
        setNewFormParamters(department)
    }
    if (!IsNullOrUndefined(listItemId) && listItemId > 0) {
        setImageSignature();
    }
    if (pendingWithRole == "Creator" || listItemId == "") {
        setFunctionbasedDept(department);
    }
    bindAssetName(department);
    if (listItemId > 0) {
       if(mainListData.Status =="Draft"){
        BindURSEditAttachmentFiles();
<<<<<<< HEAD
       }
       else
       {
           BindInitiatorAttachment();
       }
=======
        //   bindAttachments();
>>>>>>> 9d7e195c2cd68a17025a08f3eddd7a20a35efe1a
    }

    if (mainListData.PendingWith == "Initiator HOD") {
        setVendorDropDown(department);
        SetBudgetValue(department);
    }
    else {
        if (mainListData.SelectedVendor != undefined) {
            var objSelect = document.getElementById("SelectedVendor");
            setSelectedValue(objSelect, mainListData.SelectedVendor);
        }
    }

}
function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].text == valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
}

function setNewFormParamters(department) {
    $("#RaisedBy").html(currentUser.Title);
    $("#InitiatorName").html(currentUser.Title);
    var today = new Date().format("MM-dd-yyyy");
    $("#RaisedOn").html(today);
    $("#WorkflowStatus").html("New");
    $("#Department").html(department);
}
function setVendorDropDown() {
    $("#SelectedVendor").html('');
    $("#SelectedVendor").html("<option value=''>Select</option>");
    $(listTempGridDataArray).each(function (i, e) {
        var cmditem = listTempGridDataArray[i].VendorName;
        var opt = $("<option/>");
        opt.text(cmditem);
        opt.attr("value", cmditem);
        opt.appendTo($("#SelectedVendor"));
    });
    if (mainListData.SelectedVendor != undefined) {
        var objSelect = document.getElementById("SelectedVendor");
        setSelectedValue(objSelect, mainListData.SelectedVendor);
    }
}
function setFunctionbasedDept(department) {
    AjaxCall(
        {

            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.DEPTFUNCTIONMASTER + "')/Items?$select=Function/Title,Department/Title,*&$expand=Department/Title,Function/Title&$filter=Department/Title eq '" + department + "'",
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
                if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d) && !IsNullOrUndefined(data.d.results)) {
                    $("#Function").html(data.d.results[0].Function.Title);
                }
            }
        });
}

function bindAssetName(department) {
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.BUDGETMASTER + "')/Items?$select=AssetName,Department/Title&$expand=Department/Title&$filter=Department/Title eq '" + department + "'",
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
                if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d) && !IsNullOrUndefined(data.d.results)) {
                    var result = data.d.results;

                    $('input[listname*=' + ListNames.BUDGETMASTER + '],select[listname*=' + ListNames.BUDGETMASTER + ']').each(function () {
                        var elementId = $(this).attr('id');
                        var elementType = $(this).attr('controlType');
                        var valueBindingColumn = $(this).attr('valuebindingcolumn');
                        var textBindingColumnn = $(this).attr('textbindingcolumnn');
                        switch (elementType) {
                            case "combo":
                                $("#" + elementId).html('');
                                $("#" + elementId).html("<option value=''>Select</option>");
                                if (!IsNullOrUndefined(valueBindingColumn) && !IsNullOrUndefined(textBindingColumnn) && valueBindingColumn != '' && textBindingColumnn != '') {
                                    $(result).each(function (i, e) {
                                        var cmditem = result[i];
                                        var opt = $("<option/>");
                                        opt.text(cmditem[textBindingColumnn]);
                                        opt.attr("value", cmditem[valueBindingColumn]);
                                        opt.appendTo($("#" + elementId));
                                    });
                                }

                                break;

                        }
                    });
                    if (mainListData.AssetName != undefined) {
                        var objSelect = document.getElementById("AssetName");
                        setSelectedValue(objSelect, mainListData.AssetName);
                    }
                }
            }
        });
}

// function bindAttachments() {
//     fileURSArray = [];
//     var Requestorurl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('CapexRequisition')/items(" + listItemId + ")/AttachmentFiles";
//     if (!IsNullOrUndefined(mainListData.URSAttachment)) {
//         getListItems(Requestorurl, function (data) {
//             var results = data.d.results;

//             if (results.length > 0) {
//                 results.forEach(element => {
//                     if (!IsNullOrUndefined(mainListData.URSAttachment) && element.FileName == mainListData.URSAttachment) {
//                         var htmlStr = "";
//                         fileURSArray = previewFile(fileURSArray, element.ServerRelativeUrl, element.FileName, 1);
//                         if (htmlStr === "") {
//                             htmlStr = "<li><a id='attachment' href='" + element.ServerRelativeUrl + "'>" + element.FileName + "</a><a href=\"javascript:removeURSFile('" + element.FileName + "')\"> Remove</a></li>";
//                         }
//                         else {
//                             htmlStr = htmlStr + "<li><a id='attachment' href='" + element.ServerRelativeUrl + "'>" + element.FileName + "</a></li><a href=\"javascript:removeURSFile('" + element.FileName + "')\"> Remove</a></li>";

//                         }
//                         $('#URSContainer').html(htmlStr);
//                     }
//                     $('#URSContainer').html(htmlStr);
//                 });

//                 // $.each(data.d.results, function () {


//                 // });
//                 var htmlStr = "";
//                 results.forEach(element => {
//                     if (!IsNullOrUndefined(mainListData.SupportDocAttachment)) {
//                         var supportDocNames = [];
//                         supportDocNames = TrimComma(mainListData.SupportDocAttachment).split(",");

//                         var fileId = 0;
//                         supportDocNames.forEach(function (element1) {
//                             if (element.FileName == element1) {
//                                 fileId++;
//                                 fileSupportDocArray = previewFile(fileSupportDocArray, element.ServerRelativeUrl, element.FileName, fileId);
//                                 if (htmlStr === "") {
//                                     htmlStr = "<li><a id='attachment' href='" + element.ServerRelativeUrl + "'>" + element.FileName + "</a><a href=\"javascript:removeSupportFiles('" + element.FileName + "')\"> Remove</a></li>";

//                                 }
//                                 else {
//                                     htmlStr = htmlStr + "<li><a id='attachment' href='" + element.ServerRelativeUrl + "'>" + element.FileName + "</a></li>";
//                                 }
//                             }
//                         });
//                         $('#SupportiveDocContainer').html(htmlStr);
//                     }
//                 });
//             }
//         });
//     }
// }

function BindURSEditAttachmentFiles() {
    var attachmentdata = [];
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.ATTACHMENTLIST + "')/Items?$select=*&$filter=RequestID eq '" + listItemId + "'",
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
                attachmentdata = data.d.results;
                attachmentdata.forEach(element => {
                    if (element.Title == "URS") {

                        var htmlStr = "";
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (htmlStr === "") {
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a><a href=\"javascript:removeURSFile('" + element.ID + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a></li><a href=\"javascript:removeURSFile('" + element.FileName + "')\"> Remove</a></li>";

                        }
                        fileCommonArray.push({
                            "name": "URS",
                            "id": element.ID,
                            "filename": element.FileName
                        });
                        $('#URSContainer').html(htmlStr);
                    }
                });

                attachmentdata.forEach(element => {


                    if (element.Title == "Supportive") {
                        var htmlStr = "";
                        var checkFile = $('#fileListSupportiveDoc').html();
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (checkFile === "") {
                            htmlStr = "<li id=li_" + element.ID + "><a id='attachment_" + element.ID + "' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a><a id='Remove_" + element.ID + "' href=\"javascript:removeSupportiveFile('" + element.ID + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = checkFile + "<li id=li_" + element.ID + "><a id='attachment_" + element.ID + "' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a></li><a id='Remove_" + element.ID + "' href=\"javascript:removeSupportiveFile('" + element.ID + "')\"> Remove</a></li>";

                        }
                        fileCommonArray.push({
                            "name": "URS",
                            "id": element.ID,
                            "filename": element.FileName
                        });


                        $('#fileListSupportiveDoc').html(htmlStr);
                    }
                });

            }
        });

}

function BindInitiatorAttachment() {
    var attachmentdata = [];
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.ATTACHMENTLIST + "')/Items?$select=*&$filter=RequestID eq '" + listItemId + "'", 
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
                attachmentdata = data.d.results;
                attachmentdata.forEach(element => {
                    if (element.Title == "URS") {

                        var htmlStr = "";
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (htmlStr === "") {
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a></li>";

                        }
                      
                        $('#URSContainer').html(htmlStr);
                    }
              });

                attachmentdata.forEach(element => {
                    

                    if (element.Title == "Supportive") {
                        var htmlStr = "";
                        var checkFile = $('#fileListSupportiveDoc').html();
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;
    
                        if (checkFile === "") {
                            htmlStr = "<li id=li_" + element.ID + "><a id='attachment_" + element.ID + "' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";
                        }
                        else {
                            htmlStr = checkFile + "<li id=li_" + element.ID + "><a id='attachment_" + element.ID + "' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a></li>";
    
                        }
                      
                        
                        $('#fileListSupportiveDoc').html(htmlStr);
                    }
                });

            }
        });
   
}
function removeSupportFiles(fileName) {
    var ctx = SP.ClientContext.get_current();
    var list = ctx.get_web().get_lists().getByTitle("CapexRequisition");
    var item = list.getItemById(listItemId);
    var attachmentFile = item.get_attachmentFiles().getByFileName(fileName);
    attachmentFile.deleteObject();
    ctx.executeQueryAsync(
        function () {

        },
        function (sender, args) {
            console.log(args.get_message());
        });


}



function getListItems(siteurl, success, failure) {
    $.ajax({
        url: siteurl,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}

function previewFile(fileArray, url, fileName, fileID) {

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'blob';
    request.onload = function () {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload = function (e) {
            fileArray.push({
                "name": fileName,
                "content": e.target.result,
                "id": fileID
            });
            console.log('DataURL:', e.target.result);
        };
    };
    request.send();
    return fileArray;
}
function SetBudgetValue(department) {
    if (!IsNullOrUndefined(department)) {
        AjaxCall(
            {

                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.BUDGETMASTER + "')/Items?$select=AssetName,Department/Title,BudgetedValue,UtilisedValue&$expand=Department/Title&$filter=Department/Title eq '" + department + "'and AssetName eq '" + mainListData.AssetName + "'",
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
                    if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d) && !IsNullOrUndefined(data.d.results)) {
                        $("#BudgetedValue").val(data.d.results[0].BudgetedValue);
                        $("#UtilizedValue").val(data.d.results[0].UtilisedValue);

                    }
                }
            });
    }
}

function SetCurrentValue() {
    var vendorname = $("#SelectedVendor").val();
    if (vendorname != "Select") {
        $(listTempGridDataArray).each(function (i, e) {
            if (vendorname == listTempGridDataArray[i].VendorName) {
                $("#CurrentValue").val(listTempGridDataArray[i].TotalValue);
                var TotalUtilizedValue = (+$("#UtilizedValue").val()) + (+listTempGridDataArray[i].TotalValue);
                var Balance = $("#BudgetedValue").val() - TotalUtilizedValue;
                $("#TotalUtilizedValue").val(TotalUtilizedValue);
                $("#Balance").val(Balance);
            }
        });
    }

}