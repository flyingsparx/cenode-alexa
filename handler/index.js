'use strict';

const Alexa = require('alexa-sdk');
const http = require('http');

function sendData (data, callback){
  const options = {                                                                                                                                                               
    hostname: 'explorer.cenode.io',
    path: '/sentences',
    port: 7777,
    method: 'POST',
  };
  const request = http.request(options, res => {                                                                                                                   
    let response = '';
    res.on('data', chunk => response += chunk)
    res.on('end', () => callback && callback(response));
  });
  request.on('error', () => { /* continue anyway */ });
  request.write(data);
  request.end();
}

const handlers = {
  'CENodeInteraction' () {
    const sentence = this.event.request.intent.slots.Sentence.value;
    sendData(sentence, response => {

      /* Send CENode response back to Alexa service as a 'tell' */
      this.emit(':tell', response);
    
      /* if response is thought to be a CE response (i.e. to 'confirm' NL),
       * we auto-confirm by saying the same thing back:
       */
      if (response != sentence && (response.indexOf('the ') === 0 || response.indexOf('there is ') === 0)){
        sendData(response);
      }
    });
  },

  /* Required additional handlers */
  'AMAZON.HelpIntent' () {
    this.emit(':ask', 'Try asking a question or submitting some information! For example, ask me "what is Saturn?".');
  },
  'AMAZON.CancelIntent' () {
    this.emit(':tell', 'Bye');
  },
  'AMAZON.StopIntent' () {
    this.emit(':tell', 'Bye');
  },
};

exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = 'App ID';
  alexa.registerHandlers(handlers);
  alexa.execute();
};

