var data = null;
var listTempGridDataArray = [];


$(document).ready(function () {
    GetVendorDetails();
  
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

    $(document).on('shown.bs.modal', "#CRUDVendorModal", function () {
        if ($('myform').length > 0)
            $('myform').renameTag('form');
        KeyPressNumericValidation();
        $("#IsNewVendor").val("unchecked");
    });
});

// function showLabel(event, ui) {
//     var nameofvendor = $('#tags').val();
//     if (nameofvendor != undefined && nameofvendor != "") {
//         arrayAddress.forEach(element => {
//             if (element.name == nameofvendor) {
//                 $('#Address').val(element.address);
//             }
//         });
//     }
//     else {
//         $('#Address').val('');
//     }

// }

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
    $("#CRUDVendorModal").find('input,textarea,select,checkbox').removeClass("error");
    var x = document.getElementsByClassName("error");
    var i;
    for (i = 0; i < x.length; i++) {
     x[i].style.display = "none";
    }
    $("#CRUDVendorModal").modal('show');
    $("#spanTitle").html('Add Vendor Details');
    $('input[type=checkbox]').prop('checked', false);
    $('#btnSave').show();
}

function ViewVendorDetails(obj) {
    // var item;
    // $("#CRUDVendorModal").modal('show');
    // var id = jQuery(obj).attr('id').split('_')[2].trim();
    // var index = jQuery(obj).attr('id').split('_')[1].trim();
    // listTempGridDataArray.forEach(function (arrayItem) {
    //     if (arrayItem.Index == index) {
    //         item = arrayItem;
    //     }
    // });
    
    // if (!IsNullOrUndefined(item)) {
     
    //     $("#spanTitle").html('Vendor Detail');
    //     $('.dynamic-control').each(function () {
    //         var elementId = $(this).attr('id');
    //         var fieldName = $(this).attr('id');
    //         var elementType = $(this).attr('controlType');
    //         if (elementType == 'multicheckbox')
    //             fieldName = $(this).attr("cParent");
    //         else if (elementType == 'radiogroup')
    //             fieldName = $(this).attr("cParent");
    //             console.log(item);
    //         setFieldValue(elementId, item, elementType, fieldName);
    //     });
       
    //     $("#CRUDVendorModal *").attr("disabled", "disabled");
    //     $("#CRUDVendorModal").find(".modal-footer").find("button").remove("onclick");
    //     $("#CRUDVendorModal").find('.modal-header').find("button").removeAttr("disabled");
    // }
    // else {
    //     console.log("No vendor details found = " + id);
    // }
    var item;
    var id = jQuery(obj).attr('id').split('_')[2].trim();
    var index = jQuery(obj).attr('id').split('_')[1].trim();
    listTempGridDataArray.forEach(function (arrayItem) {
        console.log(arrayItem);
        if (arrayItem.Index == index) {
            item = arrayItem;
        }
    });

  
    if ($('myform').length > 0)
        $('myform').renameTag('form');
    if (!IsNullOrUndefined(item)) {
        $("#CRUDVendorModal *").removeAttr("disabled");
        $("#addVendorMaster").attr("disabled", "disabled");
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
    }
    else {
        console.log("No vendor details found = " + id);
    }
    $("#CRUDVendorModalbody *").attr("disabled", "disabled");
    //$("#CRUDVendorModal").find(".modal-footer").find("button").remove("onclick");
    $('#btnSave').hide();
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
    $('#btnSave').show();
}
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
        if (IsNullOrUndefined(listDataArray.Index) || IsStrNullOrEmpty(listDataArray.Index)) {
            listDataArray.Index = count + 1;
        }
        listDataArray.Status = ItemActionStatus.NEW;
        listDataArray.Type = "Edit";

    }
    else {
        listDataArray.Status = ItemActionStatus.UPDATED;
        // listTempGridDataArray.push(listDataArray);
    }

    if (listDataArray.Recommended = true && listDataArray.Recommended !=" ") {
        listTempGridDataArray.forEach(function Â (element1) {
            element1.Recommended = false;
        });
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
function ValidateModalForm() {
    var isValid = true;
    $('#form_VendorSection').valid();
    if (!$(form_VendorSection).valid()) {
        isValid = false;
        try {
            var validator = $(form_VendorSection).validate();
            $(validator.errorList).each(function (i, errorItem) {
               
                $("#" + errorItem.element.id).addClass("error");
                
                var error_element=$("span", element.parent());
                    if (!valid){error_element.removeClass("error").addClass("error_show"); error_free=false;}
                    else{error_element.removeClass("error_show").addClass("error");}
                   
                $("#" + errorItem.element.id).removeClass("valid");
                $("#" + errorItem.element.id).next().remove();
                
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
    $('#CRUDVendorModal').find('input[listtype=trans],select[listtype=trans],radio[listtype=trans],textarea[listtype=trans],label[listtype=trans],select[reflisttype=trans]').each(function () {
        var elementId = $(this).attr('id');
        var elementType = $(this).attr('controlType');
        var elementvaluetype = $(this).attr('controlvaluetype');
        saveDataArray = GetFormControlsValue(elementId, elementType, saveDataArray, elementvaluetype);
    });
    var isemailValid = validateEmail(VendorEmailID);
    var isValid = ValidateModalForm();
    if (isValid && isemailValid==true) {
        SaveVendorData(saveDataArray);

        //}
    }
}
function validateEmail(emailField) {
   
   // var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (reg.test(emailField.value) == false) {
        document.getElementById('invalidemail').innerHTML = "This is invalid EmailID ";
        return false;
    }
    else {
        document.getElementById('invalidemail').innerHTML = " ";
        
    }
   
    return true;
    // var is_email=reg.test(input.val());
	// if(is_email){input.removeClass("invalid").addClass("valid");}
	// else{input.removeClass("valid").addClass("invalid");}
   

}

function DeleteVendorDetails(obj) {
    ConfirmationDailog({
        title: "Remove", message: "Are you sure to delete this vendor details?", id: jQuery(obj).attr('id').split('_')[1].trim(), 
        okCallback: function (id, data) {
            // var tr = jQuery(obj).parents('tr:first');
            // tr.remove();
            var id = jQuery(obj).attr('id').split('_')[2].trim();
            var index = jQuery(obj).attr('id').split('_')[1].trim();
            listTempGridDataArray.filter(function (item) {
                if (item.Index == index) {
                    item.Status = ItemActionStatus.DELETED;
                }
            });

            GetVendorDetails(listTempGridDataArray);
            $("#CRUDVendorModal").modal('hide');
            HideWaitDialog();
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
                var Negotiated = "No";
                if (arrayItem.NegotiatedNonNegotiated) {
                    Negotiated = "Yes";
                }

                console.log(arrayItem);
                tr = $('<tr/>');

                tr.append("<td width='10%'>" + arrayItem.VendorName + "</td>");
                tr.append("<td width='10%'>" + arrayItem.VendorEmailID + "</td>");
                // tr.append("<td width='20%'>" + arrayItem.Specifications + "</td>");
                tr.append("<td width='10%'>" + arrayItem.GrossValue + "</td>");
                tr.append("<td width='10%'>" + arrayItem.LessDiscount + "</td>");
                tr.append("<td width='10%'>" + arrayItem.NetValue + "</td>");
                tr.append("<td width='10%'>" + arrayItem.TotalValue + "</td>");
                tr.append("<td width='10%'>" + arrayItem.DeliveryPeriod + "</td>");
                tr.append("<td width='10%'>" + Negotiated + "</td>");
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


// function GetVendorDetailsForViewMode(listTempGridDataArray) {
//     $('#tblVendor tbody').empty();
//     if (!IsNullOrUndefined(listTempGridDataArray)) {
//         var indexCount = 1;
//         listTempGridDataArray.forEach(function (arrayItem) {
//             if (arrayItem.Status != ItemActionStatus.DELETED)   ////skip deleted rows
//             {
//                 if (IsNullOrUndefined(arrayItem.Index)) {
//                     arrayItem.Index = indexCount;
//                     indexCount++;
//                 }
//                 if (IsStrNullOrEmpty(arrayItem.Type)) {
//                     arrayItem.Type = "Edit";
//                 }

//                 var recommended = "No";
//                 if (arrayItem.Recommended) {
//                     recommended = "Yes";
//                 }
//                 var Negotiated = "No";
//                 if (arrayItem.NegotiatedNonNegotiated) {
//                     Negotiated = "Yes";
//                 }

//                 console.log(arrayItem);
//                 tr = $('<tr/>');

//                 tr.append("<td width='10%'>" + arrayItem.VendorName + "</td>");
//                 tr.append("<td width='10%'>" + arrayItem.VendorEmailID + "</td>");
//                 // tr.append("<td width='20%'>" + arrayItem.Specifications + "</td>");
//                 tr.append("<td width='10%'>" + arrayItem.GrossValue + "</td>");
//                 tr.append("<td width='10%'>" + arrayItem.LessDiscount + "</td>");
//                 tr.append("<td width='10%'>" + arrayItem.NetValue + "</td>");
//                 tr.append("<td width='10%'>" + arrayItem.TotalValue + "</td>");
//                 tr.append("<td width='10%'>" + arrayItem.DeliveryPeriod + "</td>");
//                 tr.append("<td width='10%'>" + Negotiated + "</td>");
//                 tr.append("<td width='10%'>" + recommended + "</td>");

//                 tr.append("<td width='12%'>" +
//                     "<a class='view' id='ViewVendor_" + arrayItem.Index + '_' + arrayItem.ID + "' title='View' data-toggle='tooltip'><i class='material-icons'>&#xE417;</i></a></td>");
//                 $('#tblVendor').append(tr);
//             }
//         });
//     }
// }