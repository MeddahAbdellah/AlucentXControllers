$(".phoneCallWrapper").css("top","100vh");
$(".lockScreen").hide();
let cameraOptions = {
  x: 0,
  y: 0,
  width: window.screen.width,
  height: window.screen.height,
  camera: CameraPreview.CAMERA_DIRECTION.BACK,
  toBack: true,
  tapPhoto: false,
  tapFocus: false,
  previewDrag: false
};
var tf=null;
$(document).on('deviceready', function() {
  //startTime();
  tf = new TensorFlow('inception-v1');
  tf.onprogress = function(evt) {
    if (evt['status'] == 'downloading'){
        console.log("Downloading model files...");
        console.log(evt.label);
        if (evt.detail) {
            // evt.detail is from the FileTransfer API
            console.log('max', evt.detail.total);
            console.log('value', evt.detail.loaded);
        }
    } else if (evt['status'] == 'unzipping') {
        console.log("Extracting contents...");
    } else if (evt['status'] == 'initializing') {
        console.log("Initializing TensorFlow");
    }
};
tf.load().then(function() {
    console.log("Model loaded");
    setTimeout(detect,500);
});
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


CameraPreview.startCamera(cameraOptions);
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

function detect(){
        CameraPreview.takePicture({width:200, height:350, quality: 65}, function(base64PictureData){
          tf.classify(base64PictureData).then(function(results) {
            results.forEach(function(result) {
                console.log(result.title + " : " + result.confidence);
            });
        });

});
}
