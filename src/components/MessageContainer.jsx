import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import Message from './Message'
import MessageInput from './MessageInput'
import useShowToast from '../hooks/useShowToast'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { conversationAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import { useState } from 'react'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'

const MessageContainer = () => {
    const showToast = useShowToast();
    const selectedConvo = useRecoilValue(selectedConversationAtom)
    const [loadingMessage, setLoadingMessage] = useState(true)
    const [messages, setMessages] = useState([])
    const currentUser = useRecoilValue(userAtom)
    const {socket} = useSocket();
    const setConvo = useSetRecoilState(conversationAtom)
    const messageEndRef = useRef()

    useEffect(() => {
        socket.on('newMessage', (message) => {
            if(selectedConvo._id === message.conversationId){
                setMessages((prevMessages) => [...prevMessages, message])
            }
            
            setConvo((prev) => {
                const updatedConvo = prev.map(convo => {
                    if(convo._id === message.conversationId){
                        return {
                            ...convo,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender,
                            }
                        }
                    }
                    return convo
                })
                return updatedConvo
            })
        })


        return () => socket.off('newMessage')
    }, [socket, selectedConvo, setConvo])

    useEffect(() => {
        const lastMessageIsFromUser = messages.length && messages[messages.length - 1].sender !== currentUser._id
        if(lastMessageIsFromUser){
            socket.emit('markMessageAsSeen', {
                conversationId: selectedConvo._id,
                userId : selectedConvo.userId
            })
        }

        socket.on('messagesSeen', ({conversationId}) => {
            if(selectedConvo._id === conversationId){
                setMessages(prev => {
                    const updatedConvo = prev.map(message => {
                        if(!message.seen){
                            return {
                                ...message,
                                seen: true
                            }
                        }
                        return message
                    })
                    return updatedConvo
                })
            }
        })
    }, [socket, currentUser._id, messages, selectedConvo])

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({
            behavior : 'smooth'
        })
    }, [messages])

    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessage(true)
            setMessages([])
            try {
                if(selectedConvo.mock) return
                const res = await fetch(`/api/message/${selectedConvo.userId}`)
                const data = await res.json()
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setMessages(data)
            } catch (err) {
                showToast('Error', err, 'error')
            } finally {
                setLoadingMessage(false)
            }
        }

        getMessages()
    }, [showToast, selectedConvo.userId, selectedConvo.mock])
    return (
        <Flex
            flex='70'
            bg={useColorModeValue("gray.200", "gray.dark")}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
        >
            {/* Message header */}
            <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
                <Avatar src={selectedConvo.userProfilePic} size={"sm"} />
                <Text display={"flex"} alignItems={"center"}>
                    {selectedConvo.username} <Image src='/verified.png' w={4} h={4} ml={1} />
                </Text>
            </Flex>

            <Divider />

            <Flex flexDir={"column"} gap={4} my={4} p={2} height={"400px"} overflowY={"auto"}>
                {loadingMessage &&
                    [...Array(5)].map((_, i) => (
                        <Flex
                            key={i}
                            gap={2}
                            alignItems={"center"}
                            p={1}
                            borderRadius={"md"}
                            alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                        >
                            {i % 2 === 0 && <SkeletonCircle size={7} />}
                            <Flex flexDir={"column"} gap={2}>
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />
                            </Flex>
                            {i % 2 !== 0 && <SkeletonCircle size={7} />}
                        </Flex>
                    ))}

                {!loadingMessage &&
                    messages.map((message) => (
                        <Flex
                            key={message._id}
                            direction={"column"}
                            ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}
                        >
                            <Message message={message} ownMessage={currentUser._id === message.sender} />
                        </Flex>
                    ))}

            </Flex>

            <MessageInput setMessages={setMessages} />
        </Flex>

    )
}

export default MessageContainer