var _ = require('underscore');
var crypto = require('crypto');
var qs = require('querystring');
var request = require('request');
var xml = require('xml2js');

var AmazonSES = (function() {

  var init = function(key, secret, region) {
    this.accessKeyId = key;
    this.secretAccessKey = secret;
    this.region = region;
  };

  var hmac = function(key, str) {
    var hash = crypto.createHmac('sha256', key);
    return hash.update(str).digest('base64');
  };

  var getDestinationList = function(addresses, type) {
    var list = {};
    _.each(addresses, function(address, idx) {
        var key = 'Destination.'+ type +'Addresses.member.' + (idx + 1);
        list[key] = address;
    });
    return list;
  };
  
  var getReplyToList = function(addresses) {
    var list = {};
    _.each(addresses, function(address, idx) {
        var key = 'ReplyToAddresses.member.' + (idx + 1);
        list[key] = address;
    });
    return list;
  };
  
  var buildMessage = function(opts) {
    var params = {
        'Action': 'SendEmail'
      , 'Source': opts.from
      , 'Message.Subject.Data' : opts.subject
    };
    if (opts.body.text) {
      params['Message.Body.Text.Data'] = opts.body.text;
      params['Message.Body.Text.Charset'] = 'UTF-8';
    }
    if (opts.body.html) {
      params['Message.Body.Html.Data'] = opts.body.html;
      params['Message.Body.Html.Charset'] = 'UTF-8';
    }
    _.extend(params, getDestinationList(opts.to, 'To'));
    _.extend(params, getDestinationList(opts.cc, 'Cc'));
    _.extend(params, getDestinationList(opts.bcc, 'Bcc'));
    _.extend(params, getReplyToList(opts.replyTo));
    
    return params;
  };

  var parser = new xml.Parser({explicitArray: false, explicitRoot: false});

  var call = function(opts) {

    var host = 'email.'+this.region+'.amazonaws.com';
    var path = '/';

    var now = (new Date()).toUTCString();
    var body = qs.stringify(opts.query);

    var authorization =
        'AWS3-HTTPS '
      + 'AWSAccessKeyId=' + this.accessKeyId
      + ',Algorithm=HmacSHA256'
      + ',Signature=' + hmac(this.secretAccessKey, now)

    var headers = {
        'Date': now
      , 'Host': host
      , 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      , 'Content-Length': body.length
      , 'X-Amzn-Authorization': authorization
    };

    var options = {
        method: 'POST'
      , uri: 'https://' + host + path
      , headers: headers
      , body: body
    };

    request(options, function(error, response, body) {
      if (error) {
        return opts.callback(error);
      }
      parser.parseString(body, function(error, data) {
        if (error) {
          return opts.callback(error);
        }
        if (data.Error) {
          return opts.callback(new Error(data.Error.Message));
        }
        opts.callback(null, data);
      });
    });
  };

  var Constructor = function(accessKeyId, secretAccessKey, region) {
    init(accessKeyId, secretAccessKey, region);
  };

  Constructor.prototype = {
    constructor: AmazonSES,
    /**
     * Verify an email address. This action causes a confirmation email
     * message to be sent to the specified address.
     *
     * @params {String} email The email address to be verified
     * @params {Function} callback
     * @throws {Error}
     */
    verifyEmailAddress: function(email, callback) {
      call({
          query: {'Action': 'VerifyEmailAddress', 'EmailAddress': email}
        , callback: function(err, data) {
            if (err) throw err;
            if (callback) {
              callback(data.ResponseMetadata);
            }
        }
      });
    },
    /**
     * Return a list containing all of the email addresses that have been
     * verified.
     *
     * @params {Function} callback
     * @throws {Error}
     */
    listVerifiedEmailAddresses: function(callback) {
      call({
          query: {'Action': 'ListVerifiedEmailAddresses'}
        , callback: function(err, data) {
            if (err) throw err;

            var result = data.ListVerifiedEmailAddressesResult;
            if (callback) {
              callback(result.VerifiedEmailAddresses.member);
            } else {
              throw Error("Must pass listVerifiedEmailAddresses a callback function");
            }
        }
      });
    },
    /**
     * Delete the specified email address from the list of verified
     * addresses.
     *
     * @params {String} email The email address to delete
     * @params {Function} callback
     */
    deleteVerifiedEmailAddress: function(email, callback) {
      call({
          query: {'Action': 'DeleteVerifiedEmailAddress', 'EmailAddress': email}
        , callback: function(err, data) {
            if (err) throw err;

            if (callback) {
              callback(data.ResponseMetadata);
            }
        }
      });
    },
    /**
     * Return the user's current sending limits.
     *
     * @params {Function} callback
     */
    getSendQuota: function(callback) {
      call({
          query: {'Action': 'GetSendQuota'}
        , callback: function(err, data) {
            if (err) throw err;

            if (callback) {
              callback(data.GetSendQuotaResult);
            } else {
              throw Error("Must pass getSendQuota a callback function");
            }
        }
      });
    },
    /**
     * Return the user's sending statistics. The result is a list of data
     * points, representing the last two weeks of sending activity. Each
     * data point in the list contains statistics for a 15-minute interval.
     *
     * @params {Function} callback
     */
    getSendStatistics: function(callback) {
      call({
          query: {'Action': 'GetSendStatistics'}
        , callback: function(err, data) {
            if (err) throw err;

            if (callback) {
              callback(data.GetSendStatisticsResult);
            } else {
              throw Error("Must pass getSendStatistics a callback function");
            }
        }
      });
    },
    /**
     * Composes an email message based on input data, and then immediately
     * queues the message for sending.
     *
     * @params {Object} message The email message components
     * @params {Function} callback
     */
    send: function(message, callback) {
      call({
          query: buildMessage(message)
        , callback: function(err, data) {
            if (callback) callback(err, data);
        }
      });
    }
  };

  return Constructor;

}());
module.exports = AmazonSES;
