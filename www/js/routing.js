hideAll();
$(".appsWrapper").css("top","0vh");
localStorage.setItem("currentPage",".appsWrapper");
$("button[name='call']").on("click",function(){
  hideAll();
  $(".phoneCallWrapper").css("top","0vh");
  localStorage.setItem("lastPage",".appsWrapper");
  localStorage.setItem("currentPage",".phoneCallWrapper");
});
$("button[name='sms']").on("click",function(){
  hideAll();
  $(".smsWrapper").css("top","0vh");
  shrinkAll();
  localStorage.setItem("lastPage",".appsWrapper");
  localStorage.setItem("currentPage",".smsWrapper");
});
$("button[name='gallery']").on("click",function(){
  hideAll();
  $(".galleryWrapper").css("top","0vh");
  initializeGallery();
  localStorage.setItem("lastPage",".appsWrapper");
  localStorage.setItem("currentPage",".galleryWrapper");
});

function onBackKeyDown(){
  hideAll();
  growAll();
  $(".cursor").css({"width":"50px","height":"50px"});
  if(localStorage.getItem("currentPage") == ".imgWrapper")initializeGallery();
  $(localStorage.getItem("lastPage")).css("top","0vh");
  localStorage.setItem("currentPage",localStorage.getItem("lastPage"));
  localStorage.setItem("lastPage",".appsWrapper");
}
$(".fa-arrow-left").on("click",onBackKeyDown);
document.addEventListener("backbutton", onBackKeyDown , false);
function hideAll(){
  $(".appsWrapper").css("top","100vh");
  $(".phoneCallWrapper").css("top","100vh");
  $(".smsWrapper").css("top","100vh");
  $(".galleryWrapper").css("top","100vh");
}
function shrinkAll(){
  $(".cursor1").css({"width":"20px","height":"20px"});
  $(".cursor1").css({"fontSize":"20px"});
  $(".cursorShadow1").css({"width":"20px","height":"20px"});
  $(".cursor2").css({"width":"20px","height":"20px"});
  $(".cursor2").css({"fontSize":"20px"});
  $(".cursorShadow2").css({"width":"20px","height":"20px"});
}
function growAll(){
  $(".cursor1").css({"width":"50px","height":"50px"});
  $(".cursor1").css({"fontSize":"40px"});
  $(".cursorShadow1").css({"width":"50px","height":"50px"});
  $(".cursor2").css({"width":"50px","height":"50px"});
  $(".cursor2").css({"fontSize":"40px"});
  $(".cursorShadow2").css({"width":"50px","height":"50px"});
}
