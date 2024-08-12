'use client'
import { Stack, Box, TextField, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Head from 'next/head';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import { db } from "@/firebase";
import { collection, addDoc, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I'm the Gainful Support Agent, how can I assist you today?`,
    },
  ]);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [docId, setDocId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const updateConversation = async (docId, conversation) => {
    try {
      const docRef = doc(db, 'conversations', docId);
      await updateDoc(docRef, {
        messages: conversation,
        timestamp: new Date(),
      });
      console.log(`Updated conversation with ID: ${docId}`);
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };
  
  
  
  const saveConversation = async (conversation) => {
    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        messages: conversation,
        timestamp: new Date(),
      });
      console.log('Conversation saved with ID: ', docRef.id);
      
      setConversations(prevConversations => {
        const updatedConversations = [
          { id : docRef.id, messages: conversation, timestamp: new Date() },
          ...prevConversations
        ];

        if (updatedConversations.length > 5) {
          deleteOldestConversation(updatedConversations[updatedConversations.length - 1].id);
          return updatedConversations.slice(0, 5);
        }

        return updatedConversations;
      });

      setDocId(docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const deleteOldestConversation = async (conversationId) => {
    try {
      const docRef = doc(db, 'conversations', conversationId);
      await deleteDoc(docRef);
      console.log(`Deleted oldest conversation with ID: ${conversationId}`);
    } catch (e) {
      console.error('Error deleting document: ', e);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' }
    ];

    setIsLoading(true);
    setMessage('');
    setMessages(newMessages);

    let currentDocId = docId;

    if (user) {
      if (selectedConversation && !isNewChat) {
        await updateConversation(selectedConversation.id, newMessages);
      } else {
        currentDocId = await saveConversation(newMessages);
        setDocId(currentDocId);
        setIsNewChat(false);
      }
    }
    
    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      await reader.read().then(function processText({ done, value }) {
        if (done) {
          if (user && currentDocId) {
            updateConversation(currentDocId, [...newMessages, { role: 'assistant', content: result }]);
          } 
          setIsLoading(false);
          return result;
        }

        const text = decoder.decode(value || new Int8Array(), { stream: true });
        result += text;

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          const updatedMessages = [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ];

          if (user && currentDocId) {
            updateConversation(currentDocId, updatedMessages);
          }

          return updatedMessages;
        });

        return reader.read().then(processText);
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    const querySnapshot = await getDocs(collection(db, 'conversations'));
    const fetchedConversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortedConversations = fetchedConversations.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

    setConversations(sortedConversations);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation && !isNewChat) {
      setMessages(selectedConversation.messages);
      setDisabled(true);
    } else if (isNewChat) {
      setMessages([{
        role: 'assistant',
        content: `Hi, I'm the Gainful Support Agent, how can I assist you today?`,
      }]);
      setDisabled(false);
    }
  }, [selectedConversation, isNewChat]);

  const toggleChatHistory = () => {
    if (showChatHistory) {
      setAnimateOut(true);
      setShowOverlay(false);
      setTimeout(() => {
        setShowChatHistory(false);
        setAnimateOut(false);
      }, 300);
    } else {
      setShowChatHistory(true);
      setShowOverlay(true);
    }
  };

  const handleOverlayClick = () => {
    if(showChatHistory) {
      toggleChatHistory();
    }
  }

  const handleChatHistoryClick = (conversation) => {
    setSelectedConversation(conversation);
    setIsNewChat(false);
    setDisabled(true);
    setShowOverlay(false);
    setAnimateOut(true); 
    setTimeout(() => {
      setShowChatHistory(false); 
      setAnimateOut(false); 
    }, 300); 
  };

  return (
    <>
      <Head>
        <title>Gainful Customer Support</title>
        <meta name="description" content="Gainful customer support page." />
      </Head>
      <Box
        width="100vw"
        height="100vh"
        bgcolor="#F8F4F0"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          padding="2%"
          height={80}
          bgcolor={"#204D46"}
        >
          <Box
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            flex="1"
          >
            <Button
              onClick={toggleChatHistory}
              sx={{
                minWidth: 'auto',
                color: 'white',
              }}
            >
              <HistoryIcon />
            </Button>
          </Box>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex="1"
          >
            <Box
              component="img"
              sx={{
                height: 50,
                width: 50,
              }}
              alt="Logo"
              src="https://www.gainful.com/_next/image/?url=https%3A%2F%2Fdlye1hka1kz5z.cloudfront.net%2F_next%2Fstatic%2Fmedia%2Flogo-light.082ab69b.webp&w=1200&q=75"
            />
          </Box>

          {showOverlay && (
            <Box
              position="fixed"
              top="0"
              left="0"
              width="100vw"
              height="100vh"
              bgcolor="rgba(0, 0, 0, 0.5)"
              zIndex="10"
              onClick={handleOverlayClick}
              />
          )}

          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            flex="1"
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: user ? 'red' : '#edff79',
                '&:hover': {
                  bgcolor: user ? 'darkred' : '#a6b355',
                },
                color: '#204D46',
                fontWeight: 'bold',
              }}
              onClick={() => {
                if (user) {
                  auth.signOut();
                } else {
                  window.location.href = '/login';
                }
              }}
            >
              {user ? 'Logout' : 'Login'}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{ flex: 1 }}
          m={5}
          display="flex"
          flexDirection={"row"}
          gap={10}
        >
          {/* Chat History */}
          {user && showChatHistory && (
            <Box
              width={320}
              height="auto"
              paddingBottom={4}
              bgcolor={"#204D46"}
              color={"white"}
              borderRadius={3}
              display="flex"
              alignItems={"center"}
              flexDirection="column"
              sx={{
                animation: animateOut ? 'fadeSlideOut 0.3s forwards' : 'fadeSlideIn 0.3s forwards',
                position: 'absolute',
                zIndex: 10,
              }}
            >
              <Typography
                my={2}
                fontWeight="bold"
              >
                Chat History
              </Typography>

              <Box
                width={270}
                height={60}
                bgcolor="#F5F5F5"
                borderRadius={3}
                display="flex"
                alignItems={"center"}
                justifyContent={"center"}
                mb="2rem"
                onClick={() => {
                  setSelectedConversation(null)
                  setIsNewChat(true)
                  setDisabled(false);
                  setShowOverlay(false);
                  setTimeout(() => {
                    setShowChatHistory(false); 
                    setAnimateOut(false); 
                  }, 300); 
                }}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="h2" color={"#7F928F"} paddingBottom={2}>
                  +
                </Typography>
              </Box>

              <Stack spacing={2} width={270} height={360} overflow="auto">
                {conversations.map((conversation) => (
                  <Box
                    key={conversation.id}
                    width="100%"
                    height={100}
                    borderRadius={3}
                    p={2}
                    bgcolor={selectedConversation?.id === conversation.id ? "#edff79" : "#F5F5F5"}
                    onClick={() => handleChatHistoryClick(conversation)}
                    sx={{ cursor: 'pointer', }}
                  >
                    <Typography variant="body2" color={selectedConversation?.id === conversation.id ? "#204D46" : "#204D46"}>
                      {conversation.messages[conversation.messages.length - 1]?.content.substring(0, 50)}...
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Chat */}
          <Stack
            sx={{ flex: 1 }}
            height="100%"
            direction="column"
            p={2}
            spacing={2}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="68vh"
            >
              {
                messages.map((message, index) => (
                  <Box key={index} display="flex" justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  }>
                    <Box bgcolor={
                      message.role === 'assistant' ? 'white' : '#204D46'
                    }
                      color={message.role === 'assistant' ? 'black' : 'white'}
                      borderRadius={6.8}
                      px={3}
                      py={2}
                      fontSize={13}
                      lineHeight={2}
                      maxWidth="75%"
                      >
                      {message.content}
                    </Box>
                  </Box>
                ))
              }
              <div ref={messagesEndRef} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                placeholder="Ask a question"
                bgcolor="white"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{
                  "& fieldset": { border: 'none' },
                  '& .MuiInputBase-input': {
                    backgroundColor: 'white',
                    borderRadius: '20px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'green',
                    borderRadius: '20px',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#204D46',
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                sx={{
                  bgcolor: "#204D46", color: "white",
                  '&:hover': { bgcolor: "#1a3e38" },
                  borderRadius: "20px",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& .MuiButton-endIcon': {
                    marginLeft: '0px',
                    marginRight: '0px',
                  },
                }}
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              >
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <style jsx>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeSlideOut {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  )
}