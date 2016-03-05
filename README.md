# Amazon SES

A simple Amazon SES wrapper, supports the following actions:

* `DeleteVerifiedEmailAddress`
* `GetSendQuota`
* `GetSendStatistics`
* `ListVerifiedEmailAddresses`
* `SendEmail`
* `VerifyEmailAddress`

Does not currently support `SendRawEmail`.

## Install

```
npm install amazon-ses-with-region
```

## Verify Source Email

Verify the source email address with Amazon.

```js
var AmazonSES = require('amazon-ses-with-region');
var ses = new AmazonSES('access-key-id', 'secret-access-key', 'region');
ses.verifyEmailAddress('foo@mailinator.com');
```

You will receive a confirmation email - click the link in that email to finish the verification process.

## Send Email

```js
ses.send({
    from: 'Foo <foo@mailinator.com>'
  , to: ['bar@mailinator.com', 'jim@mailinator.com']
  , replyTo: ['john@mailinator.com']
  , subject: 'Test subject'
  , body: {
        text: 'This is the text of the message.'
      , html: 'This is the <b>html</b> body of the message.'
  }
});
```

## Get verified email addresses

```js
ses.listVerifiedEmailAddresses(function(result) {
  console.log(result);
});
```

## Deleted a verified email address

```js
ses.deleteVerifiedEmailAddress('foo@mailinator.com', function(result) {
  console.log(result);
});
```

## Get Quota and Stats

```js
ses.getSendQuota(function(result) {
  console.log(result);
});

ses.getSendStatistics(function(result) {
  console.log(result);
});
```
