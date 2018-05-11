let AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});

exports.handler = async (event, context, callback) => {
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
};
