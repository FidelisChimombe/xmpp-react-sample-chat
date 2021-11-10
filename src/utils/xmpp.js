import { client , xml } from '@xmpp/client';
import debug from '@xmpp/debug';
// import { addUserUnreadMessagesCount } from '../redux/slices/contacts/contactsSlice';

import { addUnreadCount, addMessage } from '../redux/slices/contacts/contactsSlice';
import { store } from '../redux/store';
import { DateTime } from "luxon";

class XMPP {
  constructor(){
    this.isConnected = false;
    this.xmpp = client({
      service:  "ws://localhost:5280/xmpp-websocket",
      domain: "localhost",
      username: "user1",
      password: "user1"
    });
  }

  isMessageCarbonCopy(message){
    //carbons are sent by xmpp server iff bare jid and full jid belong to the same user.
    let { children, attrs: {from, to } } = message;
    from = from.split("@")[0];
    to = to.split("@")[0];
    if(from !== to ){
      return false;
    }
    //the first child attrs object xmlns - value determines if 
    let firstChild = children[0];
    let { xmlns=null } = firstChild.attrs;

    if(xmlns === "urn:xmpp:carbons:2"){
      return true;
    }

    return false;

  }

  extractCarbonCopyMessage(message){
    let firstLevelChild = message.children[0]; //first level child - xmlns=urn:xmpp:carbons:2
    let secondLevelChild = firstLevelChild.children[0]; //second level child - xmlns=urn:xmpp:forward:0
    let thirdLevelChild = secondLevelChild.children[0]; //third level child - carbon copy message xmlns='jabber:client' attrs, lang, to, from, type --carbon copy message send from the server
    //at 3rd levelChild - we now have carbon copy message - just like normal chat message send from another user
    let stanzaMessage = thirdLevelChild;
    let messageContent = stanzaMessage.getChildText('body');
    let { from, to  } = stanzaMessage.attrs;
    let messageId;
    for (let i=0; i< stanzaMessage.children.length; i++){
      let child = stanzaMessage.children[i];
      if(child.name === "stanza-id"){
        messageId = child.attrs.id;
        break;
      }
    }

    return { messageId, messageContent, from, to}
    
  }
  

  addListeners(){
    this.xmpp.on("error", (err) => {
      console.error(err);
    });
  
    this.xmpp.on("offline", () => {
      console.log("offline");
    });
  
    this.xmpp.on("stanza", async (stanza) => {
      if (stanza.is("message")) {
        let message = stanza;
    
        let isCarbonCopy = this.isMessageCarbonCopy(message);
        if(isCarbonCopy){
          console.log("*******Message is carbo copy")
          console.log(message)
          let carbonCopyMessage = this.extractCarbonCopyMessage(message);
          let { messageId, messageContent, to } = carbonCopyMessage;
          let toName = to.split("@")[0];
          //you want to use the to - value to update the message queue in your client
          //no need to update the unread count, because you are just syncing your clients
          store.dispatch(addMessage({
            name: toName,
            message: {
              messageId,
              timestamp: messageId,
              content: messageContent
            }
          }));
        }else{
          //all children contain attrs , which come with message id, using the first child
          let messageId = message.children[0].attrs.id;
          let messageContent = message.getChildText('body');
          let { from , type, id , to,  'xml:lang': lang } = message.attrs;
          //  console.log(`FROM : ${from}, TO: ${to}, ID: ${id}, Language: ${lang}`);
          const fromName = from.split("@")[0];
          store.dispatch(addUnreadCount({ messageId, name: fromName }));
          store.dispatch(addMessage({
            name: fromName,
            message: {
              messageId,
              timestamp: messageId,
              content: messageContent
            }
          }));
        }
         
        //await this.xmpp.send(xml("presence", { type: "available" }));
        //await xmpp.stop();
      }else if(stanza.is("presence")){
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&& PRESENCE COMING IN&&&&&&&&&&&&&&&&&&")
     
   

  
  
      }else if(stanza.is('iq')){
    
      
      }
    });
  
    this.xmpp.on("online", async (address) => {
      // Makes itself available
      await this.xmpp.send(xml("presence"));
      /**
       * Sending IQ - examples
       * when you become online, register to the server to receive carbon copies
       * The messages arrive as forwarded messages
       * the from address is confusing - to and from are equal, I want the to to be of the user I intended to send to
       * The forwarded message lacks some properties like stanza-id, archived, active, origin-id, body
       *    --- to get full messages you want to include username@host/resource not just username@host - 
       *      follow section 7 for leads - "user2@localhost/1566191087372139796830788"
       *   https://xmpp.org/extensions/attic/xep-0280-0.9.html
       */
      

      await this.xmpp.send(xml('iq', {
        xmlns: 'jabber:client',
        from: 'user1@localhost',
        id: 'enable1',
        type: 'set',
        }, xml('enable', {
            xmlns: 'urn:xmpp:carbons:2',
        })))
      
      
    });
  }

  connect(){
    this.xmpp.start().catch(debug);
    this.isConnected = true;
  }

  startService(){
    this.addListeners();
    this.connect();
  }

  async sendMessage(messageBody, to){
    if(this.isConnected){
      let messageId = Math.round((window.performance.now() + window.performance.timeOrigin) * 1000)
      //performace now gives time in mill second, and performance,timeOrigin is time of origin with micro-scale
      const message = xml(
        "message",
        { type: "chat", to: to, from: 'user1@localhost' },
        xml("body", { }, messageBody), 
        //by default sending client doesn't receive carbon copy
        //to update the sending client, we can generate fakeid for the client
      );
      // const  message = xml("message", { type: "chat", to: to, from: 'user1@localhost' } );
      // message.c('body',{ xmlns: 'urn:xmpp:carbons:2' })
      //        .t(messageBody).up();
      
      await this.xmpp.send(message);
      let toName = to.split("@")[0];
      store.dispatch(addMessage({
        name: toName,
        message: {
          messageId,
          timestamp: messageId,
          content: messageBody
        }
      }));
    }
  }
}


export default new XMPP();