'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/* global $, Clipboard, hljs */

// Activate clipboard
var clipboard = new Clipboard('.btn-clipboard'); // Stop crying Firefox!
clipboard; // stop crying StandardJS!

// Test if JSON is valid and trigger notification if it's not
var validNotification = function validNotification() {
  if ($('textarea').val() !== '') {
    try {
      $.parseJSON($('code').text());
      $('.invalid-json').fadeOut();
    } catch (err) {
      $('.invalid-json').fadeIn();
    }
  } else {
    $('.invalid-json').fadeOut();
  }
};

setInterval(validNotification, 500);

// Load example data
$('.btn-example').click(function () {
  $('#picked').val('');
  $.ajax({
    url: 'https://maps.googleapis.com/maps/api/geocode/json?address=San%20Francisco',
    success: function success(data) {
      $('textarea').text('https://maps.googleapis.com/maps/api/geocode/json?address=San%20Francisco');
      $('code').html(data);
      hljs.highlightBlock($('code')[0]);
    },
    dataType: 'text'
  });
});

// Traverse the object and sift out the selector
// Courtesy of https://github.com/danjford
var searchObj = function searchObj(searchTerm, object) {
  var path = [];
  var foundVal = '';
  var stopSearch = false;

  function search(searchTerm, object) {
    var pointer = undefined;
    for (var key in object) {
      if (_typeof(object[key]) === 'object') {
        if (!stopSearch) {
          pointer = key;
          search(searchTerm, object[key]);
        }
      } else if (object[key].toString().indexOf(searchTerm.toString()) > -1) {
        pointer = key;
        foundVal = object[key];
        stopSearch = true;
      }
      if (stopSearch) break;
    }
    if (stopSearch) {
      path.push(isNaN(pointer) ? pointer : '[' + pointer + ']');
    }
  }
  search(searchTerm, object);
  return {
    value: foundVal,
    path: path.reverse().join('.').replace(/\.\[/g, '[').replace(/\.$/, '')
  };
};

$(document).on('click', '.hljs-string, .hljs-number', function () {
  // Click highlight
  $('code *').removeClass('is-selected');
  $(this).addClass('is-selected');

  // Find selector and display in disabled input field
  var foundVal = searchObj($(this).text().replace(/[\"]/g, ''), $.parseJSON($('code').text()));
  $('#picked').val(foundVal.path);
});

// Resize panels
var horizontalResize = function horizontalResize(offset) {
  $('textarea').css('width', offset + '%');
  $('.code-wrap').css('width', 100 - offset + '%');
};

var verticalResize = function verticalResize(offset) {
  $('textarea').css('height', offset + '%');
  $('.code-wrap').css('height', 100 - offset + '%');
};

var resizing = false;
$('.resize').on('mousedown touchstart', function () {
  return resizing = true;
});

$(document).on('mousemove touchmove', function (e) {
  if (!resizing) {
    return;
  }
  if (document.querySelector('body').clientWidth >= 1000) {
    horizontalResize(e.pageX / document.querySelector('main').clientWidth * 100);
  } else {
    verticalResize(e.originalEvent.touches[0].pageY / document.querySelector('body').clientHeight * 100 - 5);
    return false;
  }
}).on('mouseup touchend', function () {
  return resizing = false;
});

// Remove the resize styles on window change so it doesn't get wierd
$(window).on('resize', function () {
  return $('textarea, .code-wrap').removeAttr('style');
});

$('textarea').keydown(function (e) {
  // Allow insertion of tabs - http://stackoverflow.com/a/28483558/175825
  if (e.which === 9) {
    e.preventDefault();
    if (this.value) {
      var val = this.value;
      var start = this.selectionStart;
      var end = this.selectionEnd;
      var selected = val.substring(start, end);
      var re = '';
      var count = '';

      if (e.shiftKey) {
        re = /^\t/gm;
        count = -selected.match(re).length;
        this.value = val.substring(0, start) + selected.replace(re, '') + val.substring(end);
      } else {
        re = /^/gm;
        count = selected.match(re).length;
        this.value = val.substring(0, start) + selected.replace(re, '\t') + val.substring(end);
      }
      if (start === end) {
        this.selectionStart = end + count;
      } else {
        this.selectionStart = start;
      }
      this.selectionEnd = end + count;
    }
  }
});

var timeout = '';
var debounceRequest = function debounceRequest(contents, timeout) {
  timeout = setTimeout(function () {

    $.ajax({
      url: contents,
      type: 'GET',
      dataType: 'json',
      success: function success(data) {
        $('code').html(JSON.stringify(data, null, '\t'));
        hljs.highlightBlock($('code')[0]);
      },
      error: function error() {
        // Send textarea code to highlight.js <code> container
        console.log('Sorry for spamming the 💩 out of your console! https://github.com/corysimmons/picky.json/issues/4');
        $('code').html($('textarea').val());
        hljs.highlightBlock($('code')[0]);
      }
    });
  }, timeout);
};

// Test the input to see if it's a JSON url
// If it is, populate <code> with that data
// If it's not, populate <code> with whatever is in <textarea>
$('textarea').keyup(function () {
  clearTimeout(timeout);
  debounceRequest($('textarea').val().trim(), 1000);
  $('#picked').val('');
});
//# sourceMappingURL=picky.js.map