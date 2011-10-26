# Amazon SES

A simple Amazon SES wrapper, supports the following actions:

* DeleteVerifiedEmailAddress
* GetSendQuota
* GetSendStatistics
* ListVerifiedEmailAddresses
* SendEmail
* VerifyEmailAddress

Does not currently support SendRawEmail.

## Install

<pre>
  npm install amazon-ses
</pre>

Or from source:

<pre>
  git clone git://github.com/jjenkins/node-amazon-ses.git
  cd amazon-ses
  npm link .
</pre>

## Verify Source Email

Verify the source email address with Amazon.

<pre>
  var AmazonSES = require('amazon-ses');
  var ses = new AmazonSES('access-key-id', 'secret-access-key');
  ses.verifyEmailAddress('foo@mailinator.com');
</pre>

You will receive a confirmation email - click the link in that email to finish the verification process.

## Send Email

<pre>
  ses.send({
      from: 'foo@mailinator.com'
    , to: ['bar@mailinator.com', 'jim@mailinator.com']
    , replyTo: ['john@mailinator.com']
    , subject: 'Test subject'
    , body: {
          text: 'This is the text of the message.'
        , html: 'This is the <b>html</b> body of the message.'
    }
  });
</pre>

## Get verified email addresses

<pre>
  ses.listVerifiedEmailAddresses(function(result) {
    console.log(result);
  });
</pre>

## Deleted a verified email address

<pre>
  ses.deleteVerifiedEmailAddress('foo@mailinator.com', function(result) {
    console.log(result);
  });
</pre>

## Get Quota and Stats

<pre>
  ses.getSendQuota(function(result) {
    console.log(result);
  });

  ses.getSendStatistics(function(result) {
    console.log(result);
  });
</pre>
