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
    GetTranListData(listItemId);
    var mainListName = $($('div').find('[mainlistname]')).attr('mainlistname');
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + mainListName + "')/items(" + listItemId + ")?$select=Author/Title,*&$expand=Author",
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
    if (item != null && item != '' & item != undefined) {
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
        if (smsIncharge != null) {
            tempApproverMatrix.filter(function (temp) {
                if (temp.Role == "Final SMS Incharge" && temp.Status != "Not Required") {
                    temp.ApproverId = smsIncharge;
                }
            });
        }
        if (smsDelegate != null) {
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
    ValidateForm(ele, SaveDataCallBack);
    function SaveDataCallBack(activeSection) {
        var isError = FormBusinessLogic(activeSection);
        if (!isError) {
            SaveForm(activeSection, ele);
        }
    }
}


function FormBusinessLogic(activeSection) {
    // var isError = false;
    // try {
    //     //check if there any delegate user fillby section owner        
    //     ////Pending to make it dynamic
    //     if (!IsNullOrUndefined(listDataArray.SCMLUMDesignDelegateId)) {
    //         var array = [];
    //         array.push(parseInt(listDataArray.SCMLUMDesignDelegateId));
    //         listDataArray["SCMLUMDesignDelegateId"] = { "results": array };
    //     }
    // }
    // catch (Exception) {
    //     isError = true;
    //     console.log("Error occured in FormBusinessLogic" + Exception);
    // }
    // return isError;
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
function AddAllAttachments(listname, itemID) {
    $('#divItemCodeForm').find('div[section]').not(".disabled").each(function (i, e) {

        $(e).find('input[type="file"]').each(function () {
            var elementId = $(this).attr('id');
            var controlType = $(this).attr('controlType');
            // if (controlType == "file") {
            if (!IsNullOrUndefined(fileInfos)) {
                SaveItemWiseAttachments(listname, itemID);
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
                fileInfos.push({
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
    var item = $pnp.sp.web.lists.getByTitle(listname).items.getById(itemID);
    item.attachmentFiles.addMultiple(fileInfos).then(v => {
        console.log("files saved successfully in list = " + listname + "for listItemId = " + itemID);
    }).catch(function (err) {
        console.log(err);
        console.log("error while save attachment ib list = " + listname + "for listItemId = " + itemID)
    });
}

// function SendBack() {
//     ButtonActionStatus = "SendBack";
//     SaveFormData();
// }

