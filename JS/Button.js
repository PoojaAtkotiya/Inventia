var allButtons;
var formStatus;
var currentRoleButtons = [];

function GetButtons(id, currentUserRole, formStatus) {
    //GetFormDigest().then(function (data) {
    AjaxCall(
        {
            url: CommonConstant.ROOTURL + "/_api/web/lists/getbytitle('" + ListNames.BUTTONLIST + "')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><Query><Where><And><Eq><FieldRef Name='ApplicationName' /><Value Type='TaxonomyFieldType'>" + CommonConstant.APPLICATIONNAME + "</Value></Eq><Eq><FieldRef Name='FormName' /><Value Type='Text'>" + CommonConstant.FORMNAME + "</Value></Eq></And></Where></Query></View>\"}",
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
                allButtons = data.d.results;
                GetButtonsByRole(id, currentUserRole, formStatus);
            }
        });
    //});
}
function GetButtonsByRole(id, currentUserRole, formStatus) {
    var btnli = "";
    var buttonCount = 1;

    // if (id > 0 && id != null) {
    //     formStatus = mainListData.Status
    // }
    // else {
    //     formStatus = "New";
    // }

    currentRoleButtons = [];
    for (i = 0; i <= allButtons.length - 1; i++) {
        var formName = !IsNullOrUndefined(allButtons[i].FormName.Label) ? allButtons[i].FormName.Label : allButtons[i].FormName.results[0].Label;
        if (!IsNullOrUndefined(formName)) {
            if (formName == CommonConstant.FORMNAME && allButtons[i].Role.includes(currentUserRole) && allButtons[i].FormStatus.includes(formStatus)) {
                currentRoleButtons.push(allButtons[i]);
            }
        }
    }

    for (i = 0; i <= currentRoleButtons.length - 1; i++) {
        var jsFuncName = Object.keys(JsFunctionValue).find(k => JsFunctionValue[k] === currentRoleButtons[i].JsFunctionNameId);
        var jsFunc = "onClick=" + jsFuncName + "(this);";
        var dataactionid = ButtonActionStatus[Object.keys(ButtonActionStatus).find(k => ButtonActionStatus[k] === currentRoleButtons[i].ButtonActionValueId)];
        var status = Object.keys(ButtonActionStatus).find(k => ButtonActionStatus[k] === currentRoleButtons[i].ButtonActionValueId);
        var isVisible = currentRoleButtons[i].IsVisible ? "" : "class=hide";
        btnli = btnli + '<li class="pull-left"><a id="btn' + (buttonCount++) + '" ' + isVisible + ' onClick="' + CommonConstant.APPLICATIONSHORTNAME + '_SaveData(this);"' + ' data-action="' + dataactionid + '" data-sendbackto="' + currentRoleButtons[i].SendBackTo + '" data-sendtorole="' + currentRoleButtons[i].SendToRole + '" class="btn btn-default pull-right" title="' + currentRoleButtons[i].ToolTip + '" data-placement="bottom"><i class="' + currentRoleButtons[i].Icon + '"></i>&nbsp;' + currentRoleButtons[i].Title + '</a></li>'
    }


    btnli = btnli + '<li class="pull-left"><a id="btnExit" class="btn btn-default pull-right" onclick="Exit(this);" title="Exit without saving any data"  data-placement="bottom"><i class="fa fa-sign-out"></i>&nbsp;Home</a></li>';

    $('#dynamicButtonli').html(btnli);
    HideWaitDialog();
}

