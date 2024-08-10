'use client'
import { Stack, Box, TextField, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Head from 'next/head';
import SendIcon from '@mui/icons-material/Send';
import { db } from "@/firebase";
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { auth } from './config/firebaseConfig';
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
  const [user, setUser] = useState(null); // User state for authentication

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  const saveConversation = async (conversation) => {
    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        messages: conversation,
        timestamp: new Date(),
      });
      console.log('Conversation saved with ID: ', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const updateConversation = async (docId, conversation) => {
    try {
      const docRef = doc(db, 'conversations', docId);
      await updateDoc(docRef, {
        messages: conversation,
        timestamp: new Date(),
      });
    } catch (e) {
      console.error('Error updating document: ', e);
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
          saveConversation(newMessages);
          setIsLoading(false);
          return result;
        }

        const text = decoder.decode(value || new Int8Array(), { stream: true });

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
          updateConversation(updatedMessages);
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

  return (
    <>
      <Head>
        <title>Gainful Customer Support</title>
      </Head>
      <Box
        width="100vw"
        height="100vh"
        bgcolor="#F8F4F0"
        display="flex"
        flexDirection="column"
      >
        {/* Login Status Button */}
        <Box
          position="absolute"
          top={10}
          left={10}
        >
          <Button
            variant="contained"
            sx = {{
              bgcolor: user ? 'red' : 'green',
              '&:hover': {
                bgcolor: user ? 'darkred' : 'darkgreen',
              },
              color: 'white'
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

        {/* Header */}
        <Box
          maxWidth
          height={90}
          bgcolor={"#204D46"}
          display="flex"
          alignItems="center"
          justifyContent="center"
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

        <Box
          sx={{ flex: 1 }}
          m={5}
          display="flex"
          flexDirection={"row"}
          gap={10}
        >
          {/* Chat History */}
          <Box
            width={320}
            height="100%"
            bgcolor={"white"}
            borderRadius={3}
            display="flex"
            alignItems={"center"}
            flexDirection="column"
          >
            <Typography
              my={2}
              fontWeight="bold"
            >
              Chat History
            </Typography>

            <Box
              width={270}
              length={100}
              mb={4}
            >
              <TextField
                placeholder="Search chats"
                bgcolor="#F5F5F5"
                fullWidth
                sx={{
                  "& fieldset": { border: 'none' },
                  '& .MuiInputBase-input': {
                    backgroundColor: '#F5F5F5',
                  },
                  '&:hover fieldset': {
                    borderColor: 'green',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#204D46',
                  }
                }}
              />
            </Box>

            <Box
              width={270}
              height={100}
              bgcolor="#204D46"
              borderRadius={3}
              mb={2}
            >
            </Box>
            <Box
              width={270}
              height={100}
              bgcolor="#F5F5F5"
              borderRadius={3}
              mb={2}
              display="flex"
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Typography variant="h2" color={"#7F928F"}>
                +
              </Typography>
            </Box>
          </Box>

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
              maxHeight={540}>
              {
                messages.map((message, index) => (
                  <Box key={index} display="flex" justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  }>
                    <Box bgcolor={
                      message.role === 'assistant' ? 'white' : '#204D46'
                    }
                      color={message.role === 'assistant' ? 'black' : 'white'}
                      borderRadius={4}
                      px={3}
                      py={2}
                      fontSize={13}>
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
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                sx={{
                  "& fieldset": { border: 'none' },
                  '& .MuiInputBase-input': {
                    backgroundColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'green',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#204D46',
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={sendMessage}
                disabled={isLoading}
                sx={{
                  bgcolor: "#edff79", borderColor: "#edff79", color: "black",
                  '&:hover': { bgcolor: "#76915e", borderColor: "#76915e" }
                }}
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              >
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  )
}
