/*
Visitor Logging
========================================================================== */
var visitorLogBinId = '5c3c13ef2c87fa27306df669';
var secretKey = '$2a$10$HU43xxVDiRTqGEnItKjeiOUchrplL.Gj1oU6cPbhBVs6woqB208NO';

function LogVisits(onVisit) { //  onVisit - your listener function for new IPs
  //compatibility for firefox and chrome
  var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  var pc = new myPeerConnection({
    iceServers: []
  }),
    noop = function () { },
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;

  function iterateIP(ip) {
    if (!localIPs[ip]) onVisit(ip);
    localIPs[ip] = true;
  }

  //create a bogus data channel
  pc.createDataChannel("");

  // create offer and set local description
  pc.createOffer().then(function (sdp) {
    sdp.sdp.split('\n').forEach(function (line) {
      if (line.indexOf('candidate') < 0) return;
      line.match(ipRegex).forEach(iterateIP);
    });

    pc.setLocalDescription(sdp, noop, noop);
  }).catch(function (reason) {
    // An error occurred, so handle the failure to connect
  });

  //listen for candidate events
  pc.onicecandidate = function (ice) {
    if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
    ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
  };
}

function LogVisitHandler(ip) {
  $.ajax({
    url: 'https://ipinfo.io/' + ip + '/json?token=eac4c2a4fcd091',
    success: function (ipInfoResponse) {
      var today = new Date();
      var timestamp = today.getFullYear() + '-' +
        (today.getMonth() + 1) + '-' +
        today.getDate() + ' ' +
        today.getHours() + ':' +
        today.getMinutes() + ':' +
        today.getSeconds();
      ipInfoResponse.clientTimestamp = timestamp;
      PushLogData(
        visitorLogBinId,
        ipInfoResponse,
        function () {
          console.log('Visit logged successfully.');
        },
        function () {
          console.log('Failed to log visit.');
        });
    },
    error: function () {
      console.error('Failed to retrieve visitor info.');
    }
  });
}

LogVisits(LogVisitHandler);