async function amazonLamdbaRunner() {

  var event = 
  {   
      "resource": "/davistest",
      "path": "/davistest",
      "httpMethod": "POST",
      "headers": {
        "Accept": "application/json",
        "Authorization": "Token 933c9f58-4817-73c5-9796-6933df4b7ca9",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-Mobile-Viewer": "false",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Viewer-Country": "US",
        "content-type": "application/json",
        "Host": "ipjz8mriud.execute-api.eu-west-1.amazonaws.com",
        "Via": "1.1 e74f6a762a10013d708a25452cd645de.cloudfront.net (CloudFront)",
        "X-Amz-Cf-Id": "8oQZv_9j0EJ_7rJ82NYJetsKGdKjZxgq-kmNEcdkFtTURJJzPg1D2g==",
        "X-Amzn-Trace-Id": "Root=1-5ae02713-b8973903d9ab258ffa48961c",
        "x-davis-custom-action-event": "fullTextInterception",
        "x-davis-custom-action-type": "override",
        "x-dynatrace": "FW2;1096801002;29;1167762650;30641;0;-1375292470",
        "X-Forwarded-For": "52.0.97.215, 54.239.145.9",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https"
      },
      "queryStringParameters": null,
      "pathParameters": null,
      "stageVariables": null,
      "requestContext": {
        "resourceId": "x7t8c4",
        "resourcePath": "/davistest",
        "httpMethod": "POST",
        "extendedRequestId": "F4sK_EA1DoEF8qQ=",
        "requestTime": "25/Apr/2018:06:58:27 +0000",
        "path": "/dev/davistest",
        "accountId": "474167723383",
        "protocol": "HTTP/1.1",
        "stage": "dev",
        "requestTimeEpoch": 1524639507124,
        "requestId": "0dd4d763-4856-11e8-ac00-776183d9f915",
        "identity": {
          "cognitoIdentityPoolId": null,
          "accountId": null,
          "cognitoIdentityId": null,
          "caller": null,
          "sourceIp": "52.0.97.215",
          "accessKey": null,
          "cognitoAuthenticationType": null,
          "cognitoAuthenticationProvider": null,
          "userArn": null,
          "userAgent": null,
          "user": null
        },
        "apiId": "ipjz8mriud"
      },
      "body": "{\"type\":\"override\",\"event\":\"fullTextInterception\",\"user\":\"mark.linders@planonsoftware.com\",\"payload\":{\"text\":\"stop\"}}",
      "isBase64Encoded": false   
  };

  async function exportsHandlerFunctionInLambda(event, context, callback) {
    console.log(event);
   async function getsqs() {
      var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
      var params = {
        QueueUrl: queueURL,
        AttributeNames: ['all'],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ['all'],
        VisibilityTimeout: 0,
        WaitTimeSeconds: 20
      };
      var promise = sqs.receiveMessage(params).promise(); 
      var returnnow = await promise;
      return returnnow;
    }

    let AWS = require('aws-sdk');
    AWS.config.update({region: 'eu-west-1'});
      try {
        var body = JSON.parse(event.body);
        var eventtype = body.type;
        switch (eventtype) {
          case "override":
            switch(body.event){
              case "fullTextInterception":
                if (body.payload.text.includes('cockpit')) {
                  var queueURL = 'https://sqs.eu-west-1.amazonaws.com/474167723383/malind-testqueue';
                  var result = await getsqs();
                  var body = JSON.parse(result.Messages[0].Body);    
                  return callback (null, 
                  {
                    statusCode: 200,
                    body: JSON.stringify({
                      delegate: false,
                      confirmation: false,
                      response: {
                        "text": 'Origin: ' + body.origin + '. ' + 'Occured: ' + body.occured + '. ' + body.message + '. ',
                        "card": {
                          "color": "red"
                        }
                      }
                    })
                  });
                }  
              if (body.payload.text.includes('no'))  {
                return callback (null,
                { 
                  statusCode: 200,
                  body: JSON.stringify({
                    delegate: true,
                    confirmation: false,
                  })
                });
              }
              if (body.payload.text.includes('help'))  {
                return callback (null,
                { 
                  statusCode: 200,
                  body: JSON.stringify({
                    delegate: false,
                    confirmation: false,
                    response: {
                      "text": 'Calling help will not help you!',
                      }
                  })
                });
              }
                
              default:
              return callback (null,
                { 
                  statusCode: 200,
                  body: JSON.stringify({
                    delegate: false,
                    confirmation: false,
                    response: {
                      "text": 'Sorry, I don`t know: ' + body.payload.text + '.',
                      "card": {
                        "color": "blue"
                        }
                      }
                  })
                });
            }
          case "confirmed":
            console.log(`CONFIRMED REQUEST`);
            break;
          default:
            context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);
        }
      } 
      catch(error) {console.log("ERROR")}
  }

  var callbackkris = await exportsHandlerFunctionInLambda(event ,"context",fakeAmazonCallaback);
  console.log("callback : " +callbackkris)

  function fakeAmazonCallaback(test1,test2) {
    console.log("test1 :" +test1);  
    console.log("test2 :" +test2.body);
  }

}
amazonLamdbaRunner();
