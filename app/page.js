'use client'
import { Stack, Box, TextField, Button, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Head from 'next/head';




export default function Home() {
  const [messages, setMessages] = useState([
    {
    role: 'assistant',
    content: `Hi, I'm the Gainful Support Agent, how can I assist you today?`,
    },
  ])

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async() => {
    setMessage('')
    setMessages((messages) =>[
      ...messages,
      {role: "user", content: message}, 
      {role: "assistant", content: ''}
    ])
    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result =''
      return reader.read().then(function processText({done, value}){
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream: true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return[
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ]
        })
        return reader.read().then(processText)
      })
    })

  }

  const handleKeyPress = (event) => {
    if (event.key == 'Enter' && !event.shiftKey){
      event.preventDefault()
      sendMessage()
    }
  }
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  return(
    <>
    <Box
    width="100vw"
    height="100vh"
    bgcolor="#F8F4F0"
    display="flex"
    flexDirection="column"
    >

      {/* header */}
      <Box
      maxWidth
      height={100}
      bgcolor={"#204D46"}
      display="flex" 
      alignItems="center"
      justifyContent="center"
      >
        <Typography
         variant="h4" 
         color="white" 
         >
          {/* find font */}
          GAINFUL CUSTOMER SUPPORT
        </Typography>
      </Box>
      
      <Box
      sx={{flex: 1}}
      m={5}
      display="flex"
      flexDirection={"row"}
      gap={10}
      >
        {/* Chat History */}
        <Box
        width={350}
        height="100%"
        bgcolor={"white"}
        borderRadius={4}
        display="flex"
        justifyContent={"center"}
        >
          <Typography
          mt={2}
          fontWeight="bold"
          >
            Chat History
          </Typography>
        </Box>

        {/* Chat */}
        <Stack
        sx={{flex: 1}}
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
        maxHeight={530}>
          {
            messages.map((message, index) => (
              <Box key={index} display = "flex" justifyContent={
                message.role == 'assistant' ? 'flex-start' : 'flex-end'
              }>
                <Box bgcolor={
                  message.role == 'assistant' ? 'white' : '#204D46'
                }
                color={message.role == 'assistant' ? 'black' : 'white'}
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
          sx={{bgcolor: "#DBDE8D", borderColor: "#DBDE8D", color: "white",
              '&:hover':{bgcolor: "#76915e", borderColor: "#76915e"} }}
          >
            Send
          </Button>
          
        </Stack>
          
        </Stack>
      </Box>
    </Box>


    </>
  )
}