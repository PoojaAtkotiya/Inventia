var data = null;
var listTempGridDataArray = [];

$(document).ready(function () {
    GetVendorDetails();
    $(document).on('shown.bs.modal', "#CRUDVendorModal", function () {
        if ($('myform').length > 0)
            $('myform').renameTag('form');
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

    $('#tblVendor').DataTable({
        "columnDefs": [{
            "targets": 'no-sort',
            "orderable": false
        }]
    });
});


function AddVendorDetails() {
    $("#CRUDVendorModal *").removeAttr("disabled");
    $("#CRUDVendorModal").find('input,textarea,select').val('');
    $("#CRUDVendorModal").modal('show');
    $("#spanTitle").html('Add Vendor Detail');
}

function ViewVendorDetails(obj) {
    var id = jQuery(obj).attr('id').split('_')[1].trim();
    var item = GetVendorDetailsById(id);
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

            setFieldValues(elementId, item, elementType, fieldName);
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
    var id = jQuery(obj).attr('id').split('_')[1].trim();
    var item = GetVendorDetailsById(id);
    if ($('myform').length > 0)
        $('myform').renameTag('form');
    if (!IsNullOrUndefined(item)) {
        $("#CRUDVendorModal *").removeAttr("disabled");
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
            setFieldValues(elementId, item, elementType, fieldName);
        });
    }
    else {
        console.log("No vendor details found = " + id);
    }
}

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
            $("#" + controlId).val(item[fieldName]).change();
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
                        debugger;
                        if (listDataArray[fieldName] == undefined)
                            listDataArray[fieldName] = { "__metadata": { "type": "Collection(Edm.String)" }, "results": [] };
                        listDataArray[fieldName].results.push(thisItem);
                    }
                });
            }
            break;
        case "radiogroup":
            debugger;
            if (controlId == item[fieldName])
                $("#" + controlId).prop('checked', true);
            else
                $("#" + controlId).prop('checked', false);
            break;
    }
}



function GetItemTypeForListName(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
}

function SaveVendorData(listname, listDataArray) {
    console.log(listDataArray);
    listTempGridDataArray.push(listDataArray);
    // $("#form_VendorSection").submit();

    AlertModal("Success", "Vendor Details Saved Successfully");

    //  GetVendorDetails();

    /*  var itemType = GetItemTypeForListName(listname);
      if (listDataArray != null) {
          listDataArray["__metadata"] = {
              "type": itemType
          };
  
          var url = '', headers = '';
          if (listDataArray.ID != null && listDataArray.ID > 0 && listDataArray.ID != "") {
              // listDataArray.ID = listItemId;
              url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items(" + listDataArray.ID + ")";
              headers = { "Accept": "application/json;odata=verbose", "X-RequestDigest": $("#__REQUESTDIGEST").val(), "IF-MATCH": "*", "X-HTTP-Method": "MERGE" };
          }
          else {
              listDataArray.ID = isNaN(parseInt(listDataArray.ID)) == true ? 0 : parseInt(listDataArray.ID);
              url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
              headers = { "Accept": "application/json;odata=verbose", "X-RequestDigest": $("#__REQUESTDIGEST").val() };
          }
  
          $.ajax({
              url: url,
              type: "POST",
              contentType: "application/json;odata=verbose",
              data: JSON.stringify(listDataArray),
              headers: headers,
              success: function (data) {               
                  AlertModal("Success", "Vendor Details Saved Successfully.", true, GetVendorDetails());
                 // $('#CRUDVendorModal').modal('hide');
                  //window.location = window.location.href;
              },
              error: function (data) {
                  console.log(data);
              }
          });
      }*/
}

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

function ValidateModalForm() {
    var isValid = true;
    // $('#form_VendorSection').valid();
    // if (!$(this).valid()) {
    //     isValid = false;
    //     try {
    //         var validator = $(this).validate();
    //         $(validator.errorList).each(function (i, errorItem) {
    //             //  AlertModal("Validation", errorItem.element.id + "' : '" + errorItem.message);
    //             $("#" + errorItem.element.id).addClass("error");
    //             $("#" + errorItem.element.id).removeClass("valid");
    //             $("#" + errorItem.element.id).next().remove();
    //             console.log("{ '" + errorItem.element.id + "' : '" + errorItem.message + "'}");
    //         });
    //     }
    //     catch (e1) {
    //         console.log(e1.message);
    //     }
    // }
    return isValid;

}

function SaveVendorDetails() {
    var saveDataArray = {}
    var mainListName = ListNames.CAPEXVENDORLIST;
    $('#CRUDVendorModal').find('input[listtype=trans],select[listtype=trans],radio[listtype=trans],textarea[listtype=trans],label[listtype=trans]').each(function () {
        var elementId = $(this).attr('id');
        var elementType = $(this).attr('controlType');
        saveDataArray = GetFormControlsValues(elementId, elementType, saveDataArray);
    });


    var isValid = ValidateModalForm();
    if (isValid) {

        SaveVendorData(mainListName, saveDataArray);
    }
}

function DeleteVendorDetails(obj) {
    ConfirmationDailog({
        title: "Remove", message: "Are you sure to delete this vendor details?", id: jQuery(obj).attr('id').split('_')[1].trim(),
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.CAPEXVENDORLIST + "')/items(" + jQuery(obj).attr('id').split('_')[1].trim() + ")",
        okCallback: function (id, data) {
            var tr = jQuery(obj).parents('tr:first');
            tr.remove();
            AlertModal("Success", "Vendor Details deleted Successfully.", false, GetVendorDetails());
            window.location = window.location.href;
        }
    });
}

function GetVendorDetails() {
    $.ajax
        ({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + ListNames.CAPEXVENDORLIST + "')/items",
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
                if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d) && !IsNullOrUndefined(data.d.results)) {
                    var result = data.d.results;
                    var tr;
                    for (var i = 0; i < result.length; i++) {
                        tr = $('<tr/>');
                        // tr.append('<td width="3px"><span class="custom-checkbox">' +
                        //     '<input type="checkbox" id="chkVendor_' + result[i].ID + '" name="options[]">' +
                        //     '<label for=id="chkVendor_' + result[i].ID + '"></label>' +
                        //     '</span>' +
                        //     '</td>'
                        // );
                        tr.append("<td width='13%'>" + result[i].VendorName + "</td>");
                        tr.append("<td width='14%'>" + result[i].VendorAddress + "</td>");
                        tr.append("<td width='10%'>" + result[i].Make + "</td>");
                        tr.append("<td width='10%'>" + result[i].GrossValue + "</td>");
                        tr.append("<td width='9%'>" + result[i].Discount + "</td>");
                        tr.append("<td width='17%'>" + result[i].NetValue + "</td>");
                        tr.append("<td width='16%'>" + result[i].DeliveryPeriod + "</td>");
                        tr.append("<td width='12%'>" +
                            "<a href='#' class='view' id='ViewVendor_" + result[i].ID + "' title='View' data-toggle='tooltip'><i class='material-icons'>&#xE417;</i></a>" +
                            "<a href='#' id='EditVendor_" + result[i].ID + "' class='edit' title='Edit' data-toggle='modal'><i class='material-icons'>&#xE254;</i></a>" +
                            "<a href='#' id='DeleteVendor_" + result[i].ID + "' class='delete' title='Delete' data-toggle='modal'><i class='material-icons'>&#xE872;</i></a></td>");
                        $('#tblVendor').append(tr);
                    }
                }
            },
            error: function (data) {
                console.log(data);
            }
        });
}
