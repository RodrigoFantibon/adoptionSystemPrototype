import { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../../contextApi/ThemeContext';
import style from './chat.module.css';
import userImage from '../../imgs/user.png';

export function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [getLastMessagem, setGetLastMessagem] = useState([]);
  
  const { getLocalStorage, socket } = useContext(ThemeContext);
  const { state } = useLocation();

  const [ getReceiver, setGetReceiver ] = useState({});

  const messagesContainerRef = useRef();

  const [ongID , setOngID] = useState('');
  const [userID , setUserID] = useState('');
  const [aux , setAux] = useState('');

  const {
    id,
    typeCad
  } = getLocalStorage()

  const getPerfil = () => {
    if(typeCad === 'user'){
      setUserID(id);
    } else {
      setOngID(id);
    }
  }

  

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const messageText = inputValue.trim();
    console.log("inputValue", messageText)


    var messageTextInformation = {
      sender: id,
      receiver: state ? state.ong_id : getReceiver,
      message: messageText
    }

  
    if (messageText !== '') {
      // const room_id = `${state.user_id}-${state.ong_id}`;
      socket.emit('message', { user_id: typeCad == 'user' ?  userID : aux, ong_id: ongID ? ongID : aux, message: messageTextInformation });
      
      console.log("user_idddx", typeCad == 'user' ?  userID : aux)
      console.log("ong_idddx", state ? state.ong_id : ongID)

      console.log("AUX", aux)


      setMessages([...messages, messageTextInformation]);
      setInputValue('');
    }
  };


  const getChats = async () => {
    const params = {}
    if(typeCad === 'user'){
      params.user_id = id;
    } else {
      params.ong_id = id;
    }

    const response = await axios.get('http://localhost:8000/api/chats', {
      params
    });

    setChats(response.data);
    getLastMessagens(response.data)
    console.log("CHATS", response.data)
    console.log("STATEEEEE", state)

 
  
    if(state){
      choseChat(state.ong_id)
    }
    // else {
    //   choseChat(IDrecived)
    // }
  }



  const choseChat = async (toId) => {
    const params = {}

    if(typeCad === 'user'){
      params.user_id = id;
      params.ong_id = toId;
    } else {
      params.ong_id = id;
      params.user_id = toId;
    }

    console.log("ID_USER", toId)
    console.log("Params in choseChat:", params);
    socket.emit('join-room', params)
  }

  const getLastMessagens = async (chats) => {
      chats.map((chat) => {
      chat.mensagens = JSON.parse(chat.mensagens);
      setGetLastMessagem(chat.mensagens[chat.mensagens.length - 1])
    });
  };

  useEffect(() => {
    getPerfil();
    getChats();
  
    if (socket) {
      socket.on('join-room-response', (message) => {
        setMessages(JSON.parse(message.messages));
      });
  
      socket.on('message-response', (response) => {
        if (response.status === 'success') {
          setMessages((prevMessages) => [...prevMessages, response.message]);
        }
      });
    }
  
    return () => {
      if (socket) {
        socket.off('join-room-response');
        socket.off('message-response');
      }
    };
  }, [socket, state]);

  useEffect(() => {
    // Rola até o final do contêiner de mensagens quando novas mensagens são adicionadas
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Rola para a última mensagem quando o componente monta ou as mensagens mudam
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  socket.on('join-room-response', (message) => {
    setMessages((prevMessages) => JSON.parse(message.messages));
    console.log("MESSAGES", JSON.parse(message.messages));
  });

  // const createChatOrJoin = (IDrecived) => {
  //   socket.emit('create-room', { user_id: (typeCad == 'user' ? id : IDrecived) , ong_id: (typeCad == 'user' ? IDrecived : id) })
  //   console.log("YYYY USER ID", id)
  //   console.log("XXX ID RECEIVED", IDrecived)
  // }
 
  return (
    <div className={style.container}>
      <div className={style.chat_container}>
        {chats.map((chat, index) => (
          <div 
            key={index}
            className={style.chat_user}
            onClick={() => {
              choseChat(chat.chat.id);
              setGetReceiver(chat.chat.id);
              setAux(chat.chat.id);
              // createChatOrJoin(chat.chat.id);
              // setIDrecived(chat.user_id); 
            }}>
            <img className={style.chat_user_image} src={userImage} alt="" />
            <div className={style.chat_user_text}>
              <strong>{chat.chat.name}</strong>
              <p>{chat.mensagens.length > 0 ? chat.mensagens[chat.mensagens.length - 1].message : ''}</p>
            </div>
          </div>
        ))}
      </div>
      
      
      <div className={style.message_container}>
        <div className={style.messages} ref={messagesContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`${message.sender === id ? style.message_send : style.message_recive}`}>
              <p className={style.message}>
              {message.message}
              </p>
            </div>
          ))}
        </div>


        <form onSubmit={handleFormSubmit} className={style.input_container}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            className={style.input_field}
          />
          <button type="submit" className={style.input_button} >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}