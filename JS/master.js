var masterlistNameArray = [];

function GetAllMasterData() {
    $('input[listtype*=master],select[listtype*=master]').each(function () {
        var listType = $(this).attr('listtype');
        var listname = $(this).attr('listname');
        if (masterlistNameArray.indexOf(listname) < 0) {
            masterlistNameArray.push(listname);
        }
    });
    if (masterlistNameArray != null && masterlistNameArray.length > 0) {
        $(masterlistNameArray).each(function (i, e) {
            GetMasterData(masterlistNameArray[i]);
        });
    }
}

function GetMasterData(masterlistname) {
    masterDataArray = null;
    if (!IsNullOrUndefined(masterlistname) && masterlistname != '') {
        AjaxCall(
            {
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + masterlistname + "')/items",
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
                    if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d) && !IsNullOrUndefined(data.d.results)) {
                        var result = data.d.results;
                        masterDataArray = result;
                        $('input[listname*=' + masterlistname + '],select[listname*=' + masterlistname + ']').each(function () {
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
                                case "listbox":
                                    break;
                            }
                        });
                        return masterDataArray;
                    }
                }
            });

        // $.ajax
        //     ({
        //         url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + masterlistname + "')/items",
        //         type: "GET",
        //         async: false,
        //         headers:
        //             {
        //                 "Accept": "application/json;odata=verbose",
        //                 "Content-Type": "application/json;odata=verbose",
        //                 "X-RequestDigest": $("#__REQUESTDIGEST").val()
        //             },
        //         success: function (data) {
        //             if (!IsNullOrUndefined(data) && !IsNullOrUndefined(data.d) && !IsNullOrUndefined(data.d.results)) {
        //                 var result = data.d.results;
        //                 masterDataArray = result;
        //                 $('input[listname*=' + masterlistname + '],select[listname*=' + masterlistname + ']').each(function () {
        //                     var elementId = $(this).attr('id');
        //                     var elementType = $(this).attr('controlType');
        //                     var valueBindingColumn = $(this).attr('valuebindingcolumn');
        //                     var textBindingColumnn = $(this).attr('textbindingcolumnn');
        //                     switch (elementType) {
        //                         case "combo":
        //                             $("#" + elementId).html('');
        //                             $("#" + elementId).html("<option value=''>Select</option>");
        //                             if (!IsNullOrUndefined(valueBindingColumn) && !IsNullOrUndefined(textBindingColumnn) && valueBindingColumn != '' && textBindingColumnn != '') {
        //                                 $(result).each(function (i, e) {
        //                                     var cmditem = result[i];
        //                                     var opt = $("<option/>");
        //                                     opt.text(cmditem[textBindingColumnn]);
        //                                     opt.attr("value", cmditem[valueBindingColumn]);
        //                                     opt.appendTo($("#" + elementId));
        //                                 });
        //                             }
        //                             break;
        //                         case "listbox":
        //                             break;
        //                     }
        //                 });
        //                 return masterDataArray;
        //             }
        //         },
        //         error: function (data) {
        //             console.log($("#" + elementId).html(data.responseJSON.error));
        //         }
        //     });
    }
    else {
        console.log("Master List Name is undefined.");
    }
}

// function OnGetDataSucceeded(filterBy,filterValue,textBindingColumnn,valueBindingColumn) {
//     var listItemInfo = [];

//     var listItemEnumerator = collListItem.getEnumerator();

//     while (listItemEnumerator.moveNext()) {
//         var oListItem = listItemEnumerator.get_current();

//         listItemInfo.push({ filterBy: oListItem.get_item(filterBy), valueBindingColumn: oListItem.get_item(valueBindingColumn), textBindingColumnn: oListItem.get_item(textBindingColumnn) });
//     }

//     if (!IsNullOrUndefined(listItemInfo) && listItemInfo.length > 0) {
//         console.log(listItemInfo);
//     }
// }

// function OnGetDataFailed() { alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace()); }