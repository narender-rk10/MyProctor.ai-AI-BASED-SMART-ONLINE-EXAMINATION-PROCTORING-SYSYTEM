var data = {};

SEC.ready(function() {
        var SECWidget = SEC.widget("example-widget");
        // SECWidget.setCompilers(["{{test['compiler']}}"]);
        SECWidget.loadSourceCode(["{{test['compiler']}}"]);
        var beforeSendSubmission = function(data) {
        document.getElementById("inputByStudent").innerHTML = data.submissionInput;
        document.getElementById("codeByStudent").innerHTML = data.submissionSource;
        return true;
      };
        SECWidget.events.subscribe('beforeSendSubmission', beforeSendSubmission);
        var checkStatus = function(data) {
        document.getElementById("executedByStudent").innerHTML = data.statusDescription;
        };
        SECWidget.events.subscribe('checkStatus', checkStatus);
        });

        
        window.onfocus = function(event) {
          var x = document.getElementById("snackbar");
          x.className = "show";
          setTimeout(function(){ x.className = x.className.replace("show", ""); }, 10000);
            $.ajax({
                  data : {'testid': tid},
                  type: "POST",
                  url: "/window_event"   
                });
};

var stream = document.getElementById("stream");
var capture = document.getElementById("capture");
var cameraStream = null;
var array = null;
var values = 0;
var length = null;

function startStreaming() {

  var mediaSupport = 'mediaDevices' in navigator;
  navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

  if( mediaSupport && null == cameraStream ) {
    navigator.mediaDevices.getUserMedia( { video: true, audio: true } )
    .then( function( mediaStream ) {
      cameraStream = mediaStream;
      stream.srcObject = mediaStream;
      stream.play();
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(mediaStream);
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      javascriptNode.onaudioprocess = function() {
          array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          values = 0;
  
          length = array.length;
          for (var i = 0; i < length; i++) {
            values += (array[i]);
          }
      }
    })
    .catch( function( err ) {
      console.log("Unable to access camera: " + err);
    });
  }
  else {
    alert('Your browser does not support media devices.');
    return;
  }
}

function stopStreaming() {

  if( null != cameraStream ) {
    var track = cameraStream.getTracks()[ 0 ];
    track.stop();
    stream.load();
    cameraStream = null;
  }
}

function captureSnapshot() {

  if( null != cameraStream ) {
    var ctx = capture.getContext( '2d' );
    var img = new Image();
    ctx.drawImage( stream, 0, 0, capture.width, capture.height );
    img.src = capture.toDataURL( "image/png" );
    img.width	= 340;
    var d1 = capture.toDataURL("image/png");
    var res = d1.replace("data:image/png;base64,", "");

      var average = values / length;

      console.log(average)
      console.log(Math.round(average - 40));

      if(average)
      {
          $.post("/video_feed",{
              data : {'imgData':res,'voice_db':average,'testid': tid}},
              function(data){
              console.log(data);
              });
      }

    } 
    setTimeout(captureSnapshot, 5000);

  } 

$(document).ready( function() {
    var url = window.location.href;
    var list = url.split('/');
    var time = parseInt($('#time').text()), display = $('#time');
    startTimer(time, display);
    sendTime();
    flag_time = true;
})

var flag_time = true;
function startTimer(duration, display) {
    var timer = duration,hours, minutes, seconds;
    
    var interval = setInterval(function () {
        console.log(timer);
        hours = parseInt(timer / 3600 ,10);
        minutes = parseInt((timer%3600) / 60, 10);
        seconds = parseInt(timer % 60, 10);
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.text(hours + ":" + minutes + ":" + seconds);
        if (--timer < -5) {
            submitformexam();
            clearInterval(interval);
            flag_time = false;
        }
    }, 1000);
}

function sendTime() {
    var intervalTime = setInterval(function() {
        if(flag_time == false){
            clearInterval(intervalTime);
        }
        var time = $('#time').text();
        var [hh,mm,ss] = time.split(':');
        hh = parseInt(hh);
        mm = parseInt(mm);
        ss = parseInt(ss);
        var seconds = hh*3600 + mm*60 + ss;
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: "/test_update_time",
            data: {time: seconds, testid: tid},
        });
        if(flag_time == false){
            clearInterval(intervalTime);
        }
    }, 5000);
}
function submitformexam(){
    document.forms["prac"].submit();
  }


  window.addEventListener('selectstart', function(e){ e.preventDefault(); });
  $(document).ready(function () {
      $('body').bind('select cut copy paste', function (e) {
          e.preventDefault();
      });
      
      $("body").on("contextmenu",function(e){
          return false;
      });
  });

  document.addEventListener('keyup', (e) => {
  if (e.key == 'PrintScreen') {
  navigator.clipboard.writeText('');
  alert('Screenshots disabled!');
  }
  });
  
  document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key == 'p') {
  alert('This section is not allowed to print or export to PDF');
  e.cancelBubble = true;
  e.preventDefault();
  e.stopImmediatePropagation();
  }
  });
  