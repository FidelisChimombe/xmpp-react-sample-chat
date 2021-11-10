import { useParams, useLocation } from 'react-router-dom';
import { useState, useContext, useEffect } from "react";
import { Card, CardHeader, CardContent, TextField } from "@mui/material";
import { useSelector } from 'react-redux';
import XMPP from "../utils/xmpp";
const Chat = () => {
  const { username} = useParams();
  const [ newMessage , setNewMessage ] = useState("");
  const users = useSelector((state) => state.contacts.users);
  const location = useLocation();
  const [ messages, setMessages ] = useState([]);



  const handleSendMessage = () =>{
    if(newMessage.trim().length > 0){
      XMPP.sendMessage(newMessage,`${username}@localhost`);
     // XMPP.sendMessage(newMessage,`user1@localhost`);
      setNewMessage("");
    }
  }

  const handMessageChange = (e) => {
    setNewMessage(e.target.value);
  }
  useEffect(()=>{
    setMessages(users[username].messages)
  },[]);

  return (
   <Card style={{ width: '100%', height: '100%'}}>
    <CardHeader title={`Chatting with : ${username}`}/>
    <CardContent>
      {
        Object.keys(users[username].messages).map(id=>{
          let msg = users[username].messages[id];
          return <p key={id} >FROM: {username} : {msg.content} - {msg.timestamp} </p>
        })
      }

      <TextField 
        style={{ position: "fixed", bottom: 10, width:'800px'}}
        value = {newMessage}
        onChange = { handMessageChange }
        placeholder={`Say hi ${username}`}
        fullWidth
        onKeyUp ={(e) => {
          if(e.key === 'Enter') { 
            handleSendMessage();
          }
        }}

        />
    </CardContent>
   </Card>
      


  );
};

export default Chat;