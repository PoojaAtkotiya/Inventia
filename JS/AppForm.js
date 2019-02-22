var listName = ListNames.MAINLIST;
var appName = CommonConstant.APPLICATIONNAME;
var formName = CommonConstant.FORMNAME;
var masterDataArray;
var formData = {};
var mainListData = {};
var sendToLevel = 0;
var collListItem = null;
var param = {};

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
function setCustomApprovers() {
    var location = $('#Location').val();
    if (!IsNullOrUndefined(location) && !IsStrNullOrEmpty(location) && !IsNullOrUndefined(activeSectionName) && !IsStrNullOrEmpty(activeSectionName) && !IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != -1) {
        if (activeSectionName == SectionNames.INITIATORSECTION) {
            tempApproverMatrix.filter(function (temp) {
                if (temp.Role == Roles.MANAGEMENT && temp.Status != "Not Required") {
                    approverMaster.filter(app => {
                        if (temp.Role == app.Role && app.UserSelection == true && !IsNullOrUndefined(app.Location) && !IsStrNullOrEmpty(app.Location.Title) && app.Location.Title == location) {
                            if (app.UserNameId.results.length > 0) {
                                temp.ApproverId = app.UserNameId.results;
                            }
                        }
                    });

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
            AlertModal('Error', "Minimum 3 vendor required");
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

        // param[ConstantKeys.SENDTOLEVEL] = 0;                 // ConstantKeys.SENDTOLEVEL
        // param[ConstantKeys.SENDTOROLE] = "";
        // param[ConstantKeys.SENDBACKTO] = "";
        // param[ConstantKeys.ACTIONPERFORMED] = actionPerformed;
        if (activeSectionName == SectionNames.FUNCTIONHEADSECTION) {
            var actionStatus = $("#ActionStatus").val();
            if (actionStatus == ButtonActionStatus.NextApproval) {
                var budgetValue=[];
                 budgetValue = GetBudgetValue();
                var utilizedValue = $('#TotalUtilizedValue').val();
                if(budgetValue[0] > utilizedValue){
                param[ConstantKeys.ACTIONPERFORMED] = ButtonActionStatus.Complete;
                UpdateBudget(budgetValue[1]);
                }
                else{
                    param[ConstantKeys.ACTIONPERFORMED] = ButtonActionStatus.NextApproval;
                }
            }
        }
        if (activeSectionName == SectionNames.MANAGEMENTSECTION) {
            var actionStatus = $("#ActionStatus").val();
            if (actionStatus == ButtonActionStatus.NextApproval ||actionStatus == ButtonActionStatus.Complete) {
                var budgetValue=[];
                budgetValue = GetBudgetValue();
                   UpdateBudget(budgetValue[1]);
                }
            }
        
        /* Add final saved tran array to global tran array to save in list*/

        gTranArray.push({ "TranListArray": listTempGridDataArray, "TranListName": ListNames.CAPEXVENDORLIST });  ////Vendor tran added in global tran
        setCustomApprovers(listItemId);
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
    if (mainListData.length == 0 || mainListData.Status == "Draft") {
        pendingWithRole = "Creator";
    }

    //Functions for Initiator
    if (IsNullOrUndefined(department)) {
        department = mainListData.Department;
    }
    if (listItemId == 0) {
        setNewFormParamters(department)
    }
    else{
        $("#RaisedOnDisplay").html(new Date(mainListData.RaisedOn).format("dd-MM-yyyy"));
    }
    if (pendingWithRole == "Creator" || listItemId == "") {
        setFunctionbasedDept(department);
        bindAssetClassification();
        $('#btnAddVendor').hide();
    }
    if (listItemId > 0) {
        if (mainListData.Status == "Draft") {
            BindInitiatorEditAttachmentFiles();
            $('#btnAddVendor').hide();
        }
        else {
            BindInitiatorAttachment();
        }
        if(mainListData.Status == "Submitted" ||mainListData.Status == "Completed" ||mainListData.Status =="Rejected")
        {
            if (mainListData.AssetClassification != undefined) {
                bindEditAssetClassification();
             }
        }
        bindEditAssetName(mainListData.AssetClassification);
    }


    //Functions for Purchase
    if (mainListData.WorkflowStatus == "Pending for Purchase") {
        BindPurchaseEditAttachmentFiles();
    }
    else if (mainListData.WorkflowStatus == "Closed" || mainListData.WorkflowStatus == "Rejected" || mainListData.PendingWith == Roles.INITIATORHOD || mainListData.PendingWith == Roles.FUNCTIONHEAD || mainListData.PendingWith == Roles.MANAGEMENT) {
        BindPurchaseAttachment();
        $('[id*="EditVendor_"]').hide();
        $('[id*="DeleteVendor_"]').hide();
        $('#btnAddVendor').hide();
    }

    //Functions for Initiator HOD
    if (mainListData.PendingWith == "Initiator HOD") {
        setVendorDropDown();
        SetBudgetValue();
    }
    else {
        if (mainListData.SelectedVendor != undefined) {
            setVendorDropDown();
        }
    }
    if (mainListData.PendingWith == Roles.INITIATORHOD) {
        BindHODEditAttachmentFiles();
    }
    else if (mainListData.WorkflowStatus == "Closed" || mainListData.WorkflowStatus == "Rejected" || mainListData.PendingWith == Roles.INITIATORHOD || mainListData.PendingWith == Roles.FUNCTIONHEAD || mainListData.PendingWith == Roles.MANAGEMENT) {
        BindHODAttachment();
    }

    //common functions for all department
    if (!IsNullOrUndefined(listItemId) && listItemId > 0) {
        setImageSignature();
        displayAction();
    }
}
function displayAction() {
    if (mainListData.InitiatorAction !== undefined && mainListData.InitiatorAction != "") {
        var initiatorActions = [];
        var html = "";
        if (!IsStrNullOrEmpty(mainListData.InitiatorAction) && !IsNullOrUndefined(mainListData.InitiatorAction)) {
            initiatorActions = TrimComma(mainListData.InitiatorAction).split(",");
        }
        for (var i = 0; i < initiatorActions.length; i++) {
            html = html + initiatorActions[i] + '<br />';

        }
        $('#dispInitiatorAction').html(html);
    }
    if (mainListData.PurchaseAction !== undefined && mainListData.PurchaseAction != "") {
        var PurchaseActions = [];
        var html = "";
        if (!IsStrNullOrEmpty(mainListData.PurchaseAction) && !IsNullOrUndefined(mainListData.PurchaseAction)) {
            PurchaseActions = TrimComma(mainListData.PurchaseAction).split(",");
        }
        for (var i = 0; i < PurchaseActions.length; i++) {
            html = html + PurchaseActions[i] + '<br />';
        }
        $('#PurchaseAction').html(html);
    }
    if (mainListData.HODAction !== undefined && mainListData.HODAction != "") {
        var HODActions = [];
        var html = "";
        if (!IsStrNullOrEmpty(mainListData.HODAction) && !IsNullOrUndefined(mainListData.HODAction)) {
            HODActions = TrimComma(mainListData.HODAction).split(",");
        }
        for (var i = 0; i < HODActions.length; i++) {
            html = html + HODActions[i] + '<br />';

        }
        $('#HODAction').html(html);
    }
    if (mainListData.FuctionHeadAction !== undefined && mainListData.FuctionHeadAction != "") {
        var functionHeadActions = [];
        var html = "";
        if (!IsStrNullOrEmpty(mainListData.FuctionHeadAction) && !IsNullOrUndefined(mainListData.FuctionHeadAction)) {
            functionHeadActions = TrimComma(mainListData.FuctionHeadAction).split(",");
        }
        for (var i = 0; i < functionHeadActions.length; i++) {
            html = html + functionHeadActions[i] + '<br />';
        }
        $('#FunctionHeadAction').html(html);
    }
    if (mainListData.ManagementAction !== undefined && mainListData.ManagementAction != "") {
        var managementActions = [];
        var html = "";
        if (!IsStrNullOrEmpty(mainListData.ManagementAction) && !IsNullOrUndefined(mainListData.ManagementAction)) {
            managementActions = TrimComma(mainListData.ManagementAction).split(",");
        }
        for (var i = 0; i < managementActions.length; i++) {
            html = html + managementActions[i] + '<br />';
        }
        $('#ManagementAction').html(html);
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
   // var today = new Date().format("dd-MM-yyyy");
    var today = new Date().format("MM-dd-yyyy");
    var todaydisplay = new Date().format("dd-MM-yyyy");
    $("#RaisedOn").html(today);
    $("#RaisedOnDisplay").html(todaydisplay);
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

            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.DEPTFUNCTIONMASTER + "')/Items?$select=Title,DepartmentName,*&$filter=DepartmentName eq '" + department + "'",
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
                    $("#Function").html(data.d.results[0].Title);
                }
            }
        });
}
function bindAssetClassification() {
    var functionValue = $('#Function').html();
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.ASSETCLASSIFICATIONMASTER + "')/items?$select=Function/Title,AssetClassDescription,Title&$expand=Function/Title&$filter=Function/Title eq '" + functionValue + "'",
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
                    $("#AssetClassification").html('');
                    $("#AssetClassification").html("<option value=''>Select</option>");
                    $(result).each(function (i, e) {
                        var cmditem = result[i].Title +'-'+ result[i].AssetClassDescription;
                        var opt = $("<option/>");
                        opt.text(cmditem);
                        opt.attr("value", cmditem);
                        opt.appendTo($("#AssetClassification"));
                    });
                    if (mainListData.AssetClassification != undefined) {
                        var objSelect = document.getElementById("AssetClassification");
                        setSelectedValue(objSelect, mainListData.AssetClassification);
                        // bindAssetName(mainListData.AssetClassification);

                    }
                }
            }
        });

}
function bindEditAssetClassification() {
    var functionValue = $('#Function').html();
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.ASSETCLASSIFICATIONMASTER + "')/items?$select=Function/Title,AssetClassDescription,Title&$expand=Function/Title&$filter=Function/Title eq '" + functionValue + "'",
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
                    $("#AssetClassification").html('');
                    $("#AssetClassification").html("<option value=''>Select</option>");
                    $(result).each(function (i, e) {
                        var cmditem = result[i].Title +'-'+ result[i].AssetClassDescription;
                        var opt = $("<option/>");
                        opt.text(cmditem);
                        opt.attr("value", cmditem);
                        opt.appendTo($("#AssetClassification"));
                    });
                    if (mainListData.AssetClassification != undefined) {
                        var objSelect = document.getElementById("AssetClassification");
                        setSelectedValue(objSelect, mainListData.AssetClassification);
                        // bindAssetName(mainListData.AssetClassification);

                    }
                }
            }
        });

}
function bindAssetName(assetclassification) {
    if(assetclassification !=undefined){
   var assetCode =TrimComma(assetclassification).split("-");
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.ASSETNUMBERMASTER + "')/Items?$select=AssetClass,Description&$filter=AssetClass eq '" + assetCode[0] + "'",
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
                    $("#AssetName").html('');
                    $("#AssetName").html("<option value=''>Select</option>");
                    $(result).each(function (i, e) {
                        var cmditem = result[i].Description;
                        var opt = $("<option/>");
                        opt.text(cmditem);
                        opt.attr("value", cmditem);
                        opt.appendTo($("#AssetName"));
                    });
                }
            }
        });
    }
}
function bindEditAssetName(assetclassification) {
    if(assetclassification !=undefined){
        var assetCode =TrimComma(assetclassification).split("-");
         AjaxCall(
             {
                 url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.ASSETNUMBERMASTER + "')/Items?$select=AssetClass,Description&$filter=AssetClass eq '" + assetCode[0] + "'",
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
                         $("#AssetName").html('');
                         $("#AssetName").html("<option value=''>Select</option>");
                         $(result).each(function (i, e) {
                             var cmditem = result[i].Description;
                             var opt = $("<option/>");
                             opt.text(cmditem);
                             opt.attr("value", cmditem);
                             opt.appendTo($("#AssetName"));
                         });
                     }
                 }
             });
         
                    if (mainListData.AssetName != undefined) {
                        var objSelect = document.getElementById("AssetName");
                        setSelectedValue(objSelect, mainListData.AssetName);
                    }
                }

}

function BindURSAttachmentFiles() {
    var output = [];
    var fileName;
    var checkFile = $('#URSContainer').html();
    if (checkFile == "") {
        //Get the File Upload control id
        var input = document.getElementById("UploadURSAttachment");
        if (input.files.length > 0) {
            var fileCount = input.files.length;
            for (var i = 0; i < fileCount; i++) {
                fileName = input.files[i].name;
                fileIdCounter++;
                var fileId = fileIdCounter;
                var file = input.files[i];
                var reader = new FileReader();
                reader.onload = (function (file) {
                    return function (e) {
                        console.log(file.name);
                        //Push the converted file into array
                        fileURSArray.push({
                            "name": file.name,
                            "content": e.target.result,
                            "id": fileId
                        });

                    }
                })(file);
                reader.readAsArrayBuffer(file);
            }

            if (!IsNullOrUndefined(fileURSArray)) {
                var listName = "Attachments";
                var itemType = GetItemTypeForListName(listName);
                var item = {
                    "__metadata": { "type": itemType },
                    "Title": "URS",
                    "TypeOfAttachment": "URS",
                    "FileName": file.name
                };

                $.ajax({
                    url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
                    type: "POST",
                    contentType: "application/json;odata=verbose",
                    data: JSON.stringify(item),
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        var itemId = data.d.Id;
                        var item = $pnp.sp.web.lists.getByTitle("Attachments").items.getById(itemId);
                        item.attachmentFiles.addMultiple(fileURSArray).then(v => {
                            console.log("files saved successfully in list = " + listName + "for listItemId = " + itemId);

                            var htmlStr = "";
                            var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + itemId + "/" + fileName;

                            if (htmlStr === "") {
                                htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a><a style='color:brown' href=\"javascript:removeURSFile('" + itemId + "')\"> Remove</a></li>";
                            }
                            else {
                                htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a></li><a style='color:brown' href=\"javascript:removeURSFile('" + fileName + "')\"> Remove</a></li>";

                            }
                            fileCommonArray.push({
                                "name": "URS",
                                "id": itemId,
                                "filename": fileName
                            });

                            fileURSArray = [];
                            $('#URSContainer').html(htmlStr);
                           
                        }).catch(function (err) {
                            console.log(err);
                            fileURSArray = [];
                            console.log("error while save attachment ib list = " + listName + "for listItemId = " + itemId)
                        });
                    },
                    error: function (data) {
                        alert("Error");
                    }
                });
            }
        }
    }
    else {
        AlertModal('Error', "Remove existing URS file to add New");
    }
}
//for Edit case bind attchments
function BindInitiatorEditAttachmentFiles() {
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
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a><a style='color:brown' href=\"javascript:removeURSFile('" + element.ID + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + element.FileName + "</a></li><a style='color:brown' href=\"javascript:removeURSFile('" + element.FileName + "')\"> Remove</a></li>";

                        }
                        fileCommonArray.push({
                            "name": "URS",
                            "id": element.ID,
                            "filename": element.FileName
                        });
                        $('#URSContainer').html(htmlStr);
                        $("#UploadURSAttachment").removeAttr("required");
                    }
                });

                attachmentdata.forEach(element => {


                    if (element.Title == "Supportive") {
                        var htmlStr = "";
                        var checkFile = $('#fileListSupportiveDoc').html();
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (checkFile === "") {
                            htmlStr = "<li id=li_" + element.ID + "><a id='attachment_" + element.ID + "' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a><a style='color:brown' id='Remove_" + element.ID + "' href=\"javascript:removeSupportiveFile('" + element.ID + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = checkFile + "<li id=li_" + element.ID + "><a id='attachment_" + element.ID + "' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li><a style='color:brown' id='Remove_" + element.ID + "' href=\"javascript:removeSupportiveFile('" + element.ID + "')\"> Remove</a></li>";

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

//Only for download purpose
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
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";

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
                            htmlStr = checkFile + "<li id=li_" + element.ID + "><a id='attachment_" + element.ID + "' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";

                        }


                        $('#fileListSupportiveDoc').html(htmlStr);
                    }
                });

            }
        });

}
//remove attached file
function removeURSFile(itemId) {
    $.ajax(
        {
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Attachments')/items('" + itemId + "')",
            type: "DELETE",
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*"
            },
            success: function (data) {
                var index;
                fileCommonArray.forEach(element => {
                    if (element.id == itemId) {
                        index = fileCommonArray.indexOf(element);

                    }
                });
                if (index !== -1) fileCommonArray.splice(index, 1);
                var htmlStr = "";
                $('#URSContainer').html(htmlStr);
                $("#UploadURSAttachment").attr("required", true);
                $("#UploadURSAttachment").val('');
            },
            error: function (err) {
                alert(JSON.stringify(err));
            }
        }
    );


}

function BindSupportDocAttachmentFiles() {
    var output = [];
    var fileName;

    //Get the File Upload control id
    var input = document.getElementById("UploadSupportiveDocAttachment");
    var fileCount = input.files.length;
    if (input.files.length > 0) {
        for (var i = 0; i < fileCount; i++) {
            fileName = input.files[i].name;
            fileIdCounter++;
            var fileId = fileIdCounter;
            var file = input.files[i];
            var reader = new FileReader();
            reader.onload = (function (file) {
                return function (e) {
                    console.log(file.name);
                    var duplicate = true;
                    // duplicate= checkDuplicateFileName(file.name);
                    //Push the converted file into array
                    // if(duplicate){
                    fileURSArray.push({
                        "name": file.name,
                        "content": e.target.result,
                        "id": fileId
                    });
                    // }
                    //  else
                    //  {
                    //     alert("Duplicate file");
                    //  }

                }
            })(file);
            reader.readAsArrayBuffer(file);
        }

        if (!IsNullOrUndefined(fileURSArray)) {
            var listName = "Attachments";
            var itemType = GetItemTypeForListName(listName);
            var item = {
                "__metadata": { "type": itemType },
                "Title": "Supportive",
                "TypeOfAttachment": "Supportive",
                "FileName": file.name
            };

            $.ajax({
                url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(item),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    var itemId = data.d.Id;
                    var item = $pnp.sp.web.lists.getByTitle("Attachments").items.getById(itemId);
                    item.attachmentFiles.addMultiple(fileURSArray).then(v => {
                        console.log("files saved successfully in list = " + listName + "for listItemId = " + itemId);

                        var htmlStr = "";
                        // var checkFile = $('#UploadSupportiveDocAttachment').next().next().html();
                        var checkFile = $('#fileListSupportiveDoc').html();
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + itemId + "/" + fileName;

                        if (checkFile === "") {
                            htmlStr = "<li id=li_" + itemId + "><a id='attachment_" + itemId + "' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a><a style='color:brown' id='Remove_" + itemId + "' href=\"javascript:removeSupportiveFile('" + itemId + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = checkFile + "<li id=li_" + itemId + "><a id='attachment_" + itemId + "' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a></li><a style='color:brown' id='Remove_" + itemId + "' href=\"javascript:removeSupportiveFile('" + itemId + "')\"> Remove</a></li>";

                        }
                        fileCommonArray.push({
                            "name": "Supportive",
                            "id": itemId,
                            "filename": fileName
                        });
                        fileURSArray = [];
                        // $('#SupportiveDocContainer').html(htmlStr);
                        $('#fileListSupportiveDoc').html(htmlStr);

                        // $('#UploadSupportiveDocAttachment').next().append(htmlStr.join(""));
                    }).catch(function (err) {
                        console.log(err);
                        fileURSArray = [];
                        console.log("error while save attachment ib list = " + listName + "for listItemId = " + itemId)
                    });
                },
                error: function (data) {
                    alert("Error");
                }
            });
        }
    }
}
function removeSupportiveFile(itemId) {

    var checkFile = $('#SupportiveDocContainer').html();
    $.ajax(
        {
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Attachments')/items('" + itemId + "')",
            type: "DELETE",
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*"
            },
            success: function (data) {
                var index;
                fileCommonArray.forEach(element => {
                    if (element.id == itemId) {
                        index = fileCommonArray.indexOf(element);

                    }
                });
                if (index !== -1) fileCommonArray.splice(index, 1);
                var element = "#li_" + itemId;
                var ele = "Remove_" + itemId;
                $(element).children().remove();
                $(element).remove();
                $(ele).remove();

            },
            error: function (err) {
                alert(JSON.stringify(err));
            }
        }
    );


}

//Purchase Attachment

function BindPurchaseAttachmentFiles() {
    var output = [];
    var fileName;
    var checkFile = $('#purchaseContainer').html();
    if (checkFile == ""||checkFile==undefined) {
        //Get the File Upload control id
        var input = document.getElementById("UploadPurchaseAttachment");
        if (input.files.length > 0) {
            var fileCount = input.files.length;
            for (var i = 0; i < fileCount; i++) {
                fileName = input.files[i].name;
                fileIdCounter++;
                var fileId = fileIdCounter;
                var file = input.files[i];
                var reader = new FileReader();
                reader.onload = (function (file) {
                    return function (e) {
                        console.log(file.name);
                        //Push the converted file into array
                        fileURSArray.push({
                            "name": file.name,
                            "content": e.target.result,
                            "id": fileId
                        });

                    }
                })(file);
                reader.readAsArrayBuffer(file);
            }

            if (!IsNullOrUndefined(fileURSArray)) {
                var listName = "Attachments";
                var itemType = GetItemTypeForListName(listName);
                var item = {
                    "__metadata": { "type": itemType },
                    "Title": "Purchase",
                    "TypeOfAttachment": "Purchase",
                    "FileName": file.name
                };

                $.ajax({
                    url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
                    type: "POST",
                    contentType: "application/json;odata=verbose",
                    data: JSON.stringify(item),
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        var itemId = data.d.Id;
                        var item = $pnp.sp.web.lists.getByTitle("Attachments").items.getById(itemId);
                        item.attachmentFiles.addMultiple(fileURSArray).then(v => {
                            console.log("files saved successfully in list = " + listName + "for listItemId = " + itemId);

                            var htmlStr = "";
                            var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + itemId + "/" + fileName;

                            if (htmlStr === "") {
                                htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a><a href=\"javascript:removePurchaseFile('" + itemId + "')\"> Remove</a></li>";
                            }
                            else {
                                htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a></li><a href=\"javascript:removePurchaseFile('" + fileName + "')\"> Remove</a></li>";

                            }
                            fileCommonArray.push({
                                "name": "Purchase",
                                "id": itemId,
                                "filename": fileName
                            });

                            fileURSArray = [];
                            $('#purchaseContainer').html(htmlStr);
                        }).catch(function (err) {
                            console.log(err);
                            fileURSArray = [];
                            console.log("error while save attachment ib list = " + listName + "for listItemId = " + itemId)
                        });
                    },
                    error: function (data) {
                        alert("Error");
                    }
                });
            }
        }
    }
    else {
        AlertModal('Error', "Remove existing Purchase file to add New");
    }
}
function BindPurchaseEditAttachmentFiles(){
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
                    if (element.Title == "Purchase") {

                        var htmlStr = "";
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (htmlStr === "") {
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a><a href=\"javascript:removePurchaseFile('" + element.ID + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li><a href=\"javascript:removePurchaseFile('" + element.FileName + "')\"> Remove</a></li>";

                        }
                        fileCommonArray.push({
                            "name": "Purchase",
                            "id": element.ID,
                            "filename": element.FileName
                        });
                        $('#purchaseContainer').html(htmlStr);
                    }
                });
             }
        });
}
function removePurchaseFile(itemId) {
    $.ajax(
        {
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Attachments')/items('" + itemId + "')",
            type: "DELETE",
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*"
            },
            success: function (data) {
                var index;
                fileCommonArray.forEach(element => {
                    if (element.id == itemId) {
                        index = fileCommonArray.indexOf(element);

                    }
                });
                if (index !== -1) fileCommonArray.splice(index, 1);
                var htmlStr = "";
                $('#purchaseContainer').html(htmlStr);
            },
            error: function (err) {
                alert(JSON.stringify(err));
            }
        }
    );


}

//Only for download purpose
function BindPurchaseAttachment() {
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
                
                attachmentdata = data.d.results;
                attachmentdata.forEach(element => {
                    if (element.Title == "Purchase") {

                        var htmlStr = "";
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (htmlStr === "") {
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";

                        }

                        $('#purchaseContainer').html(htmlStr);
                    }
                });
            }
        });

}

function BindHODEditAttachmentFiles(){
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
                    if (element.Title == "HOD") {

                        var htmlStr = "";
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (htmlStr === "") {
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a><a href=\"javascript:removeURSFile('" + element.ID + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li><a href=\"javascript:removeURSFile('" + element.FileName + "')\"> Remove</a></li>";

                        }
                        fileCommonArray.push({
                            "name": "HOD",
                            "id": element.ID,
                            "filename": element.FileName
                        });
                        $('#HODContainer').html(htmlStr);
                    }
                });
             }
        });
}
function BindHODAttachmentFiles() {
    var output = [];
    var fileName;
    var checkFile = $('#HODContainer').html();
    if (checkFile == ""||checkFile ==undefined) {
        //Get the File Upload control id
        var input = document.getElementById("UploadHODAttachment");
        if (input.files.length > 0) {
            var fileCount = input.files.length;
            for (var i = 0; i < fileCount; i++) {
                fileName = input.files[i].name;
                fileIdCounter++;
                var fileId = fileIdCounter;
                var file = input.files[i];
                var reader = new FileReader();
                reader.onload = (function (file) {
                    return function (e) {
                        console.log(file.name);
                        //Push the converted file into array
                        fileURSArray.push({
                            "name": file.name,
                            "content": e.target.result,
                            "id": fileId
                        });

                    }
                })(file);
                reader.readAsArrayBuffer(file);
            }

            if (!IsNullOrUndefined(fileURSArray)) {
                var listName = "Attachments";
                var itemType = GetItemTypeForListName(listName);
                var item = {
                    "__metadata": { "type": itemType },
                    "Title": "HOD",
                    "TypeOfAttachment": "HOD",
                    "FileName": file.name
                };

                $.ajax({
                    url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
                    type: "POST",
                    contentType: "application/json;odata=verbose",
                    data: JSON.stringify(item),
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        var itemId = data.d.Id;
                        var item = $pnp.sp.web.lists.getByTitle("Attachments").items.getById(itemId);
                        item.attachmentFiles.addMultiple(fileURSArray).then(v => {
                            console.log("files saved successfully in list = " + listName + "for listItemId = " + itemId);

                            var htmlStr = "";
                            var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + itemId + "/" + fileName;

                            if (htmlStr === "") {
                                htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a><a href=\"javascript:removeHODFile('" + itemId + "')\"> Remove</a></li>";
                            }
                            else {
                                htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a></li><a href=\"javascript:removeHODFile('" + fileName + "')\"> Remove</a></li>";

                            }
                            fileCommonArray.push({
                                "name": "HOD",
                                "id": itemId,
                                "filename": fileName
                            });

                            fileURSArray = [];
                            $('#HODContainer').html(htmlStr);
                        }).catch(function (err) {
                            console.log(err);
                            fileURSArray = [];
                            console.log("error while save attachment ib list = " + listName + "for listItemId = " + itemId)
                        });
                    },
                    error: function (data) {
                        alert("Error");
                    }
                });
            }
        }
    }
    else {
        AlertModal('Error', "Remove existing HOD file to add New");
    }
}
//Only for download purpose
function BindHODAttachment() {
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
                
                attachmentdata = data.d.results;
                attachmentdata.forEach(element => {
                    if (element.Title == "HOD") {

                        var htmlStr = "";
                        var ServerRelativeUrl = _spPageContextInfo.siteAbsoluteUrl + "/Lists/Attachments/Attachments/" + element.ID + "/" + element.FileName;

                        if (htmlStr === "") {
                            htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";
                        }
                        else {
                            htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "' target='_blank'>" + element.FileName + "</a></li>";

                        }

                        $('#HODContainer').html(htmlStr);
                    }
                });
            }
        });

}
function removeHODFile(itemId) {
    $.ajax(
        {
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Attachments')/items('" + itemId + "')",
            type: "DELETE",
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*"
            },
            success: function (data) {
                var index;
                fileCommonArray.forEach(element => {
                    if (element.id == itemId) {
                        index = fileCommonArray.indexOf(element);

                    }
                });
                if (index !== -1) fileCommonArray.splice(index, 1);
                var htmlStr = "";
                $('#HODContainer').html(htmlStr);
            },
            error: function (err) {
                alert(JSON.stringify(err));
            }
        }
    );


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
function SetBudgetValue() {
        var assetClassification =TrimComma(mainListData.AssetClassification).split("-");
        AjaxCall(
            {

                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.BUDGETMASTER + "')/Items?$select=AssetClassification/AssetClassDescription,BudgetedValue,UtilisedValue&$expand=AssetClassification/AssetClassDescription&$filter=AssetClassification/AssetClassDescription eq '" + assetClassification[1] + "'",
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
function GetBudgetValue() {
    var budgetedValue=[];
    var assetClassification =TrimComma(mainListData.AssetClassification).split("-");
        AjaxCall(
            {
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.BUDGETMASTER + "')/Items?$select=ID,AssetClassification/AssetClassDescription,BudgetedValue,UtilisedValue&$expand=AssetClassification/AssetClassDescription&$filter=AssetClassification/AssetClassDescription eq '" + assetClassification[1] + "'",
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
                      budgetedValue[0]= data.d.results[0].BudgetedValue;
                      budgetedValue[1]= data.d.results[0].ID;
                    }
                }
            });
    
    return budgetedValue;
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
function UpdateBudget(Id)
{
    var assetClassification =TrimComma(mainListData.AssetClassification).split("-");
    var utilizedValue = $('#TotalUtilizedValue').val();
    if(utilizedValue !=undefined){
    var listName = ListNames.BUDGETMASTER;
    var itemType = GetItemTypeForListName(listName);
    var item = {
        "__metadata": { "type": itemType },
        "UtilisedValue": utilizedValue,
    };
    $.ajax({
  
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.BUDGETMASTER + "')/items(" + Id + ")",
        type: "POST",
        async: false,
        data: JSON.stringify(item),
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
        },
        success: function (data) {
            console.log(data);
        },
        error: function (data) {
            debugger;
            console.log(data);
        }
    });
}
}