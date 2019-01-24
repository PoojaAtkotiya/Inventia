var tranlistNameArray = [];
var tranListData = {};
var localApprovalMatrix;

function GetTranListData(lookupId) {
    TranListData(lookupId);
    if (tranlistNameArray != null && tranlistNameArray.length > 0) {
        $(tranlistNameArray).each(function (i, e) {
            GetTranData(tranlistNameArray[i], lookupId);
        });
    }
}

function TranListData(lookupId) {
    tranlistNameArray = [];
    $('input[listtype*=tran],select[listtype*=tran],radio[listtype*=tran],textarea[listtype*=tran]').each(function () {
        var listType = $(this).attr('listtype');
        var listname = $(this).attr('listname');
        if (tranlistNameArray.indexOf(listname) < 0) {
            tranlistNameArray.push(listname);
        }
    });

}

function GetTranData(tranlistname, lookupId) {
    if (tranlistname != undefined && tranlistname != '' && tranlistname != null) {
        AjaxCall(
            {
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + tranlistname + "')/items?$select=Author/Title,*&$expand=Author&$filter=RequestID eq '" + lookupId + "'",
                httpmethod: 'GET',
                calldatatype: 'JSON',
                isAsync: false,
                headers:
                    {
                        "Accept": "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                sucesscallbackfunction: function (data) {
                    var item = data.d.results[0];
                    if (item != null && item != '' & item != undefined) {
                        $('input[listname*=' + tranlistname + '],select[listname*=' + tranlistname + '],radio[listname*=' + tranlistname + '],textarea[listname*=' + tranlistname + ']').each(function () {
                            var elementId = $(this).attr('id');
                            var elementType = $(this).attr('controlType');

                            setFieldValue(elementId, item, elementType, elementId);
                        });
                    }
                }
            });
        // $.ajax({
        //     url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + tranlistname + "')/items?$select=Author/Title,*&$expand=Author&$filter=RequestID eq '" + lookupId + "'",
        //     type: "GET",
        //     async: false,
        //     headers:
        //         {
        //             "Accept": "application/json;odata=verbose",
        //             "Content-Type": "application/json;odata=verbose",
        //             "X-RequestDigest": $("#__REQUESTDIGEST").val()
        //         },
        //     success: function (data) {
        //         var item = data.d.results[0];
        //         if (item != null && item != '' & item != undefined) {
        //             $('input[listname*=' + tranlistname + '],select[listname*=' + tranlistname + '],radio[listname*=' + tranlistname + '],textarea[listname*=' + tranlistname + ']').each(function () {
        //                 var elementId = $(this).attr('id');
        //                 var elementType = $(this).attr('controlType');

        //                 setFieldValue(elementId, item, elementType, elementId);
        //             });
        //         }
        //         // if (tranlistname == "ItemCodeApprovalMatrix") {
        //         //     localApprovalMatrix = data;
        //         //     if (listItemId > 0 && localApprovalMatrix != null && localApprovalMatrix != undefined && localApprovalMatrix.d.results.length > 0) {
        //         //         localApprovalMatrix.d.results.filter(function (i) {
        //         //             if (i.Status == "Pending" && i.ApproverId.results.indexOf(this.currentUser.Id) >= 0) {
        //         //                 activeSectionName = i.SectionName;
        //         //                 activeSectionName = activeSectionName.replace(/ /g, '').trim().toUpperCase();
        //         //                 $("#" + activeSectionName).removeClass("disabled");
        //         //                 $("div .disabled .form-control").attr("disabled", "disabled");
        //         //             }
        //         //         });
        //         //     }
        //         // }
        //     }
        // });
    }
}


function SaveTranListData(lookupId) {
    TranListData(lookupId);
    tranListData = {};
    if (tranlistNameArray != null && tranlistNameArray.length > 0) {
        $(tranlistNameArray).each(function (i, e) {
            SetTranDataValues(tranlistNameArray[i], lookupId);
        });
    }
}
function SetTranDataValues(tranlistname, lookupId) {
    if (tranlistname != ListNames.APPROVALMATRIXLIST)    ////avoid for localapprovalmatrix
    {
        if (tranlistname != undefined && tranlistname != '' && tranlistname != null) {
            $('input[listname*=' + tranlistname + '],select[listname*=' + tranlistname + '],radio[listname*=' + tranlistname + '],textarea[listname*=' + tranlistname + ']').each(function () {
                var elementId = $(this).attr('id');
                var elementType = $(this).attr('controlType');
                tranListData = GetFormControlsValue(elementId, elementType, tranListData);
            });
            SaveTranData(tranlistname, tranListData, lookupId);
        }
    }
}

function SaveTranData(listname, tranListDataArray, lookupId) {
    var itemType = GetItemTypeForListName(listname);
    if (tranListDataArray != null) {
        tranListDataArray["__metadata"] = {
            "type": itemType
        };

        if (listname != undefined && listname != '' && listname != null) {
            AjaxCall({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items?$select=Author/Title,*&$expand=Author&$filter=RequestID eq '" + lookupId + "'",
                httpmethod: 'GET',
                isAsync: false,
                calldatatype: 'JSON',
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                sucesscallbackfunction: function (data) {
                    var item = data.d.results[0];
                    if (item != null && item != '' & item != undefined) {
                        tranListDataArray.ID = item.ID;
                    }
                }
            });

            // $.ajax({
            //     url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items?$select=Author/Title,*&$expand=Author&$filter=RequestID eq '" + lookupId + "'",
            //     type: "GET",
            //     async: false,
            //     headers:
            //         {
            //             "Accept": "application/json;odata=verbose",
            //             "Content-Type": "application/json;odata=verbose",
            //             "X-RequestDigest": $("#__REQUESTDIGEST").val()
            //         },
            //     success: function (data) {
            //         var item = data.d.results[0];
            //         if (item != null && item != '' & item != undefined) {
            //             tranListDataArray.ID = item.ID;
            //         }
            //         //   cancel();
            //     }
            // });
        }

        //  tranListDataArray.ID = IsTranDataExists(listname, lookupId);

        var url = '', headers = '';
        if (tranListDataArray.ID == null || tranListDataArray.ID == '' || tranListDataArray.ID == undefined) {
            tranListDataArray.ID = 0;
            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
            headers = { "Accept": "application/json;odata=verbose", "X-RequestDigest": $("#__REQUESTDIGEST").val() };
        }
        else {
            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listname + "')/items(" + tranListDataArray.ID + ")";
            headers = { "Accept": "application/json;odata=verbose", "X-RequestDigest": $("#__REQUESTDIGEST").val(), "IF-MATCH": "*", "X-HTTP-Method": "MERGE" };
        }
        tranListDataArray.RequestIDId = parseInt(lookupId);
        console.log(tranListDataArray);

        AjaxCall({
            url: url,
            httpmethod: 'POST',
            postData: JSON.stringify(tranListDataArray),
            calldatatype: 'JSON',
            contentType: 'application/json; charset=utf-8',
            headers: headers,
            sucesscallbackfunction: function (data) {
                console.log("Data saved successfully in tran list.");
            }
        });

        // $.ajax({
        //     url: url,
        //     type: "POST",
        //     contentType: "application/json;odata=verbose",
        //     data: JSON.stringify(tranListDataArray),
        //     headers: headers,
        //     success: function (data) {
        //         console.log("Data saved successfully in tran list.");
        //     },
        //     error: function (data) {
        //         console.log(data);
        //     }
        // });
    }
}
