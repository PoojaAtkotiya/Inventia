var returnUrl = "";
var currentUser;
var approverMaster;
var securityToken;
var currentContext;
//var hostweburl;
var listDataArray = {};
var listActivityLogDataArray = [];
var actionPerformed;
var fileURSArray = [];
var fileCommonArray = [];
var fileSupportDocArray = [];
var scriptbase; //= spSiteUrl + "/_layouts/15/";     ////_spPageContextInfo.layoutsUrl
var fileIdCounter = 0;
var currentApproverDetails = {};
var gTranArray = [];
var department;
var gRequestDigest;
var gRequestDigestValue;
jQuery(document).ready(function () {

    jQuery.noConflict();
    //jsErrLog.debugMode = true;

    GetFormDigest().done(function (data) {
        gRequestDigestValue = data.responseJSON.d.GetContextWebInformation.FormDigestValue;
    }).fail(function () {
        console.log("Execute  second after the retrieve list items  failed");
    });

    var scriptbase = CommonConstant.HOSTWEBURL + "/_layouts/15/";
    // Load the js files and continue to
    // the execOperation function.
    $.getScript(scriptbase + "SP.Runtime.js",
        function () {
            $.getScript(scriptbase + "SP.js", loadConstants);
        }
    );
    if ($('myform').length > 0) {
        $('myform').renameTag('form');
    }
    KeyPressNumericValidation();

});

/*Priya Rane */
// function BindURSAttachmentFiles() {
//     var output = [];

//     //Get the File Upload control id
//     var input = document.getElementById("UploadURSAttachment");
//     var fileCount = input.files.length;
//     for (var i = 0; i < fileCount; i++) {
//         var fileName = input.files[i].name;
//         var duplicate = true;
//       //  duplicate = checkDuplicateFileName(fileName);
//         if(duplicate){

//         fileIdCounter++;
//         var fileId = fileIdCounter;
//         var file = input.files[i];
//         var reader = new FileReader();
//         reader.onload = (function (file) {
//             return function (e) {
//                 console.log(file.name);
//                 //Push the converted file into array
//                 fileURSArray.push({
//                     "name": file.name,
//                     "content": e.target.result,
//                     "id": fileId
//                 });


//             }
//         })(file);
//         reader.readAsArrayBuffer(file);
//         var removeLink = "<a id =\"removeFile_" + fileId + "\" href=\"javascript:removeURSFiles(" + fileId + ")\" data-fileid=\"" + fileId + "\"> Remove</a>";
//         output = [];
//         output.push("<li><strong>", escape(file.name), removeLink, "</li> ");
//     }
//     else{
//         alert("Same file is present");
//     }
//     }
//     $('#fileListURS').empty();
//     $('#UploadURSAttachment').next().next().next().next().append(output.join(""));

//     //End of for loop
// }

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
                                htmlStr = "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + fileName + "</a><a href=\"javascript:removeURSFile('" + itemId + "')\"> Remove</a></li>";
                            }
                            else {
                                htmlStr = htmlStr + "<li><a id='attachment' href='" + ServerRelativeUrl + "'>" + fileName + "</a></li><a href=\"javascript:removeURSFile('" + fileName + "')\"> Remove</a></li>";

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
                            htmlStr = "<li id=li_" + itemId + "><a id='attachment_" + itemId + "' href='" + ServerRelativeUrl + "' target='_blank'>" + fileName + "</a><a id='Remove_" + itemId + "' href=\"javascript:removeSupportiveFile('" + itemId + "')\"> Remove</a></li>";
                        }
                        else {
                            htmlStr = checkFile + "<li id=li_" + itemId + "><a id='attachment_" + itemId + "' href='" + ServerRelativeUrl + "'>" + fileName + "</a></li><a id='Remove_" + itemId + "' href=\"javascript:removeSupportiveFile('" + itemId + "')\"> Remove</a></li>";

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
// function BindSupportDocAttachmentFiles() {
//     var output = [];

//     //Get the File Upload control id
//     var input = document.getElementById("UploadSupportiveDocAttachment");
//     var fileCount = input.files.length;
//     console.log(fileCount);
//     for (var i = 0; i < fileCount; i++) {
//         var fileName = input.files[i].name;
//         var duplicate = true;
//        // duplicate = checkDuplicateFileName(fileName);
//         if(duplicate){
//         fileIdCounter++;
//         var fileId = fileIdCounter;
//         var file = input.files[i];
//         var reader = new FileReader();
//         reader.onload = (function (file) {
//             return function (e) {

//                 //Push the converted file into array
//                 fileSupportDocArray.push({
//                     "name": file.name,
//                     "content": e.target.result,
//                     "id": fileId
//                 });
//                 fileCommonArray.push({
//                     "name": file.name,
//                 });
//             }
//         })(file);
//         reader.readAsArrayBuffer(file);

//         var removeLink = "<a id =\"removeFile_" + fileId + "\" href=\"javascript:removeSupportDocFiles(" + fileId + ")\" data-fileid=\"" + fileId + "\"> Remove</a>";
//         output.push("<li><strong>", escape(file.name), removeLink, "</li> ");
//     }
//     else{
//         alert("Same file is present");
//     }
//     }
//     $('#UploadSupportiveDocAttachment').next().next().append(output.join(""));

//     //End of for loop
// }

/*Priya Rane */
// function removeURSFiles(fileId) {

//     for (var i = 0; i < fileURSArray.length; ++i) {
//         if (fileURSArray[i].id === fileId)
//             fileURSArray.splice(i, 1);
//     }
//     var item = document.getElementById("fileListURS");
//     fileId--;
//     item.children[fileId].remove();

// }
// function removeSupportDocFiles(fileId) {

//     for (var i = 0; i < fileSupportDocArray.length; ++i) {
//         if (fileSupportDocArray[i].id === fileId)
//             fileSupportDocArray.splice(i, 1);
//     }
//     var item = document.getElementById("fileListSupportiveDoc");
//     fileId--;
//     item.children[fileId].remove();

// }

/*Priya Rane */
function loadConstants() {
    var clientContext = new SP.ClientContext(CommonConstant.HOSTWEBURL);
    this.oWebsite = clientContext.get_web();
    clientContext.load(this.oWebsite);
    clientContext.executeQueryAsync(
        Function.createDelegate(this, onloadConstantsSuccess),
        Function.createDelegate(this, onloadConstantsFail)
    );
}

/*Priya Rane */
function onloadConstantsSuccess(sender, args) {

    currentContext = SP.ClientContext.get_current();
    listItemId = getUrlParameter("ID");
    returnUrl = getUrlParameter("Source");
    ExecuteOrDelayUntilScriptLoaded(GetCurrentUserDetails, "sp.js");
    if (listItemId == "" || IsNullOrUndefined(listItemId)) {
        GetUserDepartment();
    }
    GetAllMasterData();

    if (!IsNullOrUndefined(listItemId) && listItemId > 0) {
        GetSetFormData();
    }
    else {
        GetGlobalApprovalMatrix(listItemId);
    }
    GetFormBusinessLogic(listItemId, activeSectionName, department);
    //setCustomApprovers();
}

function GetUserDepartment() {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
        httpmethod: 'GET',
        calldatatype: 'JSON',
        async: false,
        headers: {
            Accept: "application/json;odata=verbose"
        },
        success: function (data) {
            try {
                //Get properties from user profile Json response  
                userDisplayName = data.d.DisplayName;
                AccountName = data.d.AccountName;
                var properties = data.d.UserProfileProperties.results;
                for (var i = 0; i < properties.length; i++) {
                    if (properties[i].Key == "Department") {
                        department = properties[i].Value;
                    }
                }
            } catch (err2) {
                //alert(JSON.stringify(err2));  
            }
        },
        error: function (jQxhr, errorCode, errorThrown) {
            console.log(errorThrown);
        }
    });
}


/*Priya Rane */
function setImageSignature() {
    var item = mainListData;
    if (!IsNullOrUndefined(item["InitiatorSignature"])) {
        var img = new Image();
        img.src = item["InitiatorSignature"];
        img_Intiator.appendChild(img);
    }
    if (!IsNullOrUndefined(item["HODSignature"])) {
        var img = new Image();
        img.src = item["HODSignature"];
        img_HOD.appendChild(img);
    }
    if (!IsNullOrUndefined(item["PurchaseSignature"])) {
        var img = new Image();
        img.src = item["PurchaseSignature"];
        img_Purchase.appendChild(img);
    }
    if (!IsNullOrUndefined(item["FunctionHeadSignature"])) {
        var img = new Image();
        img.src = item["FunctionHeadSignature"];
        img_FunctionHead.appendChild(img);
    }
    if (!IsNullOrUndefined(item["ManagementSignature"])) {
        var img = new Image();
        img.src = item["ManagementSignature"];
        img_Management.appendChild(img);
    }
}

/*Priya Rane */
function onloadConstantsFail(sender, args) {
    console.log(args.get_message());
}

/*Monal Shah */
function ShowWaitDialog() {
    try {
        jQuery("#loading").show();
    }
    catch (ex) {
        // blank catch to handle ie issue in case of CK editor
    }
}

/*Monal Shah */
function HideWaitDialog() {
    jQuery("#loading").hide();
}

function DatePickerControl(ele) {
    // $(ele).find('.datepicker').each(function () {
    //     $(this).datepicker({
    //         format: 'mm-dd-yyyy',
    //         todayHighlight: true,
    //         autoclose: true
    //     });
    // });
}

/*Pooja Atkotiya */
function GetUsersForDDL(roleName, eleID) {
    //sync call to avoid conflicts in deriving role wise users
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('ApproverMaster')/items?$select=Role,UserSelection,UserName/Id,UserName/Title&$expand=UserName/Id&$expand=UserName/Id&$filter= (Role eq '" + roleName + "') and (UserSelection eq 1)",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            sucesscallbackfunction: function (data) {
                OnGetUsersForDDLSuccess(data, eleID);
            }
        });
}

/*Pooja Atkotiya */
function OnGetUsersForDDLSuccess(data, eleID) {
    var dataResults = data.value[0].UserName;
    var allUsers = [];
    if (!IsNullOrUndefined(dataResults) && dataResults.length != -1) {
        $.each(dataResults, function (index, user) {
            allUsers.push({ userId: user.Id, userName: user.Title })
        });
    }
    setUsersInDDL(allUsers, eleID);
}

/*Pooja Atkotiya */
function setUsersInDDL(allUsers, eleID) {
    $("#" + eleID).html('');
    $("#" + eleID).html("<option value=''>Select</option>");
    if (!IsNullOrUndefined(allUsers) && allUsers.length > 0) {
        allUsers.forEach(user => {
            var opt = $("<option/>");
            opt.text(user.userName);
            opt.attr("value", user.userId);
            opt.appendTo($("#" + eleID));
        });
    }
}

//#region Validation /*Monal Shah */
function KeyPressNumericValidation() {
    jQuery('input[data="integer"]').keypress(function (event) {
        return Integer(this, event);
    }).bind('paste', function (e) {
        return false;
    });

    jQuery('input[data="digit"]').keypress(function (event) {
        return Digit(this, event);
    }).bind('paste', function (e) {
        return false;
    });

    jQuery('input[data="numeric"]').keypress(function (event) {
        return Numeric(this, event);
    }).bind('paste', function (e) {
        return false;
    });

    jQuery('input[data="PositiveNumeric"]').keypress(function (event) {
        return PositiveNumeric(this, event);
    }).bind('paste', function (e) {
        return false;
    });

    jQuery('input[data="AlphaNumeric"]').keypress(function (event) {
        return AlphaNumeric(this, event);
    }).bind('paste', function (e) {
        return false;
    });

    jQuery('input[data="Alphabet"]').keypress(function (event) {
        return Alphabet(this, event);
    }).bind('paste', function (e) {
        return true;
    });

    jQuery('input[data="AlphaNumericSpecial"]').keypress(function (event) {
        return AlphaNumericSpecial(this, event);
    }).bind('paste', function (e) {
        return true;
    });
}
function Digit(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57) {
        return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    }
    else {
        return false;
    }
}
function Integer(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57 || keyCode == 45) {
        if (keyCode == 45) {
            if (objTextbox.value.indexOf("-") == -1)
                return true;
            else
                return false;
        }
        else
            return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    }
    else {
        return false;
    }
}
function Numeric(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57 || keyCode == 46 || keyCode == 45) {
        if (keyCode == 46) {
            if (objTextbox.value.indexOf(".") == -1)
                return true;
            else
                return false;
        }
        else if (keyCode == 45) {
            if (objTextbox.value.indexOf("-") == -1)
                return true;
            else
                return false;
        }
        else
            return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    }
    else {
        return false;
    }
}
function AlphaNumericSpecial(objTextbox, event) {
    if (event.charCode != 0) {
        var regex = new RegExp("[^']+");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }
    var key = event.which || event.keyCode;
}
function AlphaNumeric(objTextbox, event) {

    if (event.charCode != 0) {
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }
    var key = event.which || event.keyCode;
}
function Alphabet(objTextbox, event) {

    if (event.charCode != 0) {
        var regex = new RegExp("^[a-zA-Z]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }
    var key = event.which || event.keyCode;
}
function PositiveNumeric(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57 || keyCode == 46) {

        if (keyCode == 46) {
            if (objTextbox.value.indexOf(".") == -1)
                return true;
            else
                return false;
        }
        else
            return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    }
    else {
        return false;
    }
}
//#endregion

/*Monal Shah */
function ValidateFormControls(divObjectId, IgnoreBlankValues) {
    if (IgnoreBlankValues == undefined)
        IgnoreBlankValues = true;
    jQuery('#' + divObjectId + ' input:text, #' + divObjectId + ' select, #' + divObjectId + ' textarea').removeClass('input-validation-error');
    var noerror = true;
    jQuery('#' + divObjectId).each(function (i, e) {
        var totalElement = 0;
        var blanckValueCount = 0;
        totalElement = jQuery('input:text,select,textarea', e).length;
        jQuery('input:text,select,textarea', e).each(function (index, control) {
            if (jQuery.trim(jQuery(control).val()) == '') {
                blanckValueCount += 1;
            }
        });

        if (jQuery(e).is(':visible') && ((totalElement != blanckValueCount && IgnoreBlankValues) || !IgnoreBlankValues)) {
            jQuery('input:text,select,textarea', e).each(function (index, control) {
                //Check for valid email text 
                if (jQuery(control).attr('data-type') != undefined && jQuery(control).attr('data-type').toLowerCase() == 'email') {
                    var emailfilter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
                    if (!(emailfilter.test(jQuery(control).val())) && jQuery(control).val() != '') {
                        jQuery(control).addClass('input-validation-error');
                        noerror = false;
                    }
                }
                if (jQuery(control).attr('required') != undefined) {
                    //check numeric data type validation
                    if (jQuery(control).attr('data') != undefined) {
                        if (parseFloat(jQuery.trim(jQuery(control).val())) == 0) {
                            jQuery(control).addClass('input-validation-error');
                            noerror = false;
                        }
                    }

                    //check string data type validation
                    if (jQuery.trim(jQuery(control).val()) == '') {
                        jQuery(control).addClass('input-validation-error');
                        noerror = false;
                    }
                }

                //numericdatarequired attribute allows 0.00 incase of numeric data
                if (jQuery(control).attr('numericdatarequired') != undefined) {

                    //check numeric data type validation
                    if (jQuery(control).attr('data') != undefined) {
                        if (jQuery.trim(jQuery(control).val()) == '') {
                            jQuery(control).addClass('input-validation-error');
                            noerror = false;
                        }

                    }
                }
            });
        }
    });
    //Display validation message
    if (!noerror) {
        // AlertModal(getMessage("error"), getMessage("ParameterValidationMessage"), function () { })        
        // AlertModal("Error", "Please enter appropriate data.");
    }
    return noerror;
}

/*Himil Jani */
function GetCurrentUserDetails() {
    AjaxCall(
        {
            url: CommonConstant.HOSTWEBURL + "/_api/web/currentuser/?$expand=groups",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            headers: {
                Accept: "application/json;odata=verbose"
            },
            sucesscallbackfunction: function (data) {
                currentUser = data.d;
            }
        });
}

/*Pooja Atkotiya */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

/*Pooja Atkotiya */
function cancel() {
    if (returnUrl == "")
        returnUrl = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
    location.href = decodeURIComponent(returnUrl);
}

/*Himil Jani */
function GetFormDigest() {
    var deferred = $.Deferred();
    gRequestDigest = $.ajax({
        url: CommonConstant.ROOTURL + "/_api/contextinfo",
        method: "POST",
        async: false,
        headers: { "Accept": "application/json; odata=verbose" }
    });
    deferred.resolve(gRequestDigest);
    return deferred.promise();
}

function BindDatePicker(selector) {
    // if ($.trim(selector) != "") {
    //     selector += selector + " ";
    // }
    var todayDate = new Date();
    $(selector).find('.datepicker').each(function () {
        var tempValue = $(this).find("input:first").val();
        $(this).datetimepicker({
            format: 'L', //for Date+++
            widgetParent: $(this).parent().is("td") ? "body" : null,
            //widgetPositioning: $(this).parent().is("td") ? { horizontal: "left", vertical: "bottom" } : { horizontal: "auto", vertical: "auto" },
            minDate: $(this).hasClass("pastDisabled") ? new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 00, 00, 00) : undefined
        }).on("dp.change", function () {
            $(this).find("input").change();
        });
        $(this).find("input:first").val(tempValue);
    });
    $(selector).find('.timepicker').each(function () {
        var tempValue = $(this).find("input:first").val();
        $(this).datetimepicker({
            format: 'LT' //for Date+++
            , widgetParent: $(this).parent().is("td") ? "body" : null
        }).on("dp.change", function () {
            $(this).find("input").change();
        });
        $(this).find("input:first").val(tempValue);
    });
}

/*Pooja Atkotiya */
function setFieldValue(controlId, item, fieldType, fieldName) {
    if (!fieldName || fieldName == "") {
        fieldName = controlId;
    }
    if (!IsNullOrUndefined(item[fieldName])) {
        switch (fieldType) {
            case "text":
                $("#" + controlId).val(item[fieldName]).change();
                break;
            // case "number":
            //     $("#" + controlId).val(item[fieldName]).change();
            //     break;
            case "label":
                $("#" + controlId).text(item[fieldName]);
                break;
            case "terms":
                if (item[fieldName]) {
                    $("#" + controlId).val(item[fieldName].TermGuid).change()
                }
                break;
            case "combo":
                $("#" + controlId).val(item[fieldName]).change();
                break;
            case "multitext":
                $("#" + controlId).val(RemoveHtmlForMultiLine(item[fieldName])).change();
                break;
            case "date":
                var dt = "";
                if (item[fieldName] && !IsNullOrUndefined(item[fieldName])) {
                    dt = new Date(item[fieldName]).format("MM-dd-yyyy");
                    $("#" + controlId).val(dt).change();
                }
                break;
            case "hidden":
                $("#" + controlId).val(item[fieldName]);
                break;
            case "multicheckbox":
                if (!IsNullOrUndefined(item[fieldName]) && !IsNullOrUndefined(item[fieldName].results) && item[fieldName].results.length > 0) {
                    item[fieldName].results.forEach(function (thisItem) {
                        if (thisItem == controlId) {
                            $("#" + controlId)[0].checked = true;
                            //debugger;
                            if (listDataArray[fieldName] == undefined)
                                listDataArray[fieldName] = { "__metadata": { "type": "Collection(Edm.String)" }, "results": [] };
                            listDataArray[fieldName].results.push(thisItem);
                        }
                    });
                }
                break;
            case "checkbox":
                $("#" + controlId)[0].checked = item[fieldName];
                break;
            case "radiogroup":
                if (controlId == item[fieldName])
                    $("#" + controlId).prop('checked', true);
                else
                    $("#" + controlId).prop('checked', false);
                break;
        }
    }
}

/*Pooja Atkotiya */
function setStaticFieldValue(controlId, item, fieldType, cType, fieldName) {

    if (!fieldName || fieldName == "") {
        fieldName = controlId;
    }

    switch (fieldType) {
        case "text":
        case "combo":
        case "multitext":
            if (cType == "text") {
                $("#" + controlId).val(item[fieldName]).change();
            }
            else {
                $("#" + controlId).text(item[fieldName]);
            }
            break;
        case "date":
            var dt = "";
            if (item[fieldName] && !IsNullOrUndefined(item[fieldName])) {
                dt = new Date(item[fieldName]).format("MM-dd-yyyy");
            }
            if (cType == "text") {
                $("#" + controlId).val(dt).change();
            }
            else {
                $("#" + controlId).text(dt);
            }
            break;
        case "person":
            var dispName = "";
            if (item[fieldName] && !IsNullOrUndefined(item[fieldName])) {
                dispName = item[fieldName].Title;
            }
            if (cType == "text") {
                $("#" + controlId).val(dispName).change();
            }
            else {
                $("#" + controlId).text(dispName);
            }
            break;
    }
}
/*Pooja Atkotiya */
function GetItemTypeForListName(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
}

/*Monal Shah */
function ConfirmationDailog(options) {
    $("#ConfirmDialog").remove();
    var confirmDlg = "<div class='modal fade bs-example-modal-sm' tabindex='-1' role='dialog' id='ConfirmDialog' aria-labelledby='mySmallModalLabel'><div class='modal-dialog modal-sm'><div class='modal-content'><div class='modal-header'>" +
        "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button><h4 class='modal-title' id='ModalTitle'>Modal title</h4></div><div class='modal-body' id='ModalContent'>" +
        "</div><div class='modal-footer'><button type='button' id='btnYesPopup' isdialogclose='false' class='btn btn-default' data-dismiss='modal'>" +
        "Yes</button><button type='button' id='btnNoPopup' isdialogclose='false' class='btn btn-default' data-dismiss='modal'>No</button> </div></div></div></div>";
    $(confirmDlg).appendTo("body");
    $("#ConfirmDialog #btnYesPopup").on("click", function () {
        if (typeof (options.okCallback) !== "undefined" && !IsNullOrUndefined(options.okCallback)) {
            //options.okCallback();
            ConfirmPopupYes(options.url, options.id, options.okCallback);
        }
    });
    $("#ConfirmDialog #btnNoPopup").on("click", function () {
        if (typeof (options.cancelCallback) !== "undefined" && !IsNullOrUndefined(options.cancelCallback)) {
            options.cancelCallback();
        }
    });
    $("#ConfirmDialog #ModalTitle").text(options.title);
    $("#ConfirmDialog #ModalContent").text(options.message);
    $("#ConfirmDialog").modal('show').on('hidden.bs.modal', function () {
        if (typeof (options.closeCallback) !== "undefined" && !IsNullOrUndefined(options.closeCallback)) {
            options.closeCallback();
        }
    });
}

/*Monal Shah */
function ConfirmPopupYes(url, id, okCallback) {
    ShowWaitDialog();
    if (typeof (url) !== "undefined" && !IsNullOrUndefined(url)) {
        url = url;
        AjaxCall(
            {
                url: url,
                httpmethod: 'DELETE',
                calldatatype: 'JSON',
                async: false,
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "IF-MATCH": "*"
                },
                sucesscallbackfunction: function (data) {
                    if (typeof (okCallback) !== "undefined" && !IsNullOrUndefined(okCallback)) {
                        okCallback(id, data);
                    }
                    HideWaitDialog();
                }
            });
    }
    else {
        if (typeof (okCallback) !== "undefined" && !IsNullOrUndefined(okCallback)) {
            okCallback();
        }
        //HideWaitDialog();
    }
}

/*Monal Shah */
function AlertModal(title, msg, isExit, callback) {
    $("div[id='PopupDialog']").remove();
    var popupDlg = '<div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" id="PopupDialog" aria-labelledby="mySmallModalLabel"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="ModalTitle">Modal title</h4></div><div class="modal-body" id="ModalContent"></div><div class="modal-footer"><button type="button" id="ClosePopup" isdialogclose="false" class="btn btn-default" data-dismiss="modal">Close</button> </div></div></div></div>';
    $(popupDlg).appendTo("body");
    $("#PopupDialog #ModalTitle").text(title);
    $("#PopupDialog #ModalContent").html(msg);
    if (title == "Success") {
        $("#PopupDialog .modal-header").addClass("bg-success text-white");
    }
    else if (title == "Error") {
        $("#PopupDialog .modal-header").addClass("bg-danger text-white");
    }
    else if (title == "Validation") {
        $("#PopupDialog .modal-header").addClass("bg-yellow text-white");
    }
    else if (title == "SessionTimeout") {
        $("#PopupDialog .modal-header").addClass("bg-warning text-white");
    }
    $("#PopupDialog").modal('show').on('hidden.bs.modal', function () {
        if (typeof (callback) !== 'undefined' && !IsNullOrUndefined(callback)) {
            callback();
        }
        if (typeof (isExit) !== 'undefined' && isExit == true) {
            Exit();
        }
        if (IsNullOrUndefined(callback)) {
            $("div[id='PopupDialog']").hide();
            $("div[id='PopupDialog']").remove();

        }
    });
}

/*Monal Shah */
function Exit() {
    try {
        parent.postMessage(CommonConstant.HOSTWEBURL, CommonConstant.SPHOST);
    }
    catch (e) {
        parent.postMessage($("#hdnSPHOSTURL").val(), $("#hdnSPHOST").val());
    }
}

/*Monal Shah */
function UserAborted(xhr) {
    return !xhr.getAllResponseHeaders();
}

/*Monal Shah */
function onAjaxError(xhr) {
    if (!UserAborted(xhr)) {
        if (xhr.status.toString().substr(0, 1) == "4" || xhr.status == 504) {
            AlertModal('SessionTimeout', "Session Timed out!!!");
        }
        else {
            //This shortcut is not recommended way to track unauthorized action.
            //if (xhr.responseText.indexOf("403.png") > 0) {
            //    window.location = UnAuthorizationUrl;
            //}
            //else {
            //    AlertModal("Error", "System error has occurred.", BootstrapDialog.TYPE_DANGER);
            //}
        }
    }
}

/*Monal Shah */
function resetFormValidator(formId) {
    $(formId).removeData('validator');
    $(formId).removeData('unobtrusiveValidation');
    $(formId).data('validator');
    $(formId).data('unobtrusiveValidation');
    $.validator.unobtrusive.parse(formId);
}

/*Monal Shah */
//Replace '<myform>' tag to '<form>'
$.fn.renameTag = function (replaceWithTag) {
    this.each(function () {
        var outerHtml = this.outerHTML;
        var tagName = $(this).prop("tagName");
        var regexStart = new RegExp("^<" + tagName, "i");
        var regexEnd = new RegExp("</" + tagName + ">$", "i")
        outerHtml = outerHtml.replace(regexStart, "<" + replaceWithTag)
        outerHtml = outerHtml.replace(regexEnd, "</" + replaceWithTag + ">");
        $(this).replaceWith(outerHtml);
    });
    return this;
}

/*Monal Shah */
function ValidateForm(ele, saveCallBack) {
    //Get Active Section
    var activeSection = $('div[section]').not(".disabled");
    var formList = $('div[section]').not(".disabled").parent();
    var isValid = true;
    var dataAction = $(ele).attr("data-action");
    var isPageRedirect = true;
    var buttonCaption = $(ele).text().toLowerCase().trim();

    if (buttonCaption == "hold" || buttonCaption == "resume") {
        $("#Action").rules("remove", "required");
    }

    if (buttonCaption == "print") {
        $('#printModel').modal('show');
    }

    if (buttonCaption != "print") {
        formList.each(function () {
            if ($(this).find("input[id='ButtonCaption']").length == 0) {
                var input = $("<input id='ButtonCaption' name='ButtonCaption' type='hidden'/>");
                input.val($(ele).text());
                $(this).append(input);
            } else {
                $(this).find("input[id='ButtonCaption']").val($(ele).text());
            }

            if ($(this).find("input[id='ButtonCaption']").val() != undefined && $(this).find("input[id='ButtonCaption']").val().trim() == "Submit" && $(this).find('.multiselectrequired').length > 0) {
                if ($(this).find('.multiselectrequired').attr('data-val') == "true" && $(this).find('.multiselectrequired').attr('data-original-title') == '' && $(this).find('.multiselectrequired').attr('required') == 'required') {
                    $(this).find('.multiselectrequired').next('div.btn-group').addClass('input-validation-error');
                    $(this).find('.multiselectrequired').next('div.btn-group').next("span.field-validation-valid").addClass("error");
                    $(this).find('.multiselectrequired').next('div.btn-group').next("span.error").removeClass("field-validation-valid");
                    isValid = false;
                }
            }
            else if ($(this).find("input[id='ButtonCaption']").val() != undefined && $(this).find("input[id='ButtonCaption']").val().trim() == 'Delegate' && $(this).find('.multiselectrequired').length > 0) {
                $(this).find('.multiselectrequired').next('div.btn-group.input-validation-error').removeClass('input-validation-error');
                $("form").validate().resetForm();
            }

            if ($(this).find(".amount").length > 0) {
                $(this).find(".amount").each(function (i, e) {
                    $(e).val($(e).val().replace(/,/g, ''));
                });
            }

            if (dataAction == "2" || dataAction == "34") {
                $(this).validate().settings.ignore = "*";
                if (dataAction == "2" || dataAction == "34") {
                    $(".error").addClass("valid");
                    $(".valid").removeClass("error");
                    $(this).validate().settings.ignore = ":not(.requiredOnDraft)";
                }
                if (buttonCaption == "submit" || buttonCaption == "complete") {
                    $(".error").addClass("valid");
                    $(".valid").removeClass("error");
                }
            }
            else if (dataAction == "23") {
                $(this).validate().settings.ignore = "*";
                $(".error").addClass("valid");
                $(".valid").removeClass("error");
                $(this).validate().settings.ignore = ":not(.requiredOnSendBack)";
            }
            else if (dataAction == "41") {
                $(this).validate().settings.ignore = "*";
                $(".error").addClass("valid");
                $(".valid").removeClass("error");
                $(this).validate().settings.ignore = ":not(.requiredOnReject)";
            }
            else if (dataAction == "42") {
                $(this).validate().settings.ignore = "*";
                $(".error").addClass("valid");
                $(".valid").removeClass("error");
                $(this).validate().settings.ignore = ":not(.requiredOnDelegate)";
            }
            else {
                $(this).validate().settings.ignore = ":hidden";
                if (buttonCaption == "save as draft") {
                    $(".error").addClass("valid");
                    $(".valid").removeClass("error");
                }
            }
            if (!$(this).valid()) {
                isValid = false;
                try {
                    var validator = $(this).validate();
                    $(validator.errorList).each(function (i, errorItem) {
                        //  AlertModal("Validation", errorItem.element.id + "' : '" + errorItem.message);
                        $("#" + errorItem.element.id).addClass("error");
                        $("#" + errorItem.element.id).removeClass("valid");
                        $("#" + errorItem.element.id).next().remove();
                        console.log("{ '" + errorItem.element.id + "' : '" + errorItem.message + "'}");
                    });
                }
                catch (e1) {
                    console.log(e1.message);
                }
            }
        });
    }
    if (isValid) {
        $("input[id='ActionStatus']").val($(ele).attr("data-action"));
        $("input[id='SendBackTo']").val($(ele).attr("data-sendbackto"));
        $("input[id='SendToRole']").val($(ele).attr("data-sendtorole"));
        ShowWaitDialog();
        if (buttonCaption != "save as draft") {
            //confirm file Attachment need attach or not
            var attachmsg = "Are you sure to '" + $.trim($(ele).text()) + "'?";
            if ($(formList).find("div[data-appname]").length != 0 && $(formList).find("div[data-appname]").find("ul li").length == 0 && dataAction == "11") {
                attachmsg = "Are you sure to '" + $.trim($(ele).text()) + "' without attachment?";
            }
            //if(listTempGridDataArray.length >= 3){
            ConfirmationDailog({
                title: "Confirm", message: attachmsg, okCallback: function (data) {
                    saveCallBack(activeSection);
                }
            });
        }
        else {
            ConfirmationDailog({
                title: "Confirm", message: attachmsg, okCallback: function (data) {
                    saveCallBack(activeSection);
                }
            });
        }



    }
    else {
        saveCallBack(activeSection);
    }
    HideWaitDialog();
}


/*Monal Shah */
function onQuerySucceeded(sender, args) {
    console.log("Success");
}

/*Monal Shah */
function onQueryFailed(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*Pooja Atkotiya */
function GetFormControlsValue(id, elementType, listDataArray, elementvaluetype = undefined) {
    var obj = '#' + id;
    switch (elementType) {
        case "text":
            if (!IsStrNullOrEmpty($(obj).val())) {
                listDataArray[id] = $(obj).val();
            }
            break;
        // case "hidden":
        //     listDataArray[id] = $(obj).val();
        //     break;
        case "terms":
            var metaObject = {
                __metadata: { "type": "SP.Taxonomy.TaxonomyFieldValue" },
                Label: $("select#" + id + ">option:selected").text(),
                TermGuid: $(obj).val(),
                WssId: -1
            }
            listDataArray[id] = metaObject;
            break;
        case "combo":
            if (IsNullOrUndefined($(obj).val()) || IsStrNullOrEmpty($(obj).val())) {
                $(obj).val(0);
            }
            listDataArray[id] = $(obj).val();
            break;
        case "multitext":
            listDataArray[id] = $(obj).val();
            break;
        case "date":
            var month = !IsNullOrUndefined($(obj).datepicker('getDate')) ? $(obj).datepicker('getDate').getMonth() + 1 : null;
            var date = !IsNullOrUndefined($(obj).datepicker('getDate')) ? $(obj).datepicker('getDate').getDate() : null;
            var year = !IsNullOrUndefined($(obj).datepicker('getDate')) ? $(obj).datepicker('getDate').getFullYear() : null;
            var date = (!IsNullOrUndefined(month) && !IsNullOrUndefined(date) && !IsNullOrUndefined(year)) ? new Date(year.toString() + "-" + month.toString() + "-" + date.toString()).format("yyyy-MM-ddTHH:mm:ssZ") : null;
            if (date) {
                listDataArray[id] = date;
            }
            break;
        case "checkbox":
            listDataArray[id] = $(obj)[0]['checked'];
            break;
        case "multicheckbox":
            var parenType = $(obj).attr('cParent');
            if (listDataArray[parenType] == undefined)
                listDataArray[parenType] = { "__metadata": { "type": "Collection(Edm.String)" }, "results": [] };

            var isChecked = $(obj)[0]['checked'];
            var choiceName = $(obj)[0].id;
            var idx = listDataArray[parenType].results.indexOf(choiceName);
            if (isChecked && idx == -1)
                listDataArray[parenType].results.push(choiceName);
            else if (idx > -1)
                listDataArray[parenType].results.splice(idx, 1);
            break;
        case "radiogroup":
            var parenType = $(obj).attr('cParent');
            listDataArray[parenType] = $(obj)[0].id;
            break;
    }
    return listDataArray;
}

/*Pooja Atkotiya */
function GetStaticFormControlValue(id, elementType, listDataArray, elementvaluetype) {
    var obj = '#' + id;
    switch (elementType) {
        case "text":
        case "combo":
        case "multitext":
            if (!IsStrNullOrEmpty($(obj).text())) {
                listDataArray[id] = $(obj).text();
            }
            break;
        case "terms":
            var metaObject = {
                __metadata: { "type": "SP.Taxonomy.TaxonomyFieldValue" },
                Label: $("select#" + id + ">option:selected").text(),
                TermGuid: $(obj).text(),
                WssId: -1
            }
            listDataArray[id] = metaObject;
            break;
        case "date":
            listDataArray[id] = new Date($(obj).text()).format("yyyy-MM-ddTHH:mm:ssZ");
            break;
        // case "checkbox":
        //     listDataArray[id] = $(obj)[0]['checked'];
        //     break;
        // case "multicheckbox":
        //     var parenType = $(obj).attr('cParent');
        //     if (listDataArray[parenType] == undefined)
        //         listDataArray[parenType] = { "__metadata": { "type": "Collection(Edm.String)" }, "results": [] };

        //     var isChecked = $(obj)[0]['checked'];
        //     var choiceName = $(obj)[0].id;
        //     var idx = listDataArray[parenType].results.indexOf(choiceName);
        //     if (isChecked && idx == -1)
        //         listDataArray[parenType].results.push(choiceName);
        //     else if (idx > -1)
        //         listDataArray[parenType].results.splice(idx, 1);
        //     break;
        // case "radiogroup":
        //     var parenType = $(obj).attr('cParent');
        //     listDataArray[parenType] = $(obj)[0].id;
        //     break;
    }
    return listDataArray;
}

/*Priya Rane */
function GetFormControlsValueAndType(id, elementType, elementProperty, listActivityLogDataArray) {
    var obj = '#' + id;
    switch (elementType) {
        case "text":
            if (!IsStrNullOrEmpty($(obj).val())) {
                listActivityLogDataArray.push({ id: id, value: $(obj).val(), type: 'text' });
            }
            break;
        case "terms":
            var metaObject = {
                __metadata: { "type": "SP.Taxonomy.TaxonomyFieldValue" },
                Label: $("select#" + id + ">option:selected").text(),
                TermGuid: $(obj).val(),
                WssId: -1
            }
            break;
        case "combo":

            if (elementProperty == 'peoplepicker') {
                listActivityLogDataArray.push({ id: id, value: $(obj).val(), type: 'peoplepicker' });
            }
            break;
        case "multitext":
            listActivityLogDataArray.push({ id: id, value: $(obj).val(), type: 'multitext' });
            break;
        case "date":
            var month = !IsNullOrUndefined($(obj).datepicker('getDate')) ? $(obj).datepicker('getDate').getMonth() + 1 : null;
            var date = !IsNullOrUndefined($(obj).datepicker('getDate')) ? $(obj).datepicker('getDate').getDate() : null;
            var year = !IsNullOrUndefined($(obj).datepicker('getDate')) ? $(obj).datepicker('getDate').getFullYear() : null;
            var date = (!IsNullOrUndefined(month) && !IsNullOrUndefined(date) && !IsNullOrUndefined(year)) ? new Date(year.toString() + "-" + month.toString() + "-" + date.toString()).format("yyyy-MM-ddTHH:mm:ssZ") : null;
            if (date) {
                listActivityLogDataArray.push({ id: id, value: date, type: 'date' });
            }
            break;
        case "checkbox":
            listActivityLogDataArray.push({ id: id, value: $(obj)[0]['checked'], type: 'checkbox' });
            break;
        case "multicheckbox":
            var parenType = $(obj).attr('cParent');
            if (listActivityLogDataArray[parenType] == undefined)
                listActivityLogDataArray[parenType] = { "__metadata": { "type": "Collection(Edm.String)" }, "results": [] };

            var isChecked = $(obj)[0]['checked'];
            var choiceName = $(obj)[0].id;
            var idx = listActivityLogDataArray[parenType].results.indexOf(choiceName);
            if (isChecked && idx == -1);
            //   listActivityLogDataArray[parenType].results.push(choiceName);
            else if (idx > -1)
                //  listActivityLogDataArray[parenType].results.splice(idx, 1);
                break;
        case "radiogroup":
            var parenType = $(obj).attr('cParent');
            listActivityLogDataArray.push({ id: id, value: $(obj)[0].id, type: 'radiogroup' });
            break;
        case "label":
            if (!IsStrNullOrEmpty($(obj).html())) {
                listActivityLogDataArray.push({ id: id, value: $(obj).html(), type: 'label' });
            }
            break;
    }
    return listActivityLogDataArray;
}

/*Pooja Atkotiya */
function GetApproverMaster() {
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.APPROVERMASTERLIST + "')/items",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            sucesscallbackfunction: function (data) {
                approverMaster = data.d.results;
            }
        });
}

function GetActivityLog(activityLogListName, lookupId, tableId) {
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + activityLogListName + "')/items?$select=Author/Title,*&$expand=Author&$filter=RequestID eq '" + lookupId + "'",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            sucesscallbackfunction: function (data) {
                if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d) && !IsNullOrUndefined(data.d.results) && data.d.results.length > 0) {
                    DisplayActivityLogDetails(data.d.results, tableId);
                }
            }
        });
}

function DisplayActivityLogDetails(activityLogResult, tableId) {
    var tr, ActivityDate = "-";
    for (var i = 0; i < activityLogResult.length; i++) {
        if (!IsNullOrUndefined(activityLogResult[i].ActivityDate)) {
            ActivityDate = formatDate(new Date(activityLogResult[i].ActivityDate).toLocaleDateString());
        }
        tr = $('<tr/>');
        tr.append("<td width='20%'>" + activityLogResult[i].Activity + "</td>");
        tr.append("<td width='25%'>" + activityLogResult[i].SectionName + "</td>");
        tr.append("<td width='15%'>" + ActivityDate + "</td>");
        // tr.append("<td width='15%'>" + activityLogResult[i].ActivityBy + "</td>");
        tr.append("<td width='25%'>" + GetUserNamebyUserID(activityLogResult[i].ActivityById) + "</td>");
        tr.append('<td width="15%"><a href="#" id="btnActivityLog_' + i + '" data-val="' + activityLogResult[i].Changes + '" data-toggle="modal" data-target="#activityLogDetail" class="btn btn-primary">Activity Log</a></td>');
        $('#' + tableId).append(tr);
    }
}

function DisplayActvityLogChanges(iteration, activityLogChangeDetails) {
    if (!IsNullOrUndefined(activityLogChangeDetails)) {
        $('#ActivityLogChanges').modal('show');
        $('#tblActivityChanges tbody').empty();
        var activity = activityLogChangeDetails.split('~');
        var tr, tdValue;
        for (var i = 0; i < activity.length; i++) {
            var item = activity[i];
            /* Condition Changed by Hirvita */
            if (item.split(' ').length > 1) {
                if (!IsNullOrUndefined(item)) {
                    var itemDetails = item.split(' ');
                    if (itemDetails[0] != "RaisedBy" && itemDetails[0] != "Files") {
                        tr = $('<tr/>');
                        tr.append('<td>' + itemDetails[0] + '</td>');

                        var value = itemDetails[1];
                        try {
                            if (value.toLowerCase() == "true" || value.toLowerCase() == "false") {
                                tdValue = value.toLowerCase() == "true" ? "Yes" : "No";
                            }
                            else {
                                if (value.includes("/") && value.includes(":") && (value.includes("AM") || value.includes("PM"))) {
                                    var datetimepart = value.split(' ');
                                    var datepart = datetimepart[0].split('/');
                                    var dt = new DateTime(parseInt(datepart[2]), parseInt(datepart[0]), parseInt(datepart[1]));
                                    tdValue = dt.toString("dd/MM/yyyy") + (itemDetails[0].toLowerCase().includes("time") ? " " + datetimepart[1] + " " + datetimepart[2] : "");
                                }
                                else {
                                    tdValue = value;
                                }
                            }
                        }
                        catch (err) {
                            tdValue = value;
                        }

                        tr.append('<td>' + tdValue + '</td>');
                        $('#tblActivityChanges tbody').append(tr);
                    }
                }
            }
        }
    }
}

/*Monal Shah */
function DisplayApplicationStatus(approverMatrix) {
    var tr;
    var result = [];

    for (var i = 0; i < approverMatrix.length; i++) {
        if (approverMatrix[i].Levels >= 0 && !IsNullOrUndefined(approverMatrix[i].Approver) && !IsNullOrUndefined(approverMatrix[i].Approver.results) && !IsNullOrUndefined(approverMatrix[i].Approver.results).length > 0) {
            var AssignDate = "-", DueDate = "-", ApprovalDate = "-", Comments = "-", Status = "-";
            if (!IsNullOrUndefined(approverMatrix[i].Status)) {
                if (approverMatrix[i].Status == ApproverStatus.APPROVED) {
                    Status = ApproverStatus.COMPLETED;
                }
                else {
                    Status = approverMatrix[i].Status;
                }
            }

            if (!IsNullOrUndefined(approverMatrix[i].AssignDate)) {
                AssignDate = formatDate(new Date(approverMatrix[i].AssignDate).toLocaleDateString());
            }
            if (!IsNullOrUndefined(approverMatrix[i].DueDate)) {
                DueDate = formatDate(new Date(approverMatrix[i].DueDate).toLocaleDateString());
            }
            if (!IsNullOrUndefined(approverMatrix[i].ApprovalDate) && approverMatrix[i].Status == ApproverStatus.APPROVED) {
                ApprovalDate = formatDate(new Date(approverMatrix[i].ApprovalDate).toLocaleDateString());
            }
            if (!IsNullOrUndefined(approverMatrix[i].Comments)) {
                Comments = approverMatrix[i].Comments;
            }

            tr = $('<tr/>');
            tr.append("<td width='20%'>" + approverMatrix[i].Role + "</td>");
            tr.append("<td width='20%'>" + GetUserNamesbyUserID(approverMatrix[i].ApproverId.results) + "</td>");
            tr.append("<td width='10%'>" + Status + "</td>");
            tr.append("<td width='10%'>" + AssignDate + "</td>");
            tr.append("<td width='10%'>" + DueDate + "</td>");
            tr.append("<td width='10%'>" + ApprovalDate + "</td>");
            tr.append("<td width='20%'>" + Comments + "</td>");
            $('#tblApplicationStatus').append(tr);
        }
    }
}

/*Pooja Atkotiya */
function formatDate(input) {
    var datePart = input.match(/\d+/g);
    var day = (datePart[1].length > 1) ? datePart[1] : "0" + datePart[1];
    var month = (datePart[0].length > 1) ? datePart[0] : "0" + datePart[0];
    var year = datePart[2];
    return day + '/' + month + '/' + year;
}

/*Pooja Atkotiya */
function SaveFormData(activeSection, ele) {
    var mainListName = $($('div').find('[mainlistname]')).attr('mainlistname');
    if (!IsNullOrUndefined(mainListName) && !IsStrNullOrEmpty(mainListName)) {

        var sectionName = $(activeSection).attr('section');
        var activeSectionId = $(activeSection).attr('id');

        //$(activeSection).find('input[listtype=main],select[listtype=main],radio[listtype=main],textarea[listtype=main],label[listtype=main],input[reflisttype=main],select[reflisttype=main],radio[reflisttype=main],textarea[reflisttype=main],label[reflisttype=main],select[reflisttype=trans]')

        $(activeSection).find('input[listtype=main],select[listtype=main],radio[listtype=main],textarea[listtype=main],input[reflisttype=main],select[reflisttype=main],radio[reflisttype=main],textarea[reflisttype=main]').each(function () {
            var elementId = $(this).attr('id');
            var elementType = $(this).attr('controlType');
            var elementProperty = $(this).attr('controlProperty');
            var elementvaluetype = $(this).attr('controlvaluetype');

            listDataArray = GetFormControlsValue(elementId, elementType, listDataArray, elementvaluetype);
            listActivityLogDataArray = GetFormControlsValueAndType(elementId, elementType, elementProperty, listActivityLogDataArray);
        });
        $(activeSection).find('.static-control').each(function () {
            var elementId = $(this).attr('id');
            var elementType = $(this).attr('controlType');
            var elementProperty = $(this).attr('controlProperty');
            var elementvaluetype = $(this).attr('controlvaluetype');

            listDataArray = GetStaticFormControlValue(elementId, elementType, listDataArray, elementvaluetype);
            //listActivityLogDataArray = GetFormControlsValueAndType(elementId, elementType, elementProperty, listActivityLogDataArray);
        });
        $(activeSection).find('.approver-control').each(function () {
            var currAppArray = {};
            var elementId = $(this).attr('id');
            var elementType = $(this).attr('controlType');
            var elementProperty = $(this).attr('controlProperty');
            var elementvaluetype = $(this).attr('controlvaluetype');
            currAppArray = GetFormControlsValue(elementId, elementType, currAppArray);

            if (!IsNullOrUndefined(currAppArray)) {
                if (elementId.indexOf("_Comments") != -1) {
                    currentApproverDetails[CurrentApprover.COMMENTS] = currAppArray[elementId];
                }
                else if (elementId.indexOf("_Approver") != -1) {    /////////// testing Pending
                    currentApproverDetails[CurrentApprover.APPROVEBYID] = currAppArray[elementId];
                }
            }
        });
        // save vendor max 3 vendor condition by hirvita
        // if (listTempGridDataArray.length >= 3) {
        SaveData(mainListName, listDataArray, sectionName, ele);
        // }
        // else {
        //      alert("Max 3 vendor required");
        //  }
    }
}

/*Pooja Atkotiya */
function SaveData(listname, listDataArray, sectionName, ele) {
    var itemType = GetItemTypeForListName(listname);
    var isNewItem = true;
    var callbackfunction;
    var buttonCaption = $(ele).text().trim();

    if (!IsNullOrUndefined(listDataArray)) {

        var url = '', headers = '';
        if (!IsNullOrUndefined(listItemId) && listItemId > 0 && listItemId != "") {

            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listname + "')/items(" + listItemId + ")";
            headers = { "Accept": "application/json;odata=verbose", "Content-Type": "application/json;odata=verbose", "X-RequestDigest": $("#__REQUESTDIGEST").val(), "IF-MATCH": "*", "X-HTTP-Method": "MERGE" };
            isNewItem = false;
        }
        else {
            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
            headers = { "Accept": "application/json;odata=verbose", "Content-Type": "application/json;odata=verbose", "X-RequestDigest": $("#__REQUESTDIGEST").val() };
        }

        if (!IsNullOrUndefined(listDataArray) && Object.keys(listDataArray).length > 0) {
            listDataArray["__metadata"] = {
                "type": itemType
            };
            AjaxCall({
                url: url,
                postData: JSON.stringify(listDataArray),
                httpmethod: 'POST',
                calldatatype: 'JSON',
                headers: headers,
                contentType: 'application/json; charset=utf-8',
                async: false,
                sucesscallbackfunction: function (data) {
                    OnSuccessMainListSave(listname, isNewItem, data, sectionName, buttonCaption);
                },
                error: function (data) {
                    console.log(data);
                    HideWaitDialog();
                }
            });
        }
        else {
            OnSuccessMainListSave(listname, isNewItem, null, sectionName, buttonCaption);
        }

    }
}

function OnSuccessMainListSave(listname, isNewItem, data, sectionName, buttonCaption) {
    var itemID = listItemId;
    if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d)) {
        itemID = data.d.ID;
    }
    var web, clientContext;
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        clientContext = new SP.ClientContext.get_current();
        web = clientContext.get_web();
        oList = web.get_lists().getByTitle(ListNames.MAINLIST);
        var oListItem = oList.getItemById(itemID);
        clientContext.load(oListItem, 'FormLevel', 'RaisedBy');
        clientContext.load(web);
        clientContext.executeQueryAsync(function () {
            // if (fileURSArray.length > 0) {
            //     AddURSAttachments(listname, itemID);
            // }
            // if (fileSupportDocArray.length > 0) {
            //     AddSupportiveDocAttachments(listname, itemID);
            // }
            if (fileCommonArray.length > 0) {
                fileCommonArray.forEach(element => {
                    var attchmentID = element.id;
                    updateRequestIDAttachmentList(attchmentID, itemID);
                });
            }
            CommonBusinessLogic(sectionName, itemID, listDataArray);
            SaveLocalApprovalMatrix(sectionName, itemID, listname, isNewItem, oListItem, ListNames.APPROVALMATRIXLIST);
            SaveActivityLog(sectionName, itemID, ListNames.ACTIVITYLOGLIST, listDataArray, isNewItem, buttonCaption);
            if (!isNaN(itemID)) {
                // SaveTranListData(itemID);
                SaveAllTrans(itemID);
            }
            // else {
            //     SaveTranListData(itemID);
            // }
            HideWaitDialog();
            if (IsNullOrUndefined(data)) {
                data = {};
                data = {
                    ItemID: itemID,
                    IsSucceed: true,
                    Messages: "Data saved successfully"
                }
            }
            else {
                data.ItemID = itemID;
                data.IsSucceed = true;
                data.Messages = "Data saved successfully";
            }
            if (buttonCaption.toLowerCase() == "save as draft" || buttonCaption.toLowerCase() == "resume") {
                OnSuccessNoRedirect(data);
            }
            else if (buttonCaption.toLowerCase() == "complete" && !isPageRedirect) {
                OnSuccessConfirmSubmitNoRedirect(data);
            }
            else {
                OnSuccess(data);
            }
        }, function (sender, args) {
            HideWaitDialog();
            console.log('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
        });
    });
}

function CommonBusinessLogic(sectionName, itemID, listDataArray) {
    var actionStatus = $("#ActionStatus").val();

    var keys = Object.keys(ButtonActionStatus).filter(k => ButtonActionStatus[k] == actionStatus);
    var actionPerformed = keys.toString();
    SaveImageSignaturePath(sectionName, itemID);
    SaveActions(sectionName, itemID, actionPerformed);
    if (sectionName == SectionNames.INITIATORSECTION && actionPerformed == "NextApproval") {
        SaveCapitalAssetRequisitionNumber(itemID, listDataArray, actionPerformed);
    }

}
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
function SaveActions(sectionName, itemID, actionPerformed) {
    var formFieldValues = [];
    var todayDate = new Date();
    var year = todayDate.getFullYear();
    var month = todayDate.getMonth() + 1
    var day = todayDate.getDate();
    var amOrPm = (todayDate.getHours() < 12) ? "AM" : "PM";
    var hour = addZero(todayDate.getHours());
    var minute = addZero(todayDate.getMinutes());
    var formatted = day + "/" + month + "/" + year + " " + hour + ":" + minute + " " + amOrPm + " " + 'IST';
    switch (sectionName) {
        case SectionNames.INITIATORSECTION:
            if (actionPerformed == "NextApproval") {
                //formFieldValues['InitiatorAction'] = currentUser.Title + '-' + todayDate + '-' + "Submit";
                formFieldValues['InitiatorAction'] = "Submitted By " + "," + currentUser.Title + "," + formatted;
            }
            else if (actionPerformed == "SaveAsDraft") {
                formFieldValues['InitiatorAction'] = currentUser.Title + '-' + todayDate + '-' + "SaveAsDraft";
            }
            break;
        case SectionNames.HODSECTION:
            if (actionPerformed == "NextApproval") {
                formFieldValues['HODAction'] = currentUser.Title + '-' + todayDate + '-' + "Approve";
            }
            else if (actionPerformed == "Rejected") {
                formFieldValues['HODAction'] = currentUser.Title + '-' + todayDate + '-' + "Rejected";
            }
            break;
        case SectionNames.PURCHASESECTION:
            if (actionPerformed == "NextApproval") {
                formFieldValues['PurchaseAction'] = currentUser.Title + '-' + todayDate + '-' + "Submit";
            }

            break;
        case SectionNames.FUNCTIONHEADSECTION:
            if (actionPerformed == "NextApproval") {
                formFieldValues['FuctionHeadAction'] = currentUser.Title + '-' + todayDate + '-' + "Approve";
            }
            else if (actionPerformed == "Rejected") {
                formFieldValues['FuctionHeadAction'] = currentUser.Title + '-' + todayDate + '-' + "Rejected";
            }
            break;
        case SectionNames.MANAGEMENTSECTION:
            if (actionPerformed == "NextApproval") {
                formFieldValues['ManagementAction'] = currentUser.Title + '-' + todayDate + '-' + "Approve";
            }
            else if (actionPerformed == "Rejected") {
                formFieldValues['ManagementAction'] = currentUser.Title + '-' + todayDate + '-' + "Rejected";
            }
            break;
    }

    SaveFormFields(formFieldValues, itemID);
}
function SaveCapitalAssetRequisitionNumber(itemID, listDataArray, actionPerformed) {
    var formFieldValues = [];
    var todayDate = new Date();
    formFieldValues['CapitalAssetRequisitionNumber'] = listDataArray.CostCenter + '/' + todayDate.getFullYear() + ("0" + (todayDate.getMonth() + 1)).slice(-2) + '/' + itemID;
    SaveFormFields(formFieldValues, itemID);
}
/*Priya Rane */
function SaveImageSignaturePath(sectionName, itemID) {
    var formFieldValues = [];
    if (IsStrNullOrEmpty(currentUser.Email)) {
        currentUser.Email = currentUser.LoginName.split('|')[2];
    }
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('EmployeeSignature')/Items?$select=FileRef/FileRef&$filter=EmployeeEmail eq '" + currentUser.Email + "'",
        type: "GET",
        async: false,
        headers: { "accept": "application/json;odata=verbose" },
        success: function (data) {
            if (data.d.results) {
                switch (sectionName) {
                    case SectionNames.INITIATORSECTION:
                        formFieldValues['InitiatorSignature'] = data.d.results[0].FileRef;
                        break;
                    case SectionNames.HODSECTION:
                        formFieldValues['HODSignature'] = data.d.results[0].FileRef;
                        break;
                    case SectionNames.PURCHASESECTION:
                        formFieldValues['PurchaseSignature'] = data.d.results[0].FileRef;
                        break;
                    case SectionNames.FUNCTIONHEADSECTION:
                        formFieldValues['FunctionHeadSignature'] = data.d.results[0].FileRef;
                        break;
                    case SectionNames.MANAGEMENTSECTION:
                        formFieldValues['ManagementSignature'] = data.d.results[0].FileRef;
                        break;
                }
                SaveFormFields(formFieldValues, itemID);
            }
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });

}

/*Monal Shah */
function ParseMessage(msg) {
    if (msg.length == 1) {
        return msg[0];
    } else {
        var finalMSg = "<ul>";
        $(msg).each(function (i, item) {
            finalMSg += "<li>" + item + "</li>";
        });
        finalMSg += "</ul>";
        return finalMSg;
    }
}

/*Monal Shah */
function OnSuccess(data) {
    try {
        if (data.IsSucceed) {
            if (data.IsFile) {
                DownloadUploadedFile("<a data-url='" + data.ExtraData + "'/>", function () {
                    ShowWaitDialog();
                    setTimeout(function () {
                        window.location = window.location.href + (window.location.href.indexOf('?') >= 0 ? "&" : "?");
                    }, 2000)
                });
            } else {
                var msg = '';
                if (!IsNullOrUndefined(data.ExtraData)) {
                    msg = "<b>" + data.ExtraData + "</b>" + "<br>" + data.Messages;
                }
                else {
                    if ($("#ReferenceNo").length != 0) {
                        msg = $("#ReferenceNo").html() + "<br>" + data.Messages;
                    }
                    else {
                        msg = data.Messages;
                    }
                    ////msg = $("#ReferenceNo").html() + "<br>" + ParseMessage(data.Messages);
                }
                //AlertModal('Success', ParseMessage(data.Messages), true);
                AlertModal('Success', msg, true);
            }
        } else {
            debugger
            AlertModal('Error', data.Messages);
        }
    }
    catch (e) { window.location.reload(); }
}

/*Monal Shah */
function OnFailure(xhr, status, error) {
    try {
        if (xhr.status.toString().substr(0, 1) == "4" || xhr.status == 504) {
            AlertModal('SessionTimeout', "Session Time Out!!!!");
        }
        else {
            AlertModal('Error', "Error Occured");
        }
    }
    catch (e) { window.location.reload(); }
}

/*Monal Shah */
function OnDelete(ele) {
    var Id = $('#ListDetails_0__ItemId').val();
    console.log("Id = " + Id);
    ConfirmationDailog({
        title: "Delete Request", message: "Are you sure to 'Delete'?", id: Id, url: "/NewArtwork/DeleteArwork", okCallback: function (id, data) {
            ShowWaitDialog();
            if (data.IsSucceed) {
                AlertModal("Success", data.Messages, true);
            }
            else {
                AlertModal("Error", data.Messages, true)
            }


        }
    });
}

/*Monal Shah */
function OnSuccessConfirmSubmitNoRedirect(data) {
    try {
        if (data.IsSucceed) {
            if (data.IsFile) {
                DownloadUploadedFile("<a data-url='" + data.ExtraData + "'/>", function () {
                    ShowWaitDialog();
                    setTimeout(function () {
                        window.location = window.location.href + (window.location.href.indexOf('?') >= 0 ? "&" : "?");
                    }, 2000)
                });
            } else {
                var msg = '';
                if (!IsNullOrUndefined(data.ExtraData)) {
                    msg = "<b>" + data.ExtraData + "</b>" + "<br>" + data.Messages;
                }
                else {
                    msg = data.Messages;
                }
                AlertModal('Success', msg, false, function () {
                    if (window.location.href.indexOf('&id=' + data.ItemID + "&") >= 0) {
                        ShowWaitDialog();
                        window.location = window.location.href;
                    } else {
                        ShowWaitDialog();
                        window.location = window.location.href.replace("&id={ItemId}&", "&id=" + data.ItemID + "&").replace("&id=", "&id=" + data.ItemID + "&");
                    }
                });
            }
        }
        else {
            debugger
            AlertModal('Error', data.Messages);
        }
    }
    catch (e) { window.location.reload(); }
}

/*Monal Shah */
function OnSuccessNoRedirect(data) {
    try {
        if (data.IsSucceed) {
            if (data.IsFile) {
                DownloadUploadedFile("<a data-url='" + data.ExtraData + "'/>", function () {
                    ShowWaitDialog();
                    setTimeout(function () {
                        window.location = window.location.href + (window.location.href.indexOf('?') >= 0 ? "&" : "?");
                    }, 2000)
                });
            } else {
                AlertModal('Success', data.Messages, false, function () {
                    if (window.location.href.indexOf('&id=' + data.ItemID + "&") >= 0) {
                        ShowWaitDialog();
                        window.location = window.location.href;
                    } else {
                        ShowWaitDialog();
                        window.location = window.location.href.replace("&id={ItemId}&", "&id=" + data.ItemID + "&").replace("&id=", "&id=" + data.ItemID + "&");
                    }
                });
            }
        }
        else {
            debugger
            AlertModal('Error', data.Messages);
        }
    }
    catch (e) { window.location.reload(); }
}

function SaveActivityLog(sectionName, itemID, ActivityLogListName, listDataArray, isNewItem, buttonCaption) {
    var stringActivity;
    var itemType = GetItemTypeForListName(ActivityLogListName);
    var today = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
    //var actionPerformed = Object.keys(ButtonActionStatus).filter(k => ButtonActionStatus[k] == $("#ActionStatus").val()).toString();
    stringActivity = GetActivityString(listActivityLogDataArray, isNewItem);
    url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ActivityLogListName + "')/items";
    headers = {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "X-HTTP-Method": "POST"
    };

    $.ajax({
        url: url,
        type: "POST",
        headers: headers,
        async: false,
        data: JSON.stringify
            ({
                __metadata: {
                    "type": itemType
                },
                //Activity: actionPerformed,
                Activity: buttonCaption,
                Changes: stringActivity,
                ActivityDate: today,
                ActivityById: currentUser.Id,
                RequestIDId: itemID,
                SectionName: sectionName
            }),
        success: function (data, status, xhr) {
            console.log("SaveActivityLogInList - Item saved Successfully");
        },

    });
}

function GetActivityString(listActivityLogDataArray, isCurrentApproverField) {
    var stringActivity;

    if (!IsNullOrUndefined(listActivityLogDataArray) && listActivityLogDataArray.length > 0) {
        listActivityLogDataArray.forEach(element => {
            if (element.type == "peoplepicker") {
                element.value = GetUserNamebyUserID(element.value);
            }
            if (!IsNullOrUndefined(stringActivity) && stringActivity != ' ') {
                stringActivity = stringActivity + '~';
                stringActivity = stringActivity + element.id;
                stringActivity = stringActivity + ' ';
                stringActivity = stringActivity + element.value;
            }
            else {
                stringActivity = element.id;
                stringActivity = stringActivity + ' ';
                stringActivity = stringActivity + element.value;
            }
        });
    }
    if (!isCurrentApproverField) {
        var today = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
        var approverActivityLog = "Assigned date" + "" + currentApproverDetails.AssignDate;
        approverActivityLog += "\nApproved/Updated date" + "" + today;
        approverActivityLog += "\n" + "Approver Comment" + "" + currentApproverDetails.COMMENTS;
        if (!IsNullOrUndefined(stringActivity) && stringActivity != '') {
            stringActivity = stringActivity + '~';
            stringActivity = stringActivity + approverActivityLog;
        }
        else {
            stringActivity = approverActivityLog;
        }
    }
    return stringActivity;
}

/*Priya Rane */
function GetUserNamebyUserID(userid) {
    var userName = "";
    if (!IsNullOrUndefined(userid)) {
        // if (!isNaN(userid)) {
        url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
        headers = {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "POST"
        };

        AjaxCall(
            {
                url: url,
                httpmethod: 'GET',
                calldatatype: 'JSON',
                async: false,
                headers: headers,
                sucesscallbackfunction: function (data) { userName = data.d.Title; }
            });
    }
    return userName;
}

/*Priya Rane */
//  Get array of User Names from user ids
function GetUserNamesbyUserID(allUsersIDs) {
    var userNames = '';
    if (!IsNullOrUndefined(allUsersIDs) && allUsersIDs.length > 0) {

        allUsersIDs.forEach(user => {
            if (!isNaN(user)) {
                //  if (user != "") {
                url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + user + ")";
                headers = {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "X-HTTP-Method": "POST"
                };

                AjaxCall(
                    {
                        url: url,
                        httpmethod: 'GET',
                        calldatatype: 'JSON',
                        async: false,
                        headers: headers,
                        sucesscallbackfunction: function (data) { userNames = userNames + data.d.Title + ","; }
                    });
                //  }
            }
        });
        userNames = userNames.substr(0, userNames.lastIndexOf(',')).replace(/\,/g, ', ');
    }
    return userNames;
}

/*Priya Rane */
function GetUserEmailbyUserID(userid) {
    var userEmail = "";
    if (!IsNullOrUndefined(userid)) {
        url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
        headers = {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "POST"
        };

        AjaxCall(
            {
                url: url,
                httpmethod: 'GET',
                calldatatype: 'JSON',
                async: false,
                headers: headers,
                sucesscallbackfunction: function (data) {
                    userEmail = data.d.Email;
                }
            });
    }
    return userEmail;
}

/*Priya Rane */
//  Get array of User Email from user ids
function GetUserEmailsbyUserID(allUsersIDs) {
    var userEmails = "";
    if (!IsNullOrUndefined(allUsersIDs) && allUsersIDs.length > 0) {
        allUsersIDs.forEach(user => {
            if (!isNaN(user)) {
                url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + user + ")";
                headers = {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "X-HTTP-Method": "POST"
                };

                AjaxCall(
                    {
                        url: url,
                        httpmethod: 'GET',
                        calldatatype: 'JSON',
                        async: false,
                        headers: headers,
                        sucesscallbackfunction: function (data) { userEmails = userEmails + data.d.Email + ","; }
                    });
            }
        });
        userEmails = userEmails.substr(0, userEmails.lastIndexOf(',')).replace(/\,/g, ', ');
    }
    return userEmails;
}

/*Monal Shah */
function AjaxCall(options) {
    var url = options.url;
    var postData = options.postData;
    var httpmethod = options.httpmethod;
    var calldatatype = options.calldatatype;
    var headers = options.headers == undefined ? "" : options.headers;
    var sucesscallbackfunction = options.sucesscallbackfunction;
    var errorcallbackfunction = options.errorcallbackfunction;
    var contentType = options.contentType == undefined ? "application/x-www-form-urlencoded;charset=UTF-8" : options.contentType;
    var showLoading = options.showLoading == undefined ? true : options.showLoading;
    var async = options.async == undefined ? true : options.async;

    jQuery.ajax({
        type: httpmethod,
        url: url,
        data: postData,
        headers: headers,
        global: showLoading,
        dataType: calldatatype,
        contentType: contentType,
        async: async,
        success: function (data) {
            if (data && data.Status != undefined && data.Status == "VALIDATION_ERROR") {
                debugger
                ShowError(data.Data);
            }
            else {
                if (sucesscallbackfunction != '') {
                    sucesscallbackfunction(data);
                }
            }
        },
        error: function (xhr, textStatus, errorThrown) {

            if (!UserAborted(xhr)) {
                // if (xhr.status == 403) {
                //     window.location = LoginindexUrl;
                // }
                // //This shortcut is not recommended way to track unauthorized action. 
                // if (xhr.responseText.indexOf("403.png") > 0) {
                //     window.location = UnAuthorizationUrl;
                // }
                // else {
                console.log(xhr);
                jsErrLog.info = xhr.statusText;
                //jsErrLog.url = "https://synoverge.sharepoint.com/sites/dev/";
                debugger
                AlertModal("Error", "Oops! Something went wrong");
                //throw "Error";
                //}
                if (errorcallbackfunction != '') {
                    errorcallbackfunction(xhr);
                }
            }

        }
    });
}

/*Monal Shah */
function ShowError(ModelStateErrors) {
    jQuery('input').removeClass("input-validation-error")
    var messages = "";
    jQuery(ModelStateErrors).each(function (i, e) {
        jQuery('[name="' + e.Key + '"]').addClass("input-validation-error");
        messages += "<li>" + e.Value[0] + "</li>";
    });
    messages = "<div><h5>" + getMessage("errorTitle") + "</h5><ul>" + messages + "</ul></div>";
    //debugger
    AlertModal("error", messages, function () { })
}

/*Pooja Atkotiya */
function removeDuplicateFromArray(arr) {
    let unique_array = Array.from(new Set(arr))
    return unique_array;
}

/*Pooja Atkotiya */
function getTermFromManagedColumn(managedColumn) {
    var resultValue = '';
    if (!IsNullOrUndefined(managedColumn)) {
        if (!IsNullOrUndefined(managedColumn.Label)) {
            resultValue = managedColumn.Label;
        }
        else if (!IsNullOrUndefined(managedColumn.results) && !IsNullOrUndefined(managedColumn.results.length > 0) && !IsNullOrUndefined(managedColumn.results[0]) && !IsNullOrUndefined(managedColumn.results[0].Label)) {
            resultValue = managedColumn.results[0].Label;
        }
    }
    return resultValue;
}

/*Pooja Atkotiya */
function SendMail(actionPerformed, currentUserId, itemID, tempApproverMatrix, mainListName, nextLevel, currentLevel, param, isNewItem) {
    var nextApproverIds = "";
    var from = "", to = "", cc = "", role = "", tmplName = "", strAllusers = "", email = [], mailCustomValues = [];
    var emailParam = {};
    try {
        if (currentLevel < 0) {
            currentLevel = 0;
        }
        var strAllUsers = GetEmailUsers(tempApproverMatrix, nextLevel, isNewItem);
        tempApproverMatrix.forEach(temp => {
            if (temp.Levels == nextLevel && !IsNullOrUndefined(temp.ApproverId) && temp.Status != "Not Required") {
                nextApproverIds = nextApproverIds + "," + temp.ApproverId;
            }
        });
        nextApproverIds = TrimComma(nextApproverIds);
        mailCustomValues.push({ "CurrentApproverName": currentUser.Title });
        //  mailCustomValues.push("NextApproverName",GetUserNamesbyUserID(nextApproverIds));

        switch (actionPerformed) {
            case ButtonActionStatus.SaveAsDraft:
                break;
            case ButtonActionStatus.SaveAndStatusUpdateWithEmail:
            case ButtonActionStatus.SaveAndNoStatusUpdateWithEmail:
            case ButtonActionStatus.Save:
                debugger
                if (!IsStrNullOrEmpty(strAllusers) && !IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != 0) {
                    debugger
                    from = currentUser.Email;
                    to = TrimComma(strAllusers);
                    //  to = cleanArray(to);
                    to = GetUserEmailsbyUserID(cleanArray(to));
                    role = tempApproverMatrix.filter(p => parseInt(p.Levels) == currentLevel)[0].Role;
                    tmplName = EmailTemplateName.NEWREQUESTMAIL;
                    emailParam["TEMPLATENAME"] = tmplName;
                    emailParam["FROM"] = from;
                    emailParam["TO"] = to;
                    emailParam["CC"] = cc;
                    emailParam["ROLE"] = role;
                    emailParam["BCC"] = "";
                    email = GetEmailBody(tmplName, itemID, mainListName, mailCustomValues, role, emailParam);
                }
                break;
            case ButtonActionStatus.Delegate:
            case ButtonActionStatus.NextApproval:
                if (!IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != 0) {
                    debugger
                    from = currentUser.Email;
                    var allToUsers = "";
                    tempApproverMatrix.forEach(temp => {
                        if (temp.Levels == nextLevel && !IsNullOrUndefined(temp.ApproverId) && temp.Status == ApproverStatus.PENDING) {
                            allToUsers = allToUsers.trim() + "," + temp.ApproverId;
                        }
                    });
                    to = TrimComma(allToUsers).split(",");
                    to = cleanArray(to);
                    to = GetUserEmailsbyUserID(to);
                    tempApproverMatrix.forEach(temp => {
                        if (temp.Role == Roles.CREATOR) {
                            cc = temp.ApproverId;
                            debugger                /////Pending to check for multi user field
                            cc = TrimComma(cc).split(",");
                            cleanArray(cc);
                            cc = GetUserEmailsbyUserID(cc);
                        }
                        if (temp.Levels == currentLevel) {
                            role = temp.Role;
                        }
                    });
                    // debugger
                    // role = tempApproverMatrix.filter(p => parseInt(p.Levels) == currentLevel)[0].Role;

                    tmplName = EmailTemplateName.APPROVALMAIL;
                    emailParam["TEMPLATENAME"] = tmplName;
                    emailParam["FROM"] = from;
                    emailParam["TO"] = to;
                    emailParam["CC"] = cc;
                    emailParam["ROLE"] = role;
                    emailParam["BCC"] = "";
                    if (!tempApproverMatrix.some(t => t.Levels == nextLevel && !IsNullOrUndefined(t.ApproverId) && !IsNullOrUndefined(t.Status) && t.Status == ApproverStatus.APPROVED)) {
                        email = GetEmailBody(tmplName, itemID, mainListName, mailCustomValues, role, emailParam);
                    }
                }
                break;
            case ButtonActionStatus.SendBack:
            case ButtonActionStatus.BackToCreator:
                if (!IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != 0) {
                    from = currentUser.Email;
                    var allToUsers = "";
                    tempApproverMatrix.ForEach(temp => {
                        if (temp.Levels == nextLevel && !IsNullOrUndefined(temp.ApproverId)) {
                            allToUsers = allToUsers.trim() + "," + temp.ApproverId;
                        }
                        if (temp.Levels == currentLevel && !IsNullOrUndefined(temp.ApproverId)) {
                            cc = TrimComma(cc) + "," + temp.ApproverId;
                        }
                    });
                    to = TrimComma(allToUsers).split(",");
                    // to = cleanArray(to);
                    to = GetUserEmailsbyUserID(cleanArray(to));

                    cc = (TrimComma(cc) + "," + TrimComma(tempApproverMatrix.filter(p => p.Role == Roles.CREATOR)[0].ApproverId));
                    cc = TrimComma(cc).split(",");
                    cc = GetUserEmailsbyUserID(cleanArray(cc));
                    //  cc = GetUserEmailsbyUserID(cc);
                    role = tempApproverMatrix.filter(p => parseInt(p.Levels) == currentLevel)[0].Role;
                    tmplName = EmailTemplateName.SENDBACKMAIL;
                    emailParam["TEMPLATENAME"] = tmplName;
                    emailParam["FROM"] = from;
                    emailParam["TO"] = to;
                    emailParam["CC"] = cc;
                    emailParam["ROLE"] = role;
                    emailParam["BCC"] = "";
                    email = GetEmailBody(tmplName, itemID, mainListName, mailCustomValues, role, emailParam);
                }
                break;
            case ButtonActionStatus.Cancel:
                if (!IsStrNullOrEmpty(strAllusers) && !IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != 0) {
                    from = currentUser.Email;
                    to = TrimComma(strAllusers);
                    // to = cleanArray(to);
                    to = GetUserEmailsbyUserID(cleanArray(to));
                    role = tempApproverMatrix.filter(p => parseInt(p.Levels) == nextLevel)[0].Role;
                    tmplName = EmailTemplateName.REQUESTCANCELED;
                    emailParam["TEMPLATENAME"] = tmplName;
                    emailParam["FROM"] = from;
                    emailParam["TO"] = to;
                    emailParam["CC"] = cc;
                    emailParam["ROLE"] = role;
                    emailParam["BCC"] = "";
                    email = GetEmailBody(tmplName, itemID, mainListName, mailCustomValues, role, emailParam);
                }
                break;
            case ButtonActionStatus.Rejected:
                if (!IsStrNullOrEmpty(strAllusers) && !IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != 0) {
                    from = currentUser.Email;
                    to = TrimComma(strAllusers);
                    // to = cleanArray(to);
                    to = GetUserEmailsbyUserID(cleanArray(to));
                    role = tempApproverMatrix.filter(p => parseInt(p.Levels) == nextLevel)[0].Role;
                    tmplName = EmailTemplateName.REQUESTCANCELED;
                    emailParam["TEMPLATENAME"] = tmplName;
                    emailParam["FROM"] = from;
                    emailParam["TO"] = to;
                    emailParam["CC"] = cc;
                    emailParam["ROLE"] = role;
                    emailParam["BCC"] = "";
                    email = GetEmailBody(tmplName, itemID, mainListName, mailCustomValues, role, emailParam);
                }
                break;
            case ButtonActionStatus.Complete:
                if (!IsStrNullOrEmpty(strAllusers) && !IsNullOrUndefined(tempApproverMatrix) && tempApproverMatrix.length != 0) {
                    from = currentUser.Email;
                    to = tempApproverMatrix.filter(p => p.Role == Roles.CREATOR).ApproverId;
                    cc = TrimComma(strAllusers).split(",");
                    cc = GetUserEmailsbyUserID(cleanArray(cc));
                    role = tempApproverMatrix.filter(p => parseInt(p.Levels) == currentLevel)[0].Role;
                    tmplName = EmailTemplateName.REQUESTCLOSERMAIL;
                    emailParam["TEMPLATENAME"] = tmplName;
                    emailParam["FROM"] = from;
                    emailParam["TO"] = to;
                    emailParam["CC"] = cc;
                    emailParam["ROLE"] = role;
                    emailParam["BCC"] = "";
                    email = GetEmailBody(tmplName, itemID, mainListName, mailCustomValues, role, emailParam);
                }
                break;
            default:
                break;
        }
    }
    catch (ex) {
        // blank catch to handle ie issue in case of CK editor
    }
}

/*Pooja Atkotiya */
function GetEmailUsers(tempApproverMatrix, nextLevel, isNewItem) {

    var userWithRoles = GetPermissionDictionary(tempApproverMatrix, nextLevel, true, isNewItem);
    var userIdString = '';
    userWithRoles.forEach(element => {
        if (element.permission == SharePointPermission.CONTRIBUTOR || element.permission == SharePointPermission.READER) {
            if (!IsNullOrUndefined(element.user)) {
                userIdString = userIdString + element.user.toString();
            }
        }
    });
    return userIdString;
}

/*Priya Rane */
function GetEmailBody(templateName, itemID, mainListName, mailCustomValues, role, emailParam) {
    var emailTemplate = [];
    var emailTemplateListData;

    //GetFormDigest().then(function (data) {
    AjaxCall(
        {
            url: CommonConstant.ROOTURL + "/_api/web/lists/getbytitle('" + ListNames.EMAILTEMPLATELIST + "')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><Query><Where><And><And><Eq><FieldRef Name='ApplicationName' /><Value Type='TaxonomyFieldType'>" + CommonConstant.APPLICATIONNAME + "</Value></Eq><Eq><FieldRef Name='FormName' /><Value Type='Text'>" + CommonConstant.FORMNAME + "</Value></Eq></And><Eq><FieldRef Name='LinkTitle' /><Value Type='Computed'>" + templateName + "</Value></Eq></And></Where></Query></View>\"}",
            httpmethod: 'POST',
            calldatatype: 'JSON',
            async: false,
            headers:
            {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": gRequestDigestValue          //data.d.GetContextWebInformation.FormDigestValue
            },
            sucesscallbackfunction: function (data) {
                emailTemplate.push({ "Subject": data.d.results[0].Subject });
                emailTemplate.push({ "Body": data.d.results[0].Body });
                mailCustomValues.push({ "ItemLink": "#URL" + "https://synoverge.sharepoint.com/sites/dev/Pages/Home.aspx?ID=" + itemID });
                mailCustomValues.push({ "ItemLinkClickHere": "<a href='#URL" + "https://synoverge.sharepoint.com/sites/dev/Pages/Home.aspx?ID=" + itemID + "' >Click Here</a>" });
                emailTemplate = CreateEmailBody(emailTemplate, itemID, mainListName, mailCustomValues, emailParam);
            }
        });


    // });
    //return emailTemplate;
}

/*Pooja Atkotiya */
function CreateEmailBody(emailTemplate, itemID, mainListName, mailCustomValues, emailParam) {
    var emailBodyWithCustomData = [];
    var emailBodyWithAllData = [];
    var matchesSubject = [];
    var matchesBody = [];
    if (!IsNullOrUndefined(emailTemplate)) {
        var subject = '';
        var body = '';
        if (!IsNullOrUndefined(mailCustomValues) && mailCustomValues.length > 0) {
            /* Replacement of Email Body with Custom Values Start */
            var regex = /\[\S+?\]/g;
            emailTemplate.forEach(element => {
                if (!IsStrNullOrEmpty(element["Subject"])) {
                    subject = element["Subject"];
                    if (!IsStrNullOrEmpty(subject)) {
                        subject.replace(regex, function (match) {
                            if (!IsStrNullOrEmpty(match)) {
                                var cName = match.slice(1, -1);
                                mailCustomValues.forEach(custom => {
                                    var cValue = custom[cName];
                                    if (!IsStrNullOrEmpty(cValue)) {
                                        subject = subject.replace(match, cValue);
                                    }
                                });
                            }
                        });
                        element["Subject"] = subject;
                    }
                }
                if (!IsStrNullOrEmpty(element["Body"])) {
                    body = element["Body"];
                    if (!IsStrNullOrEmpty(body)) {
                        body.replace(regex, function (match) {
                            if (!IsStrNullOrEmpty(match)) {
                                var cName = match.slice(1, -1);
                                mailCustomValues.forEach(custom => {
                                    var cValue = custom[cName];
                                    if (!IsStrNullOrEmpty(cValue)) {
                                        body = body.replace(match, cValue);
                                    }
                                });
                            }
                        });
                        element["Body"] = body;
                    }
                }
            });
            /* Replacement of Email Body with Custom Values End */
        }

        emailTemplate.forEach(element => {
            if (!IsStrNullOrEmpty(element["Subject"])) {
                subject = element["Subject"];
                if (!IsStrNullOrEmpty(subject)) {
                    var regex = /\[\S+?\]/g;
                    subject.replace(regex, function (match) {
                        matchesSubject.push(match);
                    });
                }
            }
        });
        emailTemplate.forEach(element => {
            if (!IsStrNullOrEmpty(element["Body"])) {
                body = element["Body"];
                if (!IsStrNullOrEmpty(body)) {
                    var regex = /\[\S+?\]/g;
                    body.replace(regex, function (matchbody) {
                        matchesBody.push(matchbody);
                    });
                }
            }

        });

        GetDatafromList(itemID, mainListName, subject, matchesSubject, body, matchesBody, emailParam);

    }

}

/*Priya Rane */
function GetFieldsValueString(matches, mainlistData) {
    var replacedValues = [];
    matches.forEach(temp => {
        var columnName = temp.slice(1, -1);
        replacedValues.push({ [columnName]: mainlistData[columnName] });/*Pooja Atkotiya */
    });
    return replacedValues;
}

/*Pooja Atkotiya */
function GetDatafromList(itemID, mainListName, subject, matchesSubject, body, matchesBody, emailParam) {
    var mainlistData;
    var replacedValuesSubject = [];
    var replacedValuesBody = [];
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + mainListName + "')/items(" + itemID + ")",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            headers:
            {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            sucesscallbackfunction: function (data) {
                mainlistData = data.d;
                ////replacement with list item values start
                if (!IsNullOrUndefined(mainlistData) && !IsNullOrUndefined(matchesSubject) && matchesSubject.length > 0) {
                    replacedValuesSubject = GetFieldsValueString(matchesSubject, mainlistData);
                    if (!IsNullOrUndefined(replacedValuesSubject) && replacedValuesSubject.length > 0) {
                        replacedValuesSubject.forEach(element => {
                            var regex = /\[\S+?\]/g;
                            subject.replace(regex, function (match) {
                                if (!IsStrNullOrEmpty(match)) {
                                    var cName = match.slice(1, -1);
                                    var cValue = element[cName];
                                    if (!IsStrNullOrEmpty(cValue)) {
                                        subject = subject.replace(match, cValue);
                                    }
                                }
                            });
                        });
                    }
                }
                if (!IsNullOrUndefined(mainlistData) && !IsNullOrUndefined(matchesBody) && matchesBody.length > 0) {
                    replacedValuesBody = GetFieldsValueString(matchesBody, mainlistData);
                    if (!IsNullOrUndefined(replacedValuesBody) && replacedValuesBody.length > 0) {
                        replacedValuesBody.forEach(element => {
                            var regex = /\[\S+?\]/g;
                            body.replace(regex, function (match) {
                                if (!IsStrNullOrEmpty(match)) {
                                    var cName = match.slice(1, -1);
                                    var cValue = element[cName];
                                    if (!IsStrNullOrEmpty(cValue)) {
                                        body = body.replace(match, cValue);
                                    }
                                }
                            });
                        });
                    }
                }
                ////replacement with list item values end

                if (!IsStrNullOrEmpty(subject) && !IsStrNullOrEmpty(body) && !IsNullOrUndefined(emailParam)) {
                    SaveEmail(subject, body, emailParam);
                }
            }
        });
}

/*Pooja Atkotiya */
function SaveEmail(subject, body, emailParam) {
    var emailSaved = false;
    if (!IsStrNullOrEmpty(subject) && !IsStrNullOrEmpty(body) && !IsNullOrUndefined(emailParam) && emailParam.length > 0 && !IsStrNullOrEmpty(emailParam.TEMPLATENAME) && !IsStrNullOrEmpty(emailParam.FROM) && !IsStrNullOrEmpty(emailParam.TO) || !IsStrNullOrEmpty(emailParam.CC) || !IsStrNullOrEmpty(emailParam.BCC)) {

        var to = emailParam.TO;
        if (!IsStrNullOrEmpty(to)) {
            var strTo = TrimComma(to).split(",");
            to = removeDuplicateFromArray(strTo).toString();
        }

        var cc = emailParam.CC;
        if (!IsStrNullOrEmpty(cc)) {
            var strCC = TrimComma(cc).split(",");
            cc = removeDuplicateFromArray(strCC).toString();
        }

        var bcc = emailParam.BCC;
        if (!IsStrNullOrEmpty(bcc)) {
            var strBCC = TrimComma(bcc).split(",");
            bcc = removeDuplicateFromArray(strBCC).toString();
        }

        var emailListArray = {};
        // emailListArray["__metadata"] = {
        //     "type": GetItemTypeForListName(ListNames.EMAILNOTIFICATION)
        // };
        emailListArray["To"] = to;
        emailListArray["From"] = TrimComma(emailParam.FROM);
        //if (!IsStrNullOrEmpty(cc)) {
        emailListArray["CC"] = cc;
        //}
        // if (!IsStrNullOrEmpty(bcc)) {
        emailListArray["BCC"] = bcc;
        //  }
        emailListArray["Title"] = emailParam.TEMPLATENAME;
        emailListArray["ApplicationName"] = CommonConstant.APPLICATIONNAME;
        emailListArray["FormName"] = CommonConstant.FORMNAME;
        emailListArray["Subject"] = subject;
        emailListArray["Body"] = body;
        //emailListArray["IsRepeat"] = isRepeat;

        // var url = CommonConstant.ROOTURL + "/_api/web/lists/getbytitle('" + ListNames.EMAILNOTIFICATION + "')/items";


        $.ajax({
            url: CommonConstant.SAVEEMAILINLIST,
            type: 'POST',
            headers: {
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            data: JSON.stringify(emailListArray),
            async: false,
            success: function (data) {
                console.log("Email Saved Successfully");
                console.log(data);

            },
            error: function (error) {
                console.log(error);
            }
        });


        // var digest;
        // GetFormDigest().then(function (data) {
        //     digest = data.d.GetContextWebInformation.FormDigestValue;

        //     if (!IsNullOrUndefined(digest)) {
        //         var headers = {
        //             "Accept": "application/json;odata=verbose",
        //             "Content-Type": "application/json;odata=verbose",
        //             "X-RequestDigest": digest,
        //             "X-HTTP-Method": "POST"
        //         };

        //         AjaxCall(
        //             {
        //                 url: url,
        //                 httpmethod: 'POST',
        //                 calldatatype: 'JSON',
        //                 headers: headers,
        //                 async: false,
        //                 postData: JSON.stringify(emailListArray),
        //                 sucesscallbackfunction: function (data) {
        //                     debugger;
        //                     emailSaved = true;
        //                     console.log("Data saved successfully in email template for Template = " + emailParam.TEMPLATENAME);
        //                 },
        //                 error: function (data) {
        //                     debugger;
        //                 }
        //             });
        //     }
        //     return emailSaved;
        // });
    }

}

/*Pooja Atkotiya */
function IsValidDate(dateObj) {
    var isValid = false;
    if (Object.prototype.toString.call(dateObj) === "[object Date]") {
        // it is a date
        if (isNaN(dateObj.getTime())) {  // d.valueOf() could also work
            // date is not valid
            isValid = false;
        } else {
            // date is valid
            isValid = true;
        }
    } else {
        // not a date
        isValid = false;
    }
    return isValid;
}

/*Pooja Atkotiya */
function TrimComma(yourString) {
    var result = yourString;
    if (!IsStrNullOrEmpty(yourString)) {
        result = yourString.toString().trim().replace(/^\,|\,$/g, '');
    }
    return result;
}

/*Pooja Atkotiya */
/*Work only for non-zero array, if array contains 0 then it will remove 0 also */
function cleanStringArray(actualArray) {
    var newArray = new Array();
    for (var i = 0; i < actualArray.length; i++) {
        if (actualArray[i]) {
            newArray.push(actualArray[i]);
        }
    }
    return newArray;
}

/*Pooja Atkotiya */
/*Work for all array, if array contains 0 then return array with 0 also */
function cleanArray(actualArray) {
    return actualArray.filter(function (e) { return e === 0 || e });
}

/*Pooja Atkotiya */
function RemoveHtmlForMultiLine(multiLineValue) {
    if (!IsStrNullOrEmpty(multiLineValue)) {
        return multiLineValue.replace(/(<([^>]+)>)/ig, "");
    } else {
        return "";
    }
}


/*Pooja Atkotiya */
function IsGroupMember(groupName) {
    var isAuthorized = false;
    if (!IsNullOrUndefined(currentUser.Groups) && !IsNullOrUndefined(currentUser.Groups.results) && currentUser.Groups.results.length > 0) {
        var currentUserGrps = currentUser.Groups.results;
        if (currentUserGrps.some(grp => grp.LoginName == groupName)) {
            isAuthorized = true;
        }

    }
}

/*Pooja Atkotiya */
function GetSPGroupIDByName(grpName, handleData) {
    if (!IsStrNullOrEmpty(grpName)) {
        AjaxCall(
            {
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/getbyname('" + grpName + "')?$select=id",
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
<<<<<<< HEAD
                    
=======
>>>>>>> 9d7e195c2cd68a17025a08f3eddd7a20a35efe1a
                    handleData(data.d.Id);
                }
            });
    }
}

/*Priya Rane */
function checkDuplicateFileName(fileName) {
    var isDuplicate = true;
    fileCommonArray.forEach(function (element) {
        if (element.name == fileName) {
            isDuplicate = false;
        }
    });
    return isDuplicate;
}

function updateRequestIDAttachmentList(attchmentID, itemID) {
    var itemType = GetItemTypeForListName(ListNames.ATTACHMENTLIST);
    var item = {
        "__metadata": { "type": itemType },
        "RequestIDId": itemID
    };

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.ATTACHMENTLIST + "')/items(" + attchmentID + ")",
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
            console.log("Item saved Successfully");
        },
        error: function (data) {
            debugger
            failure(data);
        }
    });
}