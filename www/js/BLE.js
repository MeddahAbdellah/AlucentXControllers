var serverUrl="https://9224e1eb.ngrok.io";
var service_uuid="75cf7374-a137-47e7-95e5-e675189c8a3e";
var characteristic_uuid="0d563a58-196a-48ce-ace2-dfec78acc814";
var dataReader=null;
var connectedDevice=null;
var serialRead = '';
var lastRead = new Date();
var lastX1=0;
var lastY1=0;
var lastX2=0;
var lastY2=0;
var lastTouch1=0;
var lastTouch2=0;
var activeButton1=null;
var activeButton2=null;
var speechRecognitionActive=false;
var callActive=false;
var focusedInput=null;
var turnOffTrigger=0;
var scrollValue=0;
var swipeValue=0;
var smsOptions = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          //  intent: 'INTENT'  // send SMS with the native android SMS messaging
            intent: '' // send SMS without open any other app
        }
      }
var options = {
  language:"en-US",
  matches:1,
  prompt:"Resnicd",
  showPopup:false,
  showPartial:false}
/* BLE communication */
function startBLE() {
  if(ble===undefined)alert("BLE doesn't work on this device");
  else alert("Starting Scan");
  ble.startScan([], function(device) {
    if(device.name=="resncid"){
      alert("Device Found : "+ device.name);
      ble.stopScan(function(){}, function(){});
      ble.autoConnect(device.id,function(BleDevice){
        connectedDevice=BleDevice;
        collectDataWhenConnected(BleDevice);
      },function(){alert("couldn't connect to Resncid BLE device");});
    }
}, function() {
  alert("failed to scan");
});
}

function collectDataWhenConnected(BleDevice){
  //console.log(bytesToString(BleDevice.advertising));
  ble.startNotification(connectedDevice.id, service_uuid,characteristic_uuid,function(dataRead){readBLEsuccess(dataRead)},readBLEfail(connectedDevice));
       //dataReader = setInterval(readBLE,10);

}
function readBLE(){
//console.log(connectedDevice.id);
ble.read(connectedDevice.id, service_uuid,characteristic_uuid,function(dataRead){readBLEsuccess(dataRead)},readBLEfail(connectedDevice));

}
function writeBLE(data){

  ble.write(connectedDevice.id, service_uuid, characteristic_uuid, stringToBytes(data), function(){
    //console.log("sent : "+data);
  }, function(){writeBLE();});
}

function readBLEsuccess(dataRead){
  //console.log("read called");
  showData(bytesToString(dataRead));
}

function readBLEfail(BleDevice){
//  console.log("reconnectin ... ");
  ble.isConnected(BleDevice.id,function(){//console.log("connected");
},function(){/*console.log("not connected");clearInterval(dataReader);*/});
}

/* END BLE communication */
/* Serial Communciation*/
function startSerial(){
  serial.requestPermission(
  function(successMessage) {
    serial.open(
        {baudRate: 115200},
          function(successMessage) {
            serial.registerReadCallback(
            function success(data){
              var view = new Uint8Array(data);
              serialToString(view);
            },
            function error(){
              new Error("Failed to register read callback");
            });
        },
        errorCallback
    );
  },
  errorCallback
  );
}

var errorCallback = function(message) {
alert('Error: Could not connect to device ' + message +"Reconnecting");
serial.open(
    {baudRate: 115200},
      function(successMessage) {
        serial.registerReadCallback(
        function success(data){
          var view = new Uint8Array(data);
          serialToString(view);
        },
        function error(){
          new Error("Failed to register read callback");
        });
        lunchApp();
    },
    errorCallback
);
};
function writeSerial(data){
  serial.write(data, function(){}, function(){alert("couldn't send");});
}
/* END Serial Communication*/

function moveCursor(cursorX,cursorY,cursor){
  //  $(cursor).velocity("stop");
    $(cursor).velocity({left: cursorX+'px',
              bottom: cursorY+'px'},{ duration: 20 ,queue:false});

}
function showData(data){
  var x1 = data.substring(0,data.indexOf(","));
  var y1 = data.substring(getPosition(data,",",1)+1,getPosition(data,",",2));
  var touch1 = data.substring(getPosition(data,",",2)+1,getPosition(data,",",3));

  var x2 = data.substring(getPosition(data,",",3)+1,getPosition(data,",",4));
  var y2 = data.substring(getPosition(data,",",4)+1,getPosition(data,",",5));
  var touch2 = data.substring(getPosition(data,",",5)+1,getPosition(data,",",6));

  x1=parseInt(x1);
  y1=parseInt(y1);
  y1= y1*parseFloat($("body").height()/58);
  x1=x1*parseFloat($("body").width()/52);
  x1=x1.toFixed(2);
  y1=y1.toFixed(2);

  x2=parseInt(x2);
  y2=parseInt(y2);
  y2= y2*parseFloat($("body").height()/58);
  x2=x2*parseFloat($("body").width()/52);
  x2=x2.toFixed(2);
  y2=y2.toFixed(2);

  if(isNaN(x1))x1=0;
  if(isNaN(x2))x2=0;
  if(isNaN(y1))y1=0;
  if(isNaN(y2))y2=0;

  if($(".smsKeyBoard").css("position")=="static"){
    y1=calibrate(y1);
    y2=calibrate(y2);
  }
  //console.log("x1 : "+x1+" y1 : "+y1+" touch1 : "+touch1+" x2 : "+x2+" y2 : "+y2+" touch2 : "+touch2);
  if(x1>$("body").width())x1=$("body").width()-$(".cursor1").width();
  if(y1>$("body").height())y1=$("body").height()-$(".cursor1").height();

  if(x2>$("body").width())x2=$("body").width()-$(".cursor2").width();
  if(y2>$("body").height())y2=$("body").height()-$(".cursor2").height();

  $(".cursorShadow1").css({left: x1+'px',
                           bottom: y1+'px'});
  $(".cursorShadow2").css({left: x2+'px',
                           bottom: y2+'px'});
  if(turnOffTrigger>1)toggleScreenLight();
  if(touch1=="5" && touch2=="5"){
      turnOffTrigger++;
      setTimeout(function(){turnOffTrigger=0;},10000);
  }

  handleCursor(x1,y1,touch1,".cursor1");
  handleCursor(x2,y2,touch2,".cursor2");
}
function calibrate(y){
  //console.log(y);
  if(y<(parseFloat($("body").height())-(parseFloat($(".galleryHeader").height())+parseFloat($("input[name='phoneSmsInput']").height()))))return (y*(parseFloat($(".smsKeyBoard").height())+parseFloat($("input[name='smsInput']").height())+20)/(parseFloat($("body").height())-(parseFloat($(".galleryHeader").height())+parseFloat($("input[name='phoneSmsInput']").height()))));
  else return y;
}
function handleCursor(x,y,touch,cursor){
  if(localStorage.getItem("currentPage")==".appsWrapper" || localStorage.getItem("currentPage")==".phoneCallWrapper")moveClick(x,y,touch,cursor)
  else if (localStorage.getItem("currentPage")==".smsWrapper")moveSpeakClickScroll(x,y,touch,cursor);
  else if (localStorage.getItem("currentPage")==".galleryWrapper" || localStorage.getItem("currentPage")==".imgWrapper")moveScrollZoomClick(x,y,touch,cursor);
}
function toggleScreenLight(touch){
  turnOffTrigger=0;
  $(".lockScreen").toggle();
  $(".lockScreen").css({position:"absolute"});
  if(touch == 0 && lastTouch1==4 /*&& !(lastTouch1==4 && lastTouch2==4) && (lastTouch1==4 || lastTouch2=4)*/){
    //console.log("turning Off");
  //adb shell input keyevent 82 && adb shell input keyevent 66
  window.ShellExec.exec('input keyevent 223', function(res){
  //console.log('exit status: ' + res.exitStatus);
  //console.log('cmd output: ' + res.output);
  /*window.ShellExec.exec('input keyevent 82', function(res){
  console.log('exit status: ' + res.exitStatus)
  console.log('cmd output: ' + res.output)
});*/
  });
  }
}

function moveClick(x,y,touch,cursor){
  var lastTouch=0;
  if(cursor===".cursor1"){
    lastTouch=lastTouch1;
  }
  else if(cursor===".cursor2"){
    lastTouch=lastTouch2;
  }
  if(touch=="0" && lastTouch=="1"){$(cursor).addClass("clickBackground");click(cursor);}
  else if(touch=="2" && callActive){console.log("stoping call");
  window.ShellExec.exec('input keyevent KEYCODE_ENDCALL', function(res){
  //console.log('exit status: ' + res.exitStatus)
  //console.log('cmd output: ' + res.output)
  });
  callActive=false;}
  else if(touch=="3"){}
  else if(touch=="4"){}
  else $(cursor).removeClass("clickBackground");
  $("#cursorPosition").html("CursorX: "+x+" CursorY: "+y);
  checkHits(cursor,x,y);
  if(cursor===".cursor1"){
    lastTouch1=touch;
  }
  else if(cursor===".cursor2"){
    lastTouch2=touch;
  }
}
function moveScrollZoomClick(x,y,touch,cursor){
  var lastTouch=0;
  if(cursor===".cursor1"){
    lastTouch=lastTouch1;
  }
  else if(cursor===".cursor2"){
    lastTouch=lastTouch2;
  }
  if(cursor===".cursor1"){
    lastTouch1=touch;
  }
  else if(cursor===".cursor2"){
    lastTouch2=touch;
  }
  //console.log("before Condition : "+touch+ "and "+ lastTouch );
  if(touch=="0" && lastTouch=="1"){
    $(cursor).addClass("clickBackground");
    click(cursor);
  }else if(touch=="1" && lastTouch="1"){
      if(localStorage.getItem("currentPage")===".imgWrapper"){
      if((lastTouch1==4 || lastTouch1==3) && (lastTouch2==4 || lastTouch2==3))zoom();
      else swipe(x,$(".imgDisplay"),cursor);
    }
    else{
    scroll(y,$(".galleryImages"),cursor);
    }
  }
  else if(touch=="2"){}
  else if(touch=="3"){
    if(localStorage.getItem("currentPage")===".imgWrapper"){
      if((lastTouch1==4 || lastTouch1==3) && (lastTouch2==4 || lastTouch2==3))zoom();
      else swipe(x,$(".imgDisplay"),cursor);
    }
    else{
    scroll(y,$(".galleryImages"),cursor);
    }
  }
  else if(touch=="4"){
    if(localStorage.getItem("currentPage")===".imgWrapper"){
      if((lastTouch1==4 || lastTouch1==3) && (lastTouch2==4 || lastTouch2==3))zoom();
      else swipe(x,$(".imgDisplay"),cursor);
    }
    else{
    scroll(y,$(".galleryImages"),cursor);
    }
  }else{
    if(cursor===".cursor1"){
      swipe(lastX1,$(".imgDisplay"),cursor);
    }
    else if(cursor===".cursor2"){
      swipe(lastX2,$(".imgDisplay"),cursor);
    }
  }
  //$("#cursorPosition").html("CursorX: "+x+" CursorY: "+y);
  checkHits(cursor,x,y);

}
function moveSpeakClickScroll(x,y,touch,cursor){
  var lastTouch=0;
  if(cursor===".cursor1"){
    lastTouch=lastTouch1;
  }
  else if(cursor===".cursor2"){
    lastTouch=lastTouch2;
  }
  if(touch=="0" && lastTouch=="1"){
    $(cursor).addClass("clickBackground");
    click(cursor);
  }
  else if(touch=="2"){
    //console.log("clicked : " + speechRecognitionActive);
    if(speechRecognitionActive){window.plugins.speechRecognition.stopListening(function(){$(focusedInput).css("background","white");},function(){});speechRecognitionActive=false;}
    else{
      speechRecognitionActive=true;
      $(focusedInput).css("background","cyan");
      window.plugins.speechRecognition.startListening(
        function (matches){
          if(speechRecognitionActive){
          //console.log(matches);
          //console.log($(focusedInput).attr("name"));
          $(focusedInput).css("background","white");
          //console.log($(focusedInput).attr("name")=='phoneSmsInput');
          if((matches[0].toString().indexOf("-")>0 || matches[0].toString().indexOf(" ")>0) && $(focusedInput).attr("name")=='phoneSmsInput'){matches[0]=matches[0].replace("-","");matches[0]=matches[0].replace(" ", "");}
          if( focusedInput!==null)$(focusedInput).val(matches[0].toString());
          speechRecognitionActive=false;
          }
        }, function(matches){
          window.plugins.speechRecognition.stopListening(function(){},function(){});
        },options);
    }
  }
  else if(touch=="3"){scroll(y,$(".texts"),cursor); $(cursor).addClass("holdBackground");}
  else if(touch=="4"){scroll(y,$(".texts"),cursor); $(cursor).addClass("longBackground");}
  else $(cursor).removeClass("clickBackground");
  $("#cursorPosition").html("CursorX: "+x+" CursorY: "+y);
  checkHits(cursor,x,y);
  if(cursor===".cursor1"){
    lastTouch1=touch;
  }
  else if(cursor===".cursor2"){
    lastTouch2=touch;
  }
}
function checkHits(cursor,x,y){
  var hits=null;
  if(cursor===".cursor1")hits = $(".cursorShadow1").collision("button,.fa-arrow-left,input,.galleryComponent img");
  if(cursor===".cursor2")hits = $(".cursorShadow2").collision("button,.fa-arrow-left,input,.galleryComponent img");
  //console.log(hits);
  if(hits.size() >=1){
    if(hits.size()>1)hits=hits[0];
    $( cursor ).position({
      my: "center",
      at: "center",
      of: hits
    });
  //  $("button,.fa-arrow-left").removeClass("hoveredButton");
  //  hits.addClass("hoveredButton");
    if(cursor==".cursor1")activeButton1=hits;
    if(cursor==".cursor2")activeButton2=hits;
}else if(hits.size!=1){
  if(localStorage.getItem("currentPage")==".galleryWrapper" || localStorage.getItem("currentPage")==".imgWrapper")$(cursor).css({top:"auto"});
  if(cursor===".cursor1"){

    activeButton1=null;
    if(lastX1!=x || lastY1!=y){
      lastX1=x;
      lastY1=y;
      if(x<=0)x=0.01
      if(y<=0)y=0.01
      moveCursor(x,y,cursor);
    }
  }
  else if(cursor===".cursor2"){
    activeButton2=null;
    if(lastX2!=x || lastY2!=y){
      lastX2=x;
      lastY2=y;
      if(x<=0)x=0.01
      if(y<=0)y=0.01
      moveCursor(x,y,cursor);
    }
  }
}

}


function click(cursor)
{ //console.log("click");
    if(cursor==".cursor1" && activeButton1!==null)activeButton1.click();
    else if(cursor==".cursor2" && activeButton2!==null)activeButton2.click();
    else{
    var clickPoint = $(cursor).position();
    y=clickPoint.top+($(cursor).height()/2);
    x=clickPoint.left+($(cursor).width()/2);
    //console.log("CursorX click: "+x+" CursorY click: "+y);
    var ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    });

    var el = document.elementFromPoint(x, y);

    if(el!==null)el.dispatchEvent(ev);
  }
}
function scroll(y,divToScroll,cursor){

  //var hits = $(cursor).collision(".texts,.messageRecieved,.messageSent,.galleryImages,.galleryComponent,.imgDescription");
  if(cursor==".cursor1")scrollValue+=parseInt(parseInt(y-lastY1)*5);
  if(cursor==".cursor2")scrollValue+=parseInt(parseInt(y-lastY2)*5);
  if(scrollValue < 0)scrollValue = 0;
  if(scrollValue > divToScroll.prop("scrollHeight"))scrollValue = divToScroll.prop("scrollHeight");
  //console.log("scroll : "+scrollValue);
  //console.log("scroll hits : "+hits.size());
//  if(hits.size()>0){
    divToScroll.stop();
    divToScroll.animate({scrollTop:scrollValue});
//  }

}

function zoom(){
  if(lastTouch1==4 && lastTouch2==4){
  var cursor1 = $(".cursor1").position();
  var cursor2 = $(".cursor2").position();
  var zoom = (Math.abs(cursor1.left-cursor2.left)/340)+1;
  //console.log("zooming cursor1: "+cursor1.left+" cursor2: "+cursor2.left+" zoom: "+zoom);
  $(".imgDisplay").css({transform:"scale("+zoom+")"});
  }
}
function swipe(x,divToScroll,cursor){
  swipeValue=$(window).width()*imgIndex;
  var posDifference=0;
  if(cursor==".cursor1")posDifference=parseInt(parseInt(lastX1-x)*1.5);
  if(cursor==".cursor2")posDifference=parseInt(parseInt(lastX2-x)*1.5);

  swipeValue+=posDifference;

  if(posDifference > ($(window).width()*(0.5)) && posDifference > 0){
    imgIndex++;
    swipeValue=$(window).width()*imgIndex;
    console.log(" > > >");
    console.log("swipeValue before : "+swipeValue);
    console.log("lastX1-x : "+parseInt(parseInt(lastX1-x))*2);
    console.log("imgIndex : "+imgIndex);
  }
  if(posDifference < -($(window).width()*(0.5)) && posDifference <0){
    console.log(" < < <");
    console.log("swipeValue before : "+swipeValue);
    console.log("lastX1-x : "+parseInt(parseInt(lastX1-x))*2);
    console.log("imgIndex : "+imgIndex);
    imgIndex--;
    swipeValue=$(window).width()*imgIndex;
  }
  if(swipeValue < 0){
    swipeValue = 0;
    imgIndex=0;
  }
  if(swipeValue > divToScroll.prop("scrollWidth")){
    swipeValue = divToScroll.prop("scrollWidth");
    imgIndex=20;
  }
  console.log("swipeValue after : "+swipeValue);
  //divToScroll.stop();
  if (!divToScroll.is(':animated')) {
    divToScroll.animate({scrollLeft:swipeValue},400);
  }

}

function getPosition(string, subString, index) {
   return string.split(subString, index).join(subString).length;
}
function saveData(data){
  var newDataObj={equipement_id:localStorage.getItem("equipement_id"),
                  temperature:data.substring(data.indexOf("Temperature: ")+"Temperature: ".length,data.indexOf("C")),
                  weight:data.substring(data.indexOf("Weight: ")+"Weight: ".length,data.indexOf("Kg")),
                  time:new Date().toISOString()};
  var obj=[];
  text = localStorage.getItem("Data");//get the item
  if (text!==null) {//if it's not empty then we push new element
    obj = JSON.parse(text);
  }
  obj.push(newDataObj);
  myJSON = JSON.stringify(obj);
  localStorage.setItem("Data", myJSON);
}
function sendData(){
  var dataPacket=localStorage.getItem("Data");
  if(dataPacket!==null){
  $.ajax({
      type:"POST",
      url:serverUrl+"/PAEPACK/addData.php",
      data:{data:dataPacket},
      success:function(response){
        localStorage.removeItem("Data");
      },
      error:function(error){
        console.log(error);
      }
  });
  }
}
/* Drivers */
function stringToBytes(string) {
   var array = new Uint8Array(string.length);
   for (var i = 0, l = string.length; i < l; i++) {
       array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}
function serialToString(view){

                               if(view.length >= 1) {
                                   for(var i=0; i < view.length; i++) {
                                       // if we received a \n, the message is complete, display it
                                       if(view[i] === 13) {
                                           // check if the read rate correspond to the arduino serial print rate
                                          var now = new Date();
                                          showData(serialRead);
                                          lastRead = now;
                                          serialRead= '';
                                       }
                                       // if not, concatenate with the begening of the message
                                       else {
                                           var temp_str = String.fromCharCode(view[i]);
                                           serialRead+= temp_str;
                                       }
                                   }
                               }
}
/* END Drivers */

function isIn(array1,variable1){
  for(i in array1){
    if(array1[i].name===variable1){
      return true;
    }
  }
  return false;
}
