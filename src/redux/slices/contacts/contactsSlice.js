import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { useSelector } from 'react-redux';


const initialState = {
  users: {}, //users={ unread: count}
  
}

/**
 * STATE BODY
 * 
 * users: {
 *    "username": {
 *         "unreadMessages": count,
 *         "messages": {
 *              "messageId": "timestamp based id, microsecond scale",
 *              "timestamp": "matches id",
 *              "content": "message body"
 *          } 
 *      }
 * }
 */


export const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.users[action.payload.name] = { 
        unreadMessages : action.payload.unread,
        messages: {}
      } //.push(user)
    },
    addUnreadCount: (state, action) =>{
      const currentUsers = {...state.users }; //construct new array/object immutably
      let { name, messageId  } = action.payload;
      //if message is not received already, add to the unread queue
      if(!(messageId in currentUsers[name].messages)){
        state.users[name].unreadMessages += 1;
      }
    },
    addMessage: (state, action ) => {
      const currentUsers = {...state.users };
      let { name, message  } = action.payload;
      let { messageId } = message;
      //at times xmpp server sends duplicate messages, check for message-id
      if(!(messageId in currentUsers[name].messages)){
        state.users[name].messages[messageId] =  message;
      }
    }
  },
});

export const loadConnectedUsers =  () => dispatch => {
     axios.post("http://localhost:5445/api/registered_users",{ host: "localhost"}).then(response=>{
      response.data.map(user => {   
        dispatch(addUser({ 
          name: user,
          unread: 0
        }))  
      });
        
        
     }).catch(error=>{
      console.log(error);
     });
  }

export const addUserUnreadMessagesCount =  (user) => dispatch => {
     dispatch(addUnreadCount({ name: user }));
 }



export const { addUser, addUnreadCount, addMessage } = contactsSlice.actions;

export default contactsSlice.reducer;
