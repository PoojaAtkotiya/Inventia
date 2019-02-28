var tranlistNameArray = [];
var tranListData = {};
var localApprovalMatrix;
var tranlists = [];

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
                async: false,
                headers:
                    {
                        "Accept": "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                sucesscallbackfunction: function (data) {
                    var item = data.d.results[0];
                    if (item != null && item != '' & item != undefined) {
                        $('input[listname*=' + tranlistname + '],select[listname*=' + tranlistname + '],radio[listname*=' + tranlistname + '],textarea[listname*=' + tranlistname + '],checkbox[listname*=' + tranlistname + ']').each(function () {
                            var elementId = $(this).attr('id');
                            var fieldName = $(this).attr('id');
                            var elementType = $(this).attr('controlType');
                            if (elementType == 'multicheckbox')
                                fieldName = $(this).attr("cParent");
                            else if (elementType == 'radiogroup')
                                fieldName = $(this).attr("cParent");
                            else if (elementType == 'checkbox')
                                fieldName = $("#" + elementId)[0].checked;
                            //  $("#" + elementId)[0].checked = item[fieldName];
                            setFieldValue(elementId, item, elementType, fieldName);
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
                tranListData = GetFormControlsValue(elementId, elementType, tranListData, elementvaluetype);
                //saveDataArray = GetFormControlsValue(elementId, elementType, saveDataArray,elementvaluetype);
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
                async: false,
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
            async: false,
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

//#region Get Tran Lists
/*Pooja Atkotiya */
function GetAllTranlists(lookupId) {
    $('div [type=tranTable]').each(function () {
        var tranArrayName = $(this).attr('tranArrayName');
        var listname = $(this).attr('listname');
        var jsFunction = $(this).attr('jsFunction');
        if (!IsNullOrUndefined(tranlists) && tranlists.indexOf(listname) < 0) {
            tranlists.push({ "ListName": listname, "TranArrayName": tranArrayName, "JSFunction": jsFunction });
        }
    });

    if (tranlists != null && tranlists.length > 0) {
        tranlists.forEach(function (tranList) {
            GetTranList(tranList, lookupId);
        });
    }
}

/*Pooja Atkotiya */
function GetTranList(tranList, lookupId) {
    var listName = tranList["ListName"];
    var tranArrayName = tranList["TranArrayName"];
    var jsFunction = tranList["JSFunction"];
    // and (Status Ne '" + ItemActionStatus.DELETED + "')
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?$select=*&$filter=((RequestIDId eq " + lookupId + ") and (Status ne '" + ItemActionStatus.DELETED + "'))",
            httpmethod: 'GET',
            calldatatype: 'JSON',
            async: false,
            sucesscallbackfunction: function (data) {
                if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.value) && IsArray(data.value) && data.value.length > 0) {
                    var indexCount = 1;
                    (data.value).forEach(item => {
                        item.Status = ItemActionStatus.NOCHANGE;
                        item.Index = indexCount;
                        indexCount++;
                        window[tranArrayName].push(item);////here tranarrayName should be global variable
                    });

                    ////load tran js's document.ready function
                    window[jsFunction](window[tranArrayName]); // window["functionName"](arguments);
                }
            }
        });
}

//#endregion


//#region Save Trans in List
/*Pooja Atkotiya */
function SaveAllTrans(requestId) {
    if (!IsNullOrUndefined(gTranArray) && gTranArray.length > 0) {
        ////REmove all rows which have status NOCHANGE
        gTranArray.forEach(element => {
            var tranList = element.TranListArray;
            var tranListName = element.TranListName;
            if (!IsNullOrUndefined(tranList) && tranList.length > 0) {
                tranList.forEach(tranItem => {
                    // var tranListName = tranItem.ListName;
                    var status = tranItem.Status;
                    var id = tranItem.ID;
                    var url = '';
                    var headers;

                    switch (status) {
                        case ItemActionStatus.NEW:
                            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + tranListName + "')/items";
                            headers = {
                                "Accept": "application/json;odata=verbose",
                                "Content-Type": "application/json;odata=verbose",
                                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                "X-HTTP-Method": "POST"
                            };
                            tranItem["RequestById"] = currentUser.Id;
                            tranItem["RequestDate"] = new Date().format("yyyy-MM-ddTHH:mm:ssZ");
                            delete tranItem.ID;   ////removed ID when item is new
                            break;
                        case ItemActionStatus.DELETED:
                            if (id > 0) {
                                url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + tranListName + "')/items(" + id + ")";
                                headers = {
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                    "IF-MATCH": "*",
                                    "X-HTTP-Method": "DELETE"
                                };
                            }
                            break;
                        case ItemActionStatus.UPDATED:
                            url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + tranListName + "')/items(" + id + ")";
                            headers = {
                                "Accept": "application/json;odata=verbose",
                                "Content-Type": "application/json;odata=verbose",
                                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                "IF-MATCH": "*",
                                "X-HTTP-Method": "MERGE"
                            };
                            break;
                        case ItemActionStatus.NOCHANGE:
                            break;
                        default:
                            break;
                    }

                    //Column which not to be saved/not column in list are removed 
                    delete tranItem.Type;
                    delete tranItem.Index;
                    // delete tranItem.ListName;

                    tranItem["__metadata"] = {
                        "type": GetItemTypeForListName(tranListName)
                    };
                    tranItem["RequestIDId"] = requestId;

                    if (!IsStrNullOrEmpty(url) && !IsNullOrUndefined(headers)) {
                        AjaxCall(
                            {
                                url: url,
                                httpmethod: 'POST',
                                calldatatype: 'JSON',
                                headers: headers,
                                async: false,
                                postData: JSON.stringify(tranItem),
                                sucesscallbackfunction: function (data) {
                                    // console.log("SaveAllTrans - Item saved Successfully for ID = " + data.d.ID);
                                },
                                error: function (jQxhr, errorCode, errorThrown) {
                                    console.log(errorThrown);
                                }
                            });
                    }
                });
            }
        });
    }
}
//#endregion