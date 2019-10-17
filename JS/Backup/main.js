$(function () {
    //BEGIN MENU SIDEBAR
   $('.static-block').css('height', $(window).height() - 195);
  //$('#side-menu').metisMenu();

  $(window).bind("load resize", function () {
      if ($(this).width() < 768) {
          $('div.sidebar-collapse').addClass('collapse');
      } else {
          $('div.sidebar-collapse').removeClass('collapse');
          $('div.sidebar-collapse').css('height', 'auto');
      }
      if($('body').hasClass('sidebar-icons')){
          $('#menu-toggle').hide();
      } else{
          $('#menu-toggle').show();
      }
  });
  //END MENU SIDEBAR

  //BEGIN TOPBAR DROPDOWN
 // $('.dropdown-slimscroll').slimScroll({
 //     "height": '250px',
  //    "wheelStep": 5
 // });
  //END TOPBAR DROPDOWN

  //BEGIN CHECKBOX & RADIO
  //if($('#demo-checkbox-radio').length <= 0){
  //    $('input[type="checkbox"]:not(".switch")').iCheck({
   //       checkboxClass: 'icheckbox_minimal-grey',
  //        increaseArea: '20%' // optional
   //   });
   //   $('input[type="radio"]:not(".switch")').iCheck({
   //       radioClass: 'iradio_minimal-grey',
    //      increaseArea: '20%' // optional
    //  });
 // }
  //END CHECKBOX & RADIO

  //BEGIN TOOTLIP
  $("[data-toggle='tooltip'], [data-hover='tooltip']").tooltip();
  //END TOOLTIP

  //BEGIN POPOVER
  $("[data-toggle='popover'], [data-hover='popover']").popover();
  //END POPOVER

  //BEGIN THEME SETTING
  $('#theme-setting > a.btn-theme-setting').click(function(){
      if($('#theme-setting').css('right') < '0'){
          $('#theme-setting').css('right', '0');
      } else {
          $('#theme-setting').css('right', '-250px');
      }
  });

  // Begin Change Theme Color
  var list_style = $('#theme-setting > .content-theme-setting > select#list-style');
  var list_color = $('#theme-setting > .content-theme-setting > ul#list-color > li');
  // FUNCTION CHANGE URL STYLE ON HEAD TAG
  var setTheme = function (style, color) {
      $.cookie('style',style);
      $.cookie('color',color);
      $('#theme-change').attr('href', 'css/themes/'+ style + '/' + color + '.css');
  }
  // INITIALIZE THEME FROM COOKIE
  // HAVE TO SET VALUE FOR STYLE&COLOR BEFORE AND AFTER ACTIVE THEME
  //if ($.cookie('style')) {
   //   list_style.find('option').each(function(){
    //      if($(this).attr('value') == $.cookie('style')) {
   //           $(this).attr('selected', 'selected');
   //       }
    //  });
   //   list_color.removeClass("active");
   //   list_color.each(function(){
   //       if($(this).attr('data-color') == $.cookie('color')){
   //           $(this).addClass('active');
   //       }
  //    });
 //     setTheme($.cookie('style'), $.cookie('color'));
//  };
  // SELECT EVENT
  list_style.on('change', function() {
      list_color.each(function() {
          if($(this).hasClass('active')){
              color_active  = $(this).attr('data-color');
          }
      });
      setTheme($(this).val(), color_active);
  });
  // LI CLICK EVENT
  list_color.on('click', function() {
      list_color.removeClass('active');
      $(this).addClass('active');
      setTheme(list_style.val(), $(this).attr('data-color'));
  });
  // End Change Theme Color
  //END THEME SETTING

  //BEGIN FULL SCREEN
  $('.btn-fullscreen').click(function() {

      if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
          if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
              document.documentElement.msRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
              document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
      } else {
          if (document.exitFullscreen) {
              document.exitFullscreen();
          } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
          }
      }
  });
  //END FULL SCREEN

  // BEGIN FORM CHAT
  $('.btn-chat').click(function () {
      if($('#chat-box').is(':visible')){
          $('#chat-form').toggle('slide', {
              direction: 'right'
          }, 500);
          $('#chat-box').hide();
      } else{
          $('#chat-form').toggle('slide', {
              direction: 'right'
          }, 500);
      }
  });
  $('.chat-box-close').click(function(){
      $('#chat-box').hide();
      $('#chat-form .chat-group a').removeClass('active');
  });
  $('.chat-form-close').click(function(){
      $('#chat-form').toggle('slide', {
          direction: 'right'
      }, 500);
      $('#chat-box').hide();
  });

  $('#chat-form .chat-group a').unbind('*').click(function(){
      $('#chat-box').hide();
      $('#chat-form .chat-group a').removeClass('active');
      $(this).addClass('active');
      var strUserName = $('> small', this).text();
      $('.display-name', '#chat-box').html(strUserName);
      var userStatus = $(this).find('span.user-status').attr('class');
      $('#chat-box > .chat-box-header > span.user-status').removeClass().addClass(userStatus);
      var chatBoxStatus = $('span.user-status', '#chat-box');
      var chatBoxStatusShow = $('#chat-box > .chat-box-header > small');
      if(chatBoxStatus.hasClass('is-online')){
          chatBoxStatusShow.html('Online');
      } else if(chatBoxStatus.hasClass('is-offline')){
          chatBoxStatusShow.html('Offline');
      } else if(chatBoxStatus.hasClass('is-busy')){
          chatBoxStatusShow.html('Busy');
      } else if(chatBoxStatus.hasClass('is-idle')){
          chatBoxStatusShow.html('Idle');
      }


      var offset = $(this).offset();
      var h_main = $('#chat-form').height();
      var h_title = $("#chat-box > .chat-box-header").height();
      var top = ($('#chat-box').is(':visible') ? (offset.top - h_title - 40) : (offset.top + h_title - 20));

      if((top + $('#chat-box').height()) > h_main){
          top = h_main - 	$('#chat-box').height();
      }

      $('#chat-box').css({'top': top});

      if(!$('#chat-box').is(':visible')){
          $('#chat-box').toggle('slide',{
              direction: 'right'
          }, 500);
      }
      // FOCUS INPUT TExT WHEN CLICK
      $('ul.chat-box-body').scrollTop(500);
      $("#chat-box .chat-textarea input").focus();
  });
  // Add content to form
  $('.chat-textarea input').on("keypress", function(e){

      var $obj = $(this);
      var $me = $obj.parent().parent().find('ul.chat-box-body');
      var $my_avt = 'https://s3.amazonaws.com/uifaces/faces/twitter/kolage/128.jpg';
      var $your_avt = 'https://s3.amazonaws.com/uifaces/faces/twitter/alagoon/48.jpg';
      if (e.which == 13) {
          var $content = $obj.val();

          if ($content !== "") {
              var d = new Date();
              var h = d.getHours();
              var m = d.getMinutes();
              if (m < 10) m = "0" + m;
              $obj.val(""); // CLEAR TEXT ON TEXTAREA

              var $element = ""; 
              $element += "<li>";
              $element += "<p>";
              $element += "<img class='avt' src='"+$my_avt+"'>";
              $element += "<span class='user'>John Doe</span>";
              $element += "<span class='time'>" + h + ":" + m + "</span>";
              $element += "</p>";
              $element = $element + "<p>" + $content +  "</p>";
              $element += "</li>";
              
              $me.append($element);
              var height = 0;
              $me.find('li').each(function(i, value){
                  height += parseInt($(this).height());
              });

              height += '';
              //alert(height);
              $me.scrollTop(height);  // add more 400px for #chat-box position      

              // RANDOM RESPOND CHAT

              var $res = "";
              $res += "<li class='odd'>";
              $res += "<p>";
              $res += "<img class='avt' src='"+$your_avt+"'>";
              $res += "<span class='user'>Swlabs</span>";
              $res += "<span class='time'>" + h + ":" + m + "</span>";
              $res += "</p>";
              $res = $res + "<p>" + "Yep! It's so funny :)" + "</p>";
              $res += "</li>";
              setTimeout(function(){
                  $me.append($res);
                  $me.scrollTop(height+100); // add more 500px for #chat-box position             
              }, 1000);
          }
      }
  });
  // END FORM CHAT

  //BEGIN PORTLET
  $(".portlet").each(function(index, element) {
      var me = $(this);
      $(">.portlet-header>.tools>i", me).click(function(e){
          if($(this).hasClass('fa-chevron-up')){
              $(">.portlet-body", me).slideUp('fast');
              $(this).removeClass('fa-chevron-up').addClass('fa-chevron-down');
          }
          else if($(this).hasClass('fa-chevron-down')){
              $(">.portlet-body", me).slideDown('fast');
              $(this).removeClass('fa-chevron-down').addClass('fa-chevron-up');
          }
          else if($(this).hasClass('fa-cog')){
              //Show modal
          }
          else if($(this).hasClass('fa-refresh')){
              //$(">.portlet-body", me).hide();
              $(">.portlet-body", me).addClass('wait');

              setTimeout(function(){
                  //$(">.portlet-body>div", me).show();
                  $(">.portlet-body", me).removeClass('wait');
              }, 1000);
          }
          else if($(this).hasClass('fa-times')){
              me.remove();
          }
      });
  });
  //END PORTLET

  //BEGIN BACK TO TOP
  $(window).scroll(function(){
      if ($(this).scrollTop() < 200) {
          $('#totop') .fadeOut();
      } else {
          $('#totop') .fadeIn();
      }
  });
  $('#totop').on('click', function(){
      $('html, body').animate({scrollTop:0}, 'fast');
      return false;
  });
  //END BACK TO TOP

  //BEGIN CHECKBOX TABLE
  $('.checkall').on('ifChecked ifUnchecked', function(event) {
      if (event.type == 'ifChecked') {
          $(this).closest('table').find('input[type=checkbox]').iCheck('check');
      } else {
          $(this).closest('table').find('input[type=checkbox]').iCheck('uncheck');
      }
  });
  //END CHECKBOX TABLE

  //BEGIN JQUERY NEWS UPDATE
  //$('#news-update').ticker({
  //    controls: false,
   //   titleText: ''
  //});
  //END JQUERY NEWS UPDATE

  $('.option-demo').hover(function() {
      $(this).append("<div class='demo-layout animated fadeInUp'><i class='fa fa-magic mrs'></i>Demo</div>");
  }, function() {
      $('.demo-layout').remove();
  });
  $('#header-topbar-page .demo-layout').live('click', function() {
      var HtmlOption = $(this).parent().detach();
      $('#header-topbar-option-demo').html(HtmlOption).addClass('animated flash').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          $(this).removeClass('animated flash');
      });
      $('#header-topbar-option-demo').find('.demo-layout').remove();
      return false;
  });
  $('#title-breadcrumb-page .demo-layout').live('click', function() {
      var HtmlOption = $(this).parent().html();
      $('#title-breadcrumb-option-demo').html(HtmlOption).addClass('animated flash').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          $(this).removeClass('animated flash');
      });
      $('#title-breadcrumb-option-demo').find('.demo-layout').remove();
      return false;
  });
  // CALL FUNCTION RESPONSIVE TABS
 // fakewaffle.responsiveTabs(['xs', 'sm']);
});

$(document).ready(function(){
  //$.cookie('animations','bounce');
  $('#change-transitions button').click(function() {
      //$("body").removeClass($.cookie('animations'));
      var ani = $(this).attr('data-value');
      $("body").addClass("animated " + ani);
      //$.cookie('animations', ani);
  });
});
$(document).ready(function () { 
    
  if (window.location.href.indexOf("_layouts/15/Upload.aspx") > -1 ) {
    // Hide the Destination Library row
       $("#ctl00_PlaceHolderMain_ctl04").hide();

  }
   if (window.location.href.indexOf("EditForm.aspx?Mode=Upload") > -1 ) {
    // Edit Property Cancel Button - Delete item when cancel 
    // First Time only
      $("input[id*='diidIOGoBack']").attr("onclick",$("a[id*='diidIODeleteItem']").attr("href"));
  }

  $(".ms-listlink").each(function(){ $(this).attr("onclick", $(this).attr("onclick").replace("&View","&View1"));});
  $(".ms-vb-icon a").each(function(){ $(this).attr("onclick", $(this).attr("onclick").replace("&View","&View1"));});
  
     
});

function makeLink()
{
$('.ms-listviewtable').find('tr').each(function(){
var tempString = $(this).find('td:first').text();
if(tempString.indexOf('itemidlink') != -1)
{
$(this).find('td:first').html($(this).find('td:first').text());
}

});
}

function detectBrowser(){
  var ua= navigator.userAgent, tem,
  M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
      tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE '+(tem[1] || '');
  }
  if(M[1]=== 'Safari'){
      tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
      if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
  return M.join(' ');
}

//// Add item id in calculated link column start
$(document).ready(function () {
makeLink();
$('.ms-commandLink').click(function(){
makeLink();
});
  GetItemidlink();
  var overrideCtx = {};

   overrideCtx.OnPostRender = [];
   overrideCtx.OnPostRender.push(function()
   {
       GetItemidlink();

   });
 // SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
});

function GetItemidlink()
{
$(".itemidlink").on("click", function(){
           var urlhref = $(this).attr("href") + $(this).parents("TR:first").attr("id").split(',')[1];
           urlhref  = urlhref.substring(0,urlhref.lastIndexOf("=") + 1); 
           urlhref  = urlhref   + $(this).parents("TR:first").attr("id").split(',')[1];
            $(this).attr("href", urlhref  );
        });
}
//// Add item id in calculated link column end



function ChangePageTitle(message) {
  if(message != '')
  {
  window.document.title = message.trim();
  }
}

window.addEventListener('message', function(e) {
                  try{					 var data = e.data;      
                      if (typeof(window[data.func]) == "function") {
                              window[data.func].call(null, data.message);
                              return;
                      }
                      }catch(e1){}
                      
                  if (e.data.length > 100)
                      return;

                  var regex = RegExp(/(<\s*[Mm]essage\s+[Ss]ender[Ii]d\s*=\s*([\dAaBbCcDdEdFf]{8})(\d{1,3})\s*>[Rr]esize\s*\(\s*(\s*(\d*)\s*([^,\)\s\d]*)\s*,\s*(\d*)\s*([^,\)\s\d]*))?\s*\)\s*<\/\s*[Mm]essage\s*>)/);
                  var results = regex.exec(e.data);
                  if (results != null)
                      {

                          var senderIndex = results[3];
                          if (senderIndex >= spAppIFrameSenderInfo.length)
                              return;
      
                          var senderId = results[2] + senderIndex;
                          var iframeId = unescape(spAppIFrameSenderInfo[senderIndex][1]);
                          var senderOrigin = unescape(spAppIFrameSenderInfo[senderIndex][2]);
                          if (senderId != spAppIFrameSenderInfo[senderIndex][0] || senderOrigin != e.origin)
                              return;
      
                          var width = results[5];
                          var height = results[7];
                          if (width == "")
                          {
                              width = '300px';
                          }
                          else
                          {
                              var widthUnit = results[6];
                              if (widthUnit == "")
                                  widthUnit = 'px';
                          
                              width = width + widthUnit;
                          }
                          
                          if (height == "")
                          {
                              height = '150px';
                          }
                          else
                          {
                              var heightUnit = results[8];                        
                              if (heightUnit == "")
                                  heightUnit = 'px';
      
                              height = height + heightUnit;
                              height = ($(".iframe-section").height() )+ heightUnit;
                              
                                  ////-20;//$(window).height() - $(".topbar-main").height() -30
                                  // $(".iframe-section").height(height+30);
                               //$("#sidebar").height(height);

                          }
                          
                          var widthCssText = "";
                          var resizeWidth = ('False' == spAppIFrameSenderInfo[senderIndex][3]);
                          if (resizeWidth)
                          {
                              widthCssText = 'width:' + width + ' !important;';
                          }
                          
                          var cssText = widthCssText;
                          var resizeHeight = ('False' == spAppIFrameSenderInfo[senderIndex][4]);
                          if (resizeHeight)
                          {
                          var deviceAgent = navigator.userAgent.toLowerCase();
  var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
  if (agentID)
  {
  //cssText += 'height:100% !important';
  }
  else
  {
                              cssText += 'height:' + height + ' !important';
                              }
                          }
                              
                          if (cssText != "")
                          {
                              var webPartInnermostDivId = spAppIFrameSenderInfo[senderIndex][5];
                              if (webPartInnermostDivId != "")
                              {
                                  var webPartDivId = 'WebPart' + webPartInnermostDivId;
      
                                  var webPartDiv = document.getElementById(webPartDivId);
                                  if (null != webPartDiv)
                                  {
                                      webPartDiv.style.cssText = cssText;
                                  }
                                  
                                  cssText = "";
                                  if (resizeWidth)
                                  {
                                      var webPartChromeTitle = document.getElementById(webPartDivId + '_ChromeTitle');
                                      if (null != webPartChromeTitle)
                                      {
                                          webPartChromeTitle.style.cssText = widthCssText;
                                      }
                                      
                                      cssText = 'width:100% !important;'
                                  }
      
                                  if (resizeHeight)
                                  {

                                      //cssText += 'height:100% !important';
                                      var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
  if (agentID)
  {
      //cssText += 'height:100% !important';
  }
  else
  {

                                      cssText += 'height:' + height + ' !important';
                                      }

                                  }
                                  
                                  var webPartInnermostDiv = document.getElementById(webPartInnermostDivId);
                                  if (null != webPartInnermostDiv)
                                  {
                                     webPartInnermostDiv.style.cssText = cssText;
                                  }
                              }
      
                              var iframe = document.getElementById(iframeId);
                              if (null != iframe)
                              {
                                 iframe.style.cssText = cssText;
                              }
                          }
                  }
                  else
                  {
                    
                      if(e.data!='verify' && e.data.indexOf('command') < 0){
                          if(getQueryStringParameterByName("Source") === undefined || getQueryStringParameterByName("Source") === ""){
                              window.location=e.data;			
                          }
                      else{
                          window.location=getQueryStringParameterByName("Source");
                          }
                      }
  }
  });
