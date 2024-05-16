require('dotenv').config();

let promptHeaderSystem = "<|start_header_id|>system<|end_header_id|>";
let promptHeaderUser = "<|start_header_id|>user<|end_header_id|>";
let promptEOT = "<|eot_id|>";
let promptHeaderAsst = "<|start_header_id|>assistant<|end_header_id|>";

///// these are used to track the conversation /////
let runningPrompt = "";
let promptContext = " <|begin_of_text|><|start_header_id|>system<|end_header_id|> Your name is CODI. You are a career coach in Singapore's Info-comm Media Development Authority. You are Singaporean and use Singapore slang. Some slang can be found at these sites: 'https://www.timeout.com/singapore/things-to-do/common-singlish-words-you-need-to-know-to-speak-like-a-local' and 'https://mothership.sg/2014/06/17-singlish-words-that-offer-so-much-more-than-english-ones/'. You will respond to the user's query with dry wit and professionalism. Unless the user says otherwise their name is 'Abang/Kakak' which is malay for big brother/big sister. do NOT append the word 'assistant' to your responses. <|eot_id|>";

promptContext = promptContext + promptHeaderSystem + "Keep your reply length to 100 words or less. Your reply should be complete, self-contained and in complete sentences. At the end of each reply, you should state: '[XXX /8K tokens used]', where XXX is the number of tokens used so far."+ promptEOT;

promptContext = promptContext + promptHeaderSystem + "You may refer the user to speak with IMDA senior managment at this link: 'https://www.imda.gov.sg/about-imda/who-we-are/our-team/our-senior-management'"+ promptEOT;

promptContext = promptContext + promptHeaderSystem + "You can also refer to the ICT skills framework at these sites when answering questions about the types of skills required: 'https://www.skillsfuture.gov.sg/skills-framework/ict' and 'https://www.imda.gov.sg/how-we-can-help/techskills-accelerator-tesa/skills-framework-for-infocomm-technology-sfw-for-ict'"+ promptEOT;


const axios = require('axios');
const { App } = require('@slack/bolt');
const signingSecret = process.env['SLACK_SIGNING_SECRET'];
const botToken = process.env['SLACK_BOT_TOKEN'];
const app = new App({
      signingSecret: signingSecret, 
      token: botToken,
      });

///////// This just initiates the conversation ///////
var intro1 = "Hi my name is Coach Codi, a career coach. How can I help you? \n\n[Note: I am currently using Meta Llama 3 8B instruct via Hugging Face Inference API, so bear this in mind when sending info or data to me. My max context length is 8k tokens- you can ask me 'how many tokens']\n"
var intro2 = "Start you query with your name e.g. 'I am Cara and I would like to find out xxxx'. If you don't want to say your name, I will just call you 'Abang/Kakak' :) "

// initialises the starting prompt
runningPrompt = runningPrompt + promptContext;

//adds the two intros to the starting prompt
runningPrompt = runningPrompt + promptHeaderAsst + intro1 + promptEOT+ promptHeaderAsst + intro2 + promptEOT;

// (async () => {
//   // Start the app
//   await app.start(process.env.PORT || 12000);
//   // app.message('hi codi', async({ message, say }) => {
//   //   let resp = await axios.get('https://api.quotable.io/random');
//   //   console.log(message);
    
//   //   const quote = resp.data.content;
//   //   console.log("quote = "+ quote);
//   //   await say(`Hello, <@${message.user}>, ${quote}. ${intro1}`);
//   //   await say(intro2);
//   //   });

//   app.event('app_mention', async ({ event, context, client, say }) => {
//     var mentionedText = event.text.trim().replace(`<@${context.botUserId}>`, '').trim();

//     console.log("mentioned in slack: " + mentionedText);
//     //try {
//       // await say({"blocks": [
//       //   {
//       //     "type": "section",
//       //     "text": {
//       //       "type": "mrkdwn",
//       //       "text": `Thanks for the mention <@${event.user}>! Here's a button`
//       //     },
//       //     "accessory": {
//       //       "type": "button",
//       //       "text": {
//       //         "type": "plain_text",
//       //         "text": "Button",
//       //         "emoji": true
//       //       },
//       //       "value": "click_me_123",
//       //       "action_id": "first_button"
     
      
//       //     }
//       //   }
//       // ]});
//         await say(intro1);
//         await say(intro2);

//       // Subscribe to the message event for the channel
//         app.event('message', async ({ event, context, client }) => {
//           // Check if the message mentions the bot
//           //if (event.text && event.text.includes(`<@${context.botUserId}>`)) {
//               // Extract the text from the message
//             mentionedText = event.text.trim().replace(`<@${context.botUserId}>`, '').trim();

//             // Handle the mentioned text
//             console.log(`Mentioned text: ${mentionedText}`);
//             // You can then perform any actions or respond to the mentioned text accordingly

//             runningPrompt = runningPrompt + promptHeaderUser + mentionedText + promptEOT +promptHeaderAsst;

//             queryL3({"inputs" : runningPrompt}).then((response) => {
//                 console.log(JSON.stringify(response));

//                 //something is up here with the rawReply??
//                 var rawReply = response[0].generated_text;
//                 console.log("raw reply = "+rawReply);
//                 // Respond to the message
//                 var refinedReply = rawReply.split(runningPrompt)[1];
//                 console.log("reply = " + refinedReply);
//                 say(refinedReply);
//                 });

//               runningPrompt = runningPrompt + + promptHeaderAsst+rawReply+promptEOT;

      
//         });

      

        
//       });


      
//     catch (error) {
//        console.error(error);
//     }

//    });



(async () => {
  // Start the app
  await app.start(process.env.PORT || 12000);

  // //// This is for when we @ mention CODI in a channel/////
  let inConversation1 = false;

  app.event('app_mention', async ({ event, context, client, say }) => {
    if (!inConversation1) {
      try {
        inConversation1 = true; // Set conversation status to true

        // Initial response after the mention
        await say(intro1);
        await say(intro2);

        // Function to handle the conversation
        const handleConversation = async (event, context, client) => {
          var mentionedText = event.text.trim().replace(`<@${context.botUserId}>`, '').trim();

          console.log(`Mentioned text: ${mentionedText}`);

          // Check if the user says "bye" to end the conversation
          if (mentionedText.toLowerCase() === 'bye') {
            // If the user says "bye", end the conversation, remove event listeners, and set the flag to false
            await say("Goodbye! Will end this convo :)");
            inConversation1 = false;
            return;
          }

          // Add the user's message to the conversation history
          runningPrompt = runningPrompt+ promptHeaderUser + mentionedText + promptEOT + promptHeaderAsst;

          // Query or process the user's input
          const response = await queryL3({ "inputs": runningPrompt });

          console.log(JSON.stringify(response));

          var rawReply = response[0].generated_text;
          console.log("raw reply = " + rawReply);

          var refinedReply = rawReply.split(runningPrompt)[1];
          console.log("reply = " + refinedReply);

          // Send the response
          await say(refinedReply);

          // Add the bot's reply to the running prompt
          runningPrompt = promptHeaderAsst + rawReply + promptEOT;
        };

        // Listen for messages in the channel to continue the conversation
        app.event('message', async ({ event, context, client }) => {
          // Check if the message is from the same user and not the bot
          if (event.user !== context.botUserId && inConversation1) {
            await handleConversation(event, context, client);
          }
        });

        // Listen for direct mentions to continue the conversation
        app.message(async ({ event, context, client }) => {
          // Check if the message is a direct mention and not from the bot
          if (event.text.includes(`<@${context.botUserId}>`) && event.user !== context.botUserId && inConversation1) {
            await handleConversation(event, context, client);
          }
        });

      } catch (error) {
        console.error(error);
      }
    }
  });




  
  // app.event('app_mention', async ({ event, context, client, say }) => {
  //   var mentionedText = event.text.trim().replace(`<@${context.botUserId}>`, '').trim();

  //   console.log("mentioned in slack: " + mentionedText);

  //   try {
  //     // Initial response after the mention
  //     await say(intro1);
  //     await say(intro2);

  //     // Function to handle the conversation
  //     const handleConversation = async (event, context, client) => {
  //       mentionedText = event.text.trim().replace(`<@${context.botUserId}>`, '').trim();

  //       console.log(`Mentioned text: ${mentionedText}`);
  //       //below works, but need to exit the whole loop//
  //       if (mentionedText.toLowerCase() === 'bye') {
  //           // If the user says "bye", exit the conversation
  //           await say("Goodbye! Will end this convo :)");
  //           app.removeListener('message', handleMessage);
  //           app.removeListener('app_mention', startConversation);
  //         return;
  //       }
        
  //       // Add the user's message to the conversation history
  //       runningPrompt = promptHeaderUser + mentionedText + promptEOT + promptHeaderAsst;

  //       // Query or process the user's input
  //       const response = await queryL3({ "inputs": runningPrompt });

  //       console.log(JSON.stringify(response));

  //       var rawReply = response[0].generated_text;
  //       console.log("raw reply = " + rawReply);

  //       var refinedReply = rawReply.split(runningPrompt)[1];
  //       console.log("reply = " + refinedReply);

  //       // Send the response
  //       await say(refinedReply);

  //       // Add the bot's reply to the running prompt
  //       runningPrompt = promptHeaderAsst + rawReply + promptEOT;
  //     };

  //     // Listen for messages in the channel to continue the conversation
  //     app.event('message', async ({ event, context, client }) => {
  //       // Check if the message is from the same user and not the bot
  //       if (event.user !== context.botUserId) {
  //         await handleConversation(event, context, client);
  //       }
  //     });

  //     // Listen for direct mentions to continue the conversation
  //     app.message(async ({ event, context, client }) => {
  //       // Check if the message is a direct mention and not from the bot
  //       if (event.text.includes(`<@${context.botUserId}>`) && event.user !== context.botUserId) {
  //         await handleConversation(event, context, client);
  //       }
  //     });

  //   } catch (error) {
  //     console.error(error);
  //   }
  // });
///////////////// below is for when we are DMing CODI ///////////////////
  let inConversation = false;

  app.message(async ({ message, say }) => {
    // Convert the message text to lowercase for comparison
    const mText = message.text.toLowerCase();

    if (!inConversation && mText.includes('hi codi')) {
      // Respond to the initial greeting
      await say(intro1);
      await say(intro2);

      // Set conversation flag to true
      inConversation = true;

    } else if (inConversation) {
      // Check if the user says "bye" to end the conversation
      if (mText.includes('bye')) {
        // End the conversation if the user says "bye"
        await say("Goodbye! Will end this convo :)");
        // Reset conversation flag to false
        inConversation = false;
        return;
      }

      // Check if the message includes the command to end the session
      if (mText.includes('end session')) {
        // Respond to end session command
        await say("Session has ended. If you want to start a new session, please restart the bot.");
        // Reset conversation flag to false
        inConversation = false;
        return;
      }

      // Do something with the text
      console.log('Received message:', mText);
      runningPrompt = runningPrompt + promptHeaderUser + mText + promptEOT + promptHeaderAsst;

      queryL3({ "inputs": runningPrompt }).then((response) => {
        console.log(JSON.stringify(response));

        // Something is up here with the rawReply??
        var rawReply = response[0].generated_text;
        console.log("raw reply = " + rawReply);
        // Respond to the message
        var refinedReply = rawReply.split(runningPrompt)[1];
        console.log("reply = " + refinedReply);
        say(refinedReply);
      });

      runningPrompt = runningPrompt + promptHeaderAsst + rawReply + promptEOT;
    }
  });

console.log('⚡️ Bolt app is running! on 12000!');
  
  
})();


// The Slack Chatbot Code Taken from below
// https://www.youtube.com/watch?v=Kdo6BnOnnzE

      //const messageEntry = document.getElementsByClassName("form-control");

// const messageEntry = document.getElementById("website-input");
// messageEntry.addEventListener("keypress", function(event) {
//   if (event.key === "Enter"){
//     console.log("enter key pressed!");
//     sendAsk(document.getElementById("website-input").value);
//   }
// });

/////////////// FUNCTIONS BELOW HERE /////////////

function sendAns(text = '' ){
  document.getElementsByClassName("msg-page")[document.getElementsByClassName("msg-page").length-1].insertAdjacentHTML("beforeend",createOutChat(text));

  runningPrompt = runningPrompt + promptHeaderAsst + text + promptEOT;

  //scroll to bottom of .msg-page id=scrollMsgPg
  document.getElementById("scrollMsgPg").scrollTop = document.getElementById("scrollMsgPg").scrollHeight;
}

function sendAsk(text = '') {

  document.getElementsByClassName("msg-page")[document.getElementsByClassName("msg-page").length-1].insertAdjacentHTML("beforeend",createInChat(text));

    //scroll to bottom of .msg-page id=scrollMsgPg
    document.getElementById("scrollMsgPg").scrollTop = document.getElementById("scrollMsgPg").scrollHeight;


  if (text == "exit"){
    sendAns("goodbye!");
    return;
  }


  console.log("calling sendAns using <"+ text+ ">");
  runningPrompt = runningPrompt + promptHeaderUser + text + promptEOT +promptHeaderAsst;

  console.log("sending this prompt: " +runningPrompt);
  queryL3({"inputs" : runningPrompt}).then((response) => 
    {
    console.log(JSON.stringify(response));
    var rawReply = response[0].generated_text;
    sendAns(rawReply.split(runningPrompt)[1]);
    //sendAns(response[0].generated_text.split("|reply|")[2])
    //sendAns(response[0].generated_text.substring(len(text),len(response[0].generated_text)));
    document.getElementById("website-input").value= "";
    }

  )

  // sendAns(answer);
  //var textr = "noted."
//  document.getElementsByClassName("msg-page")[document.getElementsByClassName("msg-page").length-1].insertAdjacentHTML("beforeend",createOutChat(textr));
}


function createInChat(text = '') {
  var event = new Date();
  var eDate = Date.toString()
  //var eTime = Date.toTimeString();
  var timestamp = event;
  //var timestamp = eTime + " | " + eDate;

  return`
  <div class="received-chats">
  <div class="recevied-chats-img">
    <img src="Cara1.png" />
  </div>
  <div class="received-msg">
    <div class="received-msg-inbox">
      <p>
      ${text}
      </p>

      <span class="time">
      ${timestamp}
      </span>
    </div>
  </div>
</div>
  `;
};

function createOutChat(text = '') {
  var event = new Date();
  var timestamp = event  
  return`
    <div class="outgoing-chats">
    <div class="outgoing-chats-img">
      <img src="codi.png" />
    </div>
    <div class="outgoing-msg">
      <div class="outgoing-chats-msg">
        <p>
        ${text}
        </p>

        <span class="time">${timestamp}</span>
      </div>
    </div>
  </div>
    `;


    //extracted: <span class="time">18:34 PM | July 24</span>
  };


  async function queryL3(data) {
    console.log("queryL3 called on:" + JSON.stringify(data));
    //terminal: $ npm install @dotenvx/dotenvx -g
    //need to put in terminal: npm install dotenv -- save 
   //var hfKey = HF_KEY;
   // console.log("env obtained: "+hfKey);
    var hfKey = process.env['HF_TOKEN'];
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        headers: { 
          Authorization: hfKey,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();

    console.log("queryL3 result: " + result);
    return result;
  }


  async function queryP3(data) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-128k-instruct",
      {
        headers: { Authorization: "" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }

//import fetch from "node-fetch";
async function queryRBS2(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
        {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}
//query({inputs:{question:"What is my name?",context:"My name is Clara and I live in Berkeley."}}).then((response) => {
//    console.log(JSON.stringify(response));
//});