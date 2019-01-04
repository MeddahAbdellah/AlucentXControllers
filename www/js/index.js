$(".phoneCallWrapper").css("top","100vh");
$(".lockScreen").hide();
$(document).on('deviceready', function() {
  //startTime();
  navigator.splashscreen.show();
  window.setTimeout(function () {
      navigator.splashscreen.hide();
  }, 10000);
  console.log('cordova.plugins.CordovaCall is now available');
  window.plugins.speechRecognition.requestPermission(function(){},function(){});
  sms.requestPermission(function() {
    console.log('[OK] Permission accepted');
    $("button[name='sendSms']").on("click",function(){
      sms.send($("input[name='phoneSmsInput']").val().toString(), $("input[name='smsInput']").val(), smsOptions, function(){
        $(".texts").append("<div class='messageSent'><hgroup class='speech-bubble'><p>"+$("input[name='smsInput']").val()+"</p></hgroup></div>");
        $("input[name='smsInput']").val("")
        $(".texts").animate({scrollTop:$(".texts").prop("scrollHeight")});
      }, function(error){alert("sms not sent " + error);});
    });
}, function(error) {
    console.info('[WARN] Permission not accepted')
    // Handle permission not accepted
});
  var cordovaCall = cordova.plugins.CordovaCall;
  if(ble===undefined)alert("BLE is not available on this device");
  ble.enable(function(){
    //alert('BLE enabled');
  }, function(){
    //alert("Couldn't start BLE");
  });
  $("button[name='startCall']").on("click",function(){
    var number=$("input[name='numberInput']").val();
    if(!callActive){
      cordovaCall.callNumber(number ,function() {},function(){});
      callActive=true;
    }
  });

  cordova.plugins.CordovaCall.setAppName("Resnicd" ,function(){},function(){});
  startBLE();
  //startSerial();
  cordova.plugins.photoLibrary.requestAuthorization(
  function () {

  },
  function (err) {
    // User denied the access
  }, // if options not provided, defaults to {read: true}.
  {
    read: true,
    write: true
  }
);



});

function test(){

    window.plugins.speechRecognition.startListening(
      function (matches){
        console.log("success : "+matches);
      }, function(matches){
        window.plugins.speechRecognition.stopListening(function(){},function(){});
        console.log("here : "+matches);
      },options);
}

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  $("#time").html(h + ":" + m + ":" + s);
  var t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}
