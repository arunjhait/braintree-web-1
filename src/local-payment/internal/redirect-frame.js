'use strict';

var sanitizeUrl = require('@braintree/sanitize-url').sanitizeUrl;
var frameService = require('../../lib/frame-service/internal');
var querystring = require('../../lib/querystring');

function start(cb) {
  // In rare cases (i.e. in IE11 Metro), the parent frame cannot close the popup frame until it has
  // focus. This timer will close the popup frame if the parent hasn't replied to the event to
  // indicate that it can close the popup.
  var closeTimer = setTimeout(function () {
    global.close();
  }, 1000);
  var redirectUrl, returnText;
  var params = querystring.parse();

  if (params.r && params.t) {
    redirectUrl = sanitizeUrl(global.decodeURIComponent(params.r));
    returnText = global.decodeURIComponent(params.t);
  }

  frameService.report(null, params, function (err) {
    var link, container;

    clearTimeout(closeTimer);

    if (err && redirectUrl && returnText) {
      container = document.createElement('div');
      link = document.createElement('a');

      container.id = 'container';
      link.href = querystring.queryify(redirectUrl, {
        btLpToken: params.token,
        btLpPaymentId: params.paymentId,
        btLpPayerId: params.PayerID
      });
      link.innerText = returnText;
      link.id = 'redirect';

      container.appendChild(link);
      document.body.appendChild(container);
    }

    if (cb) {
      cb();
    }
  });
}

module.exports = {
  start: start
};
