var data = null;
var listTempGridDataArray = [];

$(document).ready(function () {
    GetVendorDetails();
    $(document).on('shown.bs.modal', "#CRUDVendorModal", function () {
        if ($('myform').length > 0)
            $('myform').renameTag('form');
        KeyPressNumericValidation();
        $("#IsNewVendor").val("unchecked");
    });
    $(document).on('click', 'a[id="btnAddVendor"]', function () {
        AddVendorDetails();
    });
    $(document).on('click', 'a[id*="EditVendor_"]', function () {
        EditVendorDetails(jQuery(this));
    });
    $(document).on('click', 'a[id*="ViewVendor_"]', function () {
        ViewVendorDetails(jQuery(this));
    });
    $(document).on('click', 'a[id*="DeleteVendor_"]', function () {
        DeleteVendorDetails(jQuery(this));
    });

    // $('#tblVendor').DataTable({
    //     "columnDefs": [{
    //         "targets": 'no-sort',
    //         "orderable": false
    //     }]
    // });
});

//function AutoPopulateVendor() {
// $("#tags").autocomplete({
//     source: function (request, response) {
//         $.ajax({
//             url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('VendorMaster')/items?$filter=substringof('" + request.term + "',Title)&$top=100&$select=Title,Address",
//             type: "GET",
//             headers: {
//                 Accept: "application/json;odata=verbose"
//             },
//             async: false,
//             cache: false,
//             beforeSend: function () {
//                 console.log("beforeSend");
//             },
//             success: function (data, status, xhr) {
//                 arrayVendor = [];
//                 arrayAddress = [];
//                 for (i = 0; i < data.d.results.length; i++) {
//                     //  arrayEmployee.push(data.d.results[i]["Title"] + ", " + data.d.results[i]["Address"]);    
//                     arrayVendor.push(data.d.results[i]["Title"]);
//                     var VendorName = data.d.results[i]["Title"];
//                     var Address = data.d.results[i]["Address"];
//                     arrayAddress.push({ name: VendorName, address: Address });
//                 }
//                 arrayVendor = $.unique(arrayVendor);
//                 response(arrayVendor);
//                 var autoSuggestion = document.getElementsByClassName('ui-autocomplete');
//                 if (autoSuggestion.length > 0) {
//                     autoSuggestion[0].style.zIndex = 1051;
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.log("error: " + xhr.responseText);
//             },
//             complete: function () {
//                 console.log("complete");
//             }
//         });
//     },
//     minLength: 2,
//     appendTo: $("#menu"),
//     select: showLabel
// });
//}
function showLabel(event, ui) {
    var nameofvendor = $('#tags').val();
    if (nameofvendor != undefined && nameofvendor != "") {
        arrayAddress.forEach(element => {
            if (element.name == nameofvendor) {
                $('#Address').val(element.address);
            }
        });
    }
    else {
        $('#Address').val('');
    }

}
function onchangecheckBox() {
    var checkBox = document.getElementById("addVendorMaster");
    if (checkBox.checked == true) {
        $("#IsNewVendor").val("checked");
    } else {
        $("#IsNewVendor").val("unchecked");
    }
}

function AddVendorDetails() {
    $("#CRUDVendorModal *").removeAttr("disabled");
    $("#CRUDVendorModal").find('input,textarea,select,checkbox').val('');
    $("#CRUDVendorModal").modal('show');
    $("#spanTitle").html('Add Vendor Detail');
    $('input[type=checkbox]').prop('checked', false);

}

function ViewVendorDetails(obj) {
    var item;
    var id = jQuery(obj).attr('id').split('_')[2].trim();
    var index = jQuery(obj).attr('id').split('_')[1].trim();
    listTempGridDataArray.forEach(function (arrayItem) {
        console.log(arrayItem);
        if (arrayItem.Index == index) {
            item = arrayItem;
        }
    });
    // var id = jQuery(obj).attr('id').split('_')[1].trim();
    //  var item = GetVendorDetailsById(id);
    if (!IsNullOrUndefined(item)) {
        $("#CRUDVendorModal").modal('show');
        $("#spanTitle").html('Vendor Detail');
        $('.dynamic-control').each(function () {
            var elementId = $(this).attr('id');
            var fieldName = $(this).attr('id');
            var elementType = $(this).attr('controlType');
            if (elementType == 'multicheckbox')
                fieldName = $(this).attr("cParent");
            else if (elementType == 'radiogroup')
                fieldName = $(this).attr("cParent");

            setFieldValue(elementId, item, elementType, fieldName);
        });
        $("#CRUDVendorModal *").attr("disabled", "disabled");
        $("#CRUDVendorModal").find(".modal-footer").find("button").remove("onclick");
        $("#CRUDVendorModal").find('.modal-header').find("button").removeAttr("disabled");
    }
    else {
        console.log("No vendor details found = " + id);
    }
}

function GetVendorDetailsById(id) {
    var VendorDetailresult;
    $.ajax
        ({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.CAPEXVENDORLIST + "')/items(" + id + ")",
            type: "GET",
            async: false,
            datatype: 'json',
            headers:
            {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                VendorDetailresult = data.d;
            }
        });
    return VendorDetailresult;
}

function EditVendorDetails(obj) {
    var item;
    var id = jQuery(obj).attr('id').split('_')[2].trim();
    var index = jQuery(obj).attr('id').split('_')[1].trim();
    listTempGridDataArray.forEach(function (arrayItem) {
        console.log(arrayItem);
        if (arrayItem.Index == index) {
            item = arrayItem;
        }
    });
    $("#IsNewVendor").val("unchecked");
    $("#addVendorMaster").val("unchecked");

    // var item = GetVendorDetailsById(id);
    if ($('myform').length > 0)
        $('myform').renameTag('form');
    if (!IsNullOrUndefined(item)) {
        $("#CRUDVendorModal *").removeAttr("disabled");
        $("#addVendorMaster").attr("disabled", "disabled");
        $("#CRUDVendorModal").modal('show');
        $("#spanTitle").html('Edit Vendor Detail');
        $('.dynamic-control').each(function () {
            var elementId = $(this).attr('id');
            var fieldName = $(this).attr('id');
            var elementType = $(this).attr('controlType');
            if (elementType == 'multicheckbox')
                fieldName = $(this).attr("cParent");
            else if (elementType == 'radiogroup')
                fieldName = $(this).attr("cParent");
            setFieldValue(elementId, item, elementType, fieldName);
        });
    }
    else {
        console.log("No vendor details found = " + id);
    }
}

/*
    function setFieldValues(controlId, item, fieldType, fieldName) {
        if (!fieldName || fieldName == "")
            fieldName = controlId;

        switch (fieldType) {
            case "hidden":
                $("#" + controlId).val(item[fieldName]);
                break;
            case "text":
                $("#" + controlId).val(item[fieldName]).change();
                break;
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
                if (item[fieldName] && item[fieldName] != null) {
                    dt = new Date(item[fieldName]).format("dd-MM-yyyy");
                    $("#" + controlId).val(dt).change();
                }
                break;
            case "multicheckbox":
                if (item[fieldName] != null && item[fieldName].results != null && item[fieldName].results.length > 0) {
                    item[fieldName].results.forEach(function (thisItem) {
                        if (thisItem == controlId) {
                            $("#" + controlId)[0].checked = true;
                            if (listDataArray[fieldName] == undefined)
                                listDataArray[fieldName] = { "__metadata": { "type": "Collection(Edm.String)" }, "results": [] };
                            listDataArray[fieldName].results.push(thisItem);
                        }
                    });
                }
                break;
            case "radiogroup":
                if (controlId == item[fieldName])
                    $("#" + controlId).prop('checked', true);
                else
                    $("#" + controlId).prop('checked', false);
                break;
        }
    }
*/
function SaveVendorData(listDataArray) {

    //listDataArray["ListName"] = listname;
    console.log(listDataArray);
    var tempgrid = [];
    var count = listTempGridDataArray.length;
    if (listDataArray.Type === "Edit") {
        var index = listDataArray.Index;
        var removeIndex = listTempGridDataArray.map(function (item) { return item.Index; }).indexOf(Number(index));
        var tempgrid = listTempGridDataArray.splice(removeIndex, 1);

        listDataArray.Index = Number(index);
        // listTempGridDataArray.push(listDataArray);
        // listTempGridDataArray.sort(function (a, b) {
        //     return a.Index - b.Index
        // });

    }

    if (IsStrNullOrEmpty(listDataArray.ID)) {
        listDataArray.ID = "0";
        if (listDataArray.Index == "") {
            listDataArray.Index = count + 1;
        }
        listDataArray.Status = ItemActionStatus.NEW;
        listDataArray.Type = "Edit";

    }
    else {
        listDataArray.Status = ItemActionStatus.UPDATED;
        // listTempGridDataArray.push(listDataArray);
    }
    listTempGridDataArray.push(listDataArray);
    listTempGridDataArray.sort(function (a, b) {
        return a.Index - b.Index
    });

    GetVendorDetails(listTempGridDataArray);

    $("#CRUDVendorModal").modal('hide');
    AlertModal("Success", "Vendor Details Saved Successfully");
}

function SaveVendorNameInMaster(listDataArray) {
    var mainlistDataArray = {};
    mainlistDataArray["__metadata"] = {
        "type": GetItemTypeForListName(ListNames.VENDORMASTER)
    };
    mainlistDataArray['Title'] = listDataArray.VendorName;
    mainlistDataArray['Address'] = listDataArray.Address;

    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.VENDORMASTER + "')/items",
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
            },
            sucesscallbackfunction: function (data) {
                listDataArray.isVendorAdded = "Yes";
                console.log("Item saved Successfully");
            }
        });
}

/*
    function GetFormControlsValues(id, elementType, listDataArray) {
        var obj = '#' + id;
        switch (elementType) {
            case "hidden":
                listDataArray[id] = $(obj).val();
                break;
            case "text":
                listDataArray[id] = $(obj).val();
                break;
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
                listDataArray[id] = $(obj).val();
                break;
            case "multitext":
                listDataArray[id] = $(obj).val();
                break;
            case "date":
                listDataArray[id] = $(obj).val();
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
*/

function ValidateModalForm() {
    var isValid = true;
    $('#form_VendorSection').valid();
    if (!$(form_VendorSection).valid()) {
        isValid = false;
        try {
            var validator = $(form_VendorSection).validate();
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
    return isValid;

}

function SaveVendorDetails() {
    var saveDataArray = {}
    //var tranListName = ListNames.CAPEXVENDORLIST;
   // find('input[listtype=main],select[listtype=main],radio[listtype=main],textarea[listtype=main],label[listtype=main],input[reflisttype=main],select[reflisttype=main],radio[reflisttype=main],textarea[reflisttype=main],label[reflisttype=main],select[reflisttype=trans]').each(function () {
    $('#CRUDVendorModal').find('input[listtype=trans],select[listtype=trans],radio[listtype=trans],textarea[listtype=trans],label[listtype=trans],input[reflisttype=main],select[reflisttype=main],radio[reflisttype=main],textarea[reflisttype=main],label[reflisttype=main],select[reflisttype=trans]').each(function () {
        var elementId = $(this).attr('id');
        var elementType = $(this).attr('controlType');
        var elementvaluetype = $(this).attr('controlvaluetype');
        //  saveDataArray = GetFormControlsValues(elementId, elementType, saveDataArray);
        saveDataArray = GetFormControlsValue(elementId, elementType, saveDataArray,elementvaluetype);
    });
    // var email = document.getElementById('VendorEmailID');
    // var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    // if (!filter.test(email.value)) {
    // alert('Please provide a valid email address');
    // email.focus;
    // return false;

    var isValid = ValidateModalForm();
    if (isValid) {
        SaveVendorData(saveDataArray);

        //}
    }
}
function validateEmail(emailField) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (reg.test(emailField.value) == false) {
        // alert('Invalid Email Address');
        document.getElementById('invalidemail').innerHTML = "This is invalid EmailID ";
        return false;
    }
    else {
        document.getElementById('invalidemail').innerHTML = " ";
    }
    return true;

}

function DeleteVendorDetails(obj) {
    ConfirmationDailog({
        title: "Remove", message: "Are you sure to delete this vendor details?", id: jQuery(obj).attr('id').split('_')[1].trim(),
        // url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.CAPEXVENDORLIST + "')/items(" + jQuery(obj).attr('id').split('_')[1].trim() + ")",
        okCallback: function (id, data) {
            // var tr = jQuery(obj).parents('tr:first');
            // tr.remove();
            var id = jQuery(obj).attr('id').split('_')[2].trim();
            var index = jQuery(obj).attr('id').split('_')[1].trim();

            //var removeIndex = listTempGridDataArray.map(function (item) { return item.Index; }).indexOf(Number(index));

            // remove object
            //var removeditem = listTempGridDataArray.splice(removeIndex, 1);

            listTempGridDataArray.filter(function (item) {
                if (item.Index == index) {
                    item.Status = ItemActionStatus.DELETED;
                }
            });

            GetVendorDetails(listTempGridDataArray);
            $("#CRUDVendorModal").modal('hide');
            HideWaitDialog();
            //jQuery("#loading").hide();
            AlertModal("Success", "Vendor Details deleted Successfully");
        }
    });
}

function GetVendorDetails(listTempGridDataArray) {
    $('#tblVendor tbody').empty();
    if (!IsNullOrUndefined(listTempGridDataArray)) {
        var indexCount = 1;
        listTempGridDataArray.forEach(function (arrayItem) {
            if (arrayItem.Status != ItemActionStatus.DELETED)   ////skip deleted rows
            {
                if (IsNullOrUndefined(arrayItem.Index)) {
                    arrayItem.Index = indexCount;
                    indexCount++;
                }
                if (IsStrNullOrEmpty(arrayItem.Type)) {
                    arrayItem.Type = "Edit";
                }

                var recommended = "No";
                if (arrayItem.Recommended) {
                    recommended = "Yes";
                }

                console.log(arrayItem);
                tr = $('<tr/>');

                tr.append("<td width='10%'>" + arrayItem.VendorName + "</td>");
                tr.append("<td width='10%'>" + arrayItem.VendorEmailID + "</td>");
                tr.append("<td width='20%'>" + arrayItem.Specifications + "</td>");
                tr.append("<td width='10%'>" + arrayItem.GrossValue + "</td>");
                tr.append("<td width='10%'>" + arrayItem.LessDiscount + "</td>");
                tr.append("<td width='10%'>" + arrayItem.NetValue + "</td>");
                tr.append("<td width='10%'>" + arrayItem.TotalValue + "</td>");
                tr.append("<td width='10%'>" + recommended + "</td>");
                tr.append("<td width='12%'>" +
                    "<a class='view' id='ViewVendor_" + arrayItem.Index + '_' + arrayItem.ID + "' title='View' data-toggle='tooltip'><i class='material-icons'>&#xE417;</i></a>" +
                    "<a id='EditVendor_" + arrayItem.Index + '_' + arrayItem.ID + '_' + arrayItem.Type + "' class='edit' title='Edit' data-toggle='modal'><i class='material-icons'>&#xE254;</i></a>" +
                    "<a id='DeleteVendor_" + arrayItem.Index + '_' + arrayItem.ID + "' class='delete' title='Delete' data-toggle='modal'><i class='material-icons'>&#xE872;</i></a></td>");
                $('#tblVendor').append(tr);
            }
        });
    }
}
