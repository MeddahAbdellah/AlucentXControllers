
$("button[name='phoneButton']").on("click",function(){
  var number=$("input[name='numberInput']").val()+$(this).html();
  $("input[name='numberInput']").val(number);
});


  $("button[name='delete']").on("click",function(){
    var number=$("input[name='numberInput']").val();
    number = number.substring(0, number.length - 1);
    $("input[name='numberInput']").val(number);
  });

$("input[name='smsInput'],input[name='phoneSmsInput']").on("click",function(){
    $(".smsKeyBoard").css("position","static");
    focusedInput=this;
    console.log("clicked");
  });

  $("button[name='smsKeyBoardButton']").on("click",function(){
    var number=$(focusedInput).val()+$(this).html();
    $(focusedInput).val(number);
  });
  $("button[name='smsKeyBoardDeleteButton']").on("click",function(){
    var number=$(focusedInput).val();
    number = number.substring(0, number.length - 1);
    $(focusedInput).val(number);
  });
  $(".texts,.galleryHeader").on("click",function(){
    $(".smsKeyBoard").css("position","absolute");
    focusedInput=null;
  });
