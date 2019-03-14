var masterlistNameArray = [];

//#region Core Logic

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
    }
}

//#endregion

//#region Custom Logic
/*Pooja Atkotiya */
function GetApproverMaster(handleData) {
    AjaxCall(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + ListNames.APPROVERMASTERLIST + "')/items?$select=*,Department/Title,Function/Title,Location/Title&$expand=Department/Title,Function/Title,Location/Title",
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
                handleData(data.d.results);
            }
        });
}

//#endregion