(function ($) {

  "use strict";

  /*
 Visitor Logging
 ========================================================================== */
  var logUrl = 'https://api.jsonbin.io/b/5c3c13ef2c87fa27306df669';
  var secretKey = '$2a$10$HU43xxVDiRTqGEnItKjeiOUchrplL.Gj1oU6cPbhBVs6woqB208NO';

  function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
    //compatibility for firefox and chrome
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
      iceServers: []
    }),
      noop = function () { },
      localIPs = {},
      ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
      key;

    function iterateIP(ip) {
      if (!localIPs[ip]) onNewIP(ip);
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

  getUserIP(function (ip) {
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
        $.ajax({
          url: logUrl + '/latest',
          method: 'GET',
          beforeSend: function (xhr) { xhr.setRequestHeader('secret-key', secretKey); },
          success: function (getLogResponse) {
            getLogResponse.Visits.push(ipInfoResponse);
            $.ajax({
              url: logUrl,
              method: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify(getLogResponse),
              beforeSend: function (xhr) { xhr.setRequestHeader('secret-key', secretKey); },
              success: function(updateLogResponse) {
                if (updateLogResponse.success == true) {
                  console.log('Visitor log successful.');
                } else {
                  console.log('Failed to update visitor log data.');
                }
              },
              error: function() {
                console.log('Failed to update visitor log data.');
              }
            });
          },
          error: function() {
            console.log('Failed to retrieve visitor log data.');
          }
        });
      },
      error: function() {
        console.log('Failed to retrieve visitor IP info.');
      }
    });
  })

  $(window).on('load', function () {

    /* 
   MixitUp
   ========================================================================== */
    $('#video').mixItUp();

    /* 
     One Page Navigation & wow js
     ========================================================================== */
    var OnePNav = $('.onepage-nev');
    var top_offset = OnePNav.height() - -0;
    OnePNav.onePageNav({
      currentClass: 'active',
      scrollOffset: top_offset,
    });

    /*Page Loader active
      ========================================================*/
    $('#preloader').fadeOut();

    // Sticky Nav
    $(window).on('scroll', function () {
      if ($(window).scrollTop() > 200) {
        $('.scrolling-navbar').addClass('top-nav-collapse');
      } else {
        $('.scrolling-navbar').removeClass('top-nav-collapse');
      }
    });

    /* slicknav mobile menu active  */
    $('.mobile-menu').slicknav({
      prependTo: '.navbar-header',
      parentTag: 'liner',
      allowParentLinks: true,
      duplicate: true,
      label: '',
      closedSymbol: '<i class="icon-arrow-right"></i>',
      openedSymbol: '<i class="icon-arrow-down"></i>',
    });

    /* WOW Scroll Spy
  ========================================================*/
    var wow = new WOW({
      //disabled for mobile
      mobile: false
    });

    wow.init();

    /* Nivo Lightbox 
    ========================================================*/
    $('.lightbox').nivoLightbox({
      effect: 'fadeScale',
      keyboardNav: true,
    });

    /* Counter
    ========================================================*/
    $('.counterUp').counterUp({
      delay: 10,
      time: 1000
    });


    /* Back Top Link active
    ========================================================*/
    var offset = 200;
    var duration = 500;
    $(window).scroll(function () {
      if ($(this).scrollTop() > offset) {
        $('.back-to-top').fadeIn(400);
      } else {
        $('.back-to-top').fadeOut(400);
      }
    });

    $('.back-to-top').on('click', function (event) {
      event.preventDefault();
      $('html, body').animate({
        scrollTop: 0
      }, 600);
      return false;
    });



  });

}(jQuery));