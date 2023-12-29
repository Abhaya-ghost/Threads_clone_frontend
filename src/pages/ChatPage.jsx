import { SearchIcon } from '@chakra-ui/icons'
import { GiConversation } from 'react-icons/gi'
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Conversation from '../components/Conversation'
import MessageContainer from '../components/MessageContainer'
import useShowToast from '../hooks/useShowToast'
import { useRecoilState, useRecoilValue } from 'recoil'
import { conversationAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'

const ChatPage = () => {
    const showToast = useShowToast();
    const [loadingConvo, setLoadingConvo] = useState(true)
    const [convos, setConvos] = useRecoilState(conversationAtom)
    const [selectedConvo, setSelectedConvo] = useRecoilState(selectedConversationAtom)
    const [searchText, setSearchText] = useState('')
    const [searchingUser, setSearchingUser] = useState(false)
    const currentUser = useRecoilValue(userAtom)
    const {socket, onlineUsers} = useSocket()

    useEffect(() => {
        socket?.on('messagesSeen', ({conversationId}) => {
            setConvos(prev => {
                const updatedConvo = prev.map(conversation => {
                    if(conversation._id === conversationId){
                        return {
                            ...conversation,
                            lastMessage: {
                                ...conversation.lastMessage,
                                seen: true
                            }
                        }
                    }
                    return conversation
                })
                return updatedConvo
            })
        })
    }, [socket, setConvos])

    useEffect(() => {
        const getConvo = async () => {
            setLoadingConvo(true)
            try {
                const res = await fetch('/api/message/conversations')
                const data = await res.json()
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setConvos(data)
            } catch (err) {
                showToast('Error', err, 'error')
            } finally {
                setLoadingConvo(false)
            }
        }

        getConvo()
    }, [showToast, setConvos])

    const handleConvoSearch = async (e) => {
        e.preventDefault()
        setSearchingUser(true)
        try {
            const res = await fetch(`/api/users/profile/${searchText}`)
            const data = await res.json()
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            const messagingYourself = data._id === currentUser._id
            if(messagingYourself){
                showToast("Error", 'You cannot message yourself', 'error')
                return
            }

            const convoAlreadyExist = convos.find(convo => convo.participants[0]._id === data._id)
            if(convoAlreadyExist){
                setSelectedConvo({
                    _id: convos.find(convo => convo.participants[0]._id === data._id)._id,
                    userId : data._id,
                    userProfilePic: data.profilePic,
                    username: data.username
                })
                return
            }

            const mockConvo = {
                mock: true,
                lastMessage : {
                    text : '',
                    sender: ''
                },
                _id: Date.now(),
                participants: [
                    {
                        _id: data._id,
                        username : data.username,
                        profilePic: data.profilePic
                    }
                ]
            }
            setConvos((prevConvos) => [...prevConvos, mockConvo])
        } catch (err) {
            showToast('Error', err, 'error')
        } finally {
            setSearchingUser(false)
        }
    }

    return (
        <Box position={'absolute'} p={4} left={{ base: '100%', md: '80%', lg: '750px' }} transform={'translateX(-50%)'} w={'750px'}>
            <Flex gap={4} flexDirection={{ base: 'column', md: 'row' }} maxW={{ sm: '400px', md: 'full' }} mx={'auto'} >
                <Flex flex={30} gap={2} flexDirection={'column'} maxW={{ sm: '250px', md: 'full' }} mx={'auto'}>
                    <Text fontWeight={700} color={useColorModeValue('gray.600', 'gray.400')}>Your Conversation</Text>
                    <form onSubmit={handleConvoSearch}>
                        <Flex alignItems={'center'} gap={2}>
                            <Input placeholder='Search for a user' onChange={(e) => setSearchText(e.target.value)} value={searchText} />
                            <Button size={'sm'} onClick={handleConvoSearch} isLoading={searchingUser}>
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>

                    {loadingConvo && (
                        [0, 1, 2, 3, 4].map((_, i) => (
                            <Flex key={i} gap={4} alignItems={'center'} p={'1'} borderRadius={'md'}>
                                <Box>
                                    <SkeletonCircle size={'10'} />
                                </Box>
                                <Flex w={'full'} flexDirection={'column'} gap={3}>
                                    <Skeleton h={'10px'} w={'80px'} />
                                    <Skeleton h={'8px'} w={'90%'} />
                                </Flex>
                            </Flex>
                        ))
                    )}

                    {!loadingConvo && (
                        convos.map(convo => (
                            <Conversation key={convo._id} isOnline={onlineUsers.includes(convo.participants[0]._id)} convo={convo} />
                        ))
                    )}
                </Flex>
                {!selectedConvo._id && (
                    <Flex
                        flex={70}
                        borderRadius={"md"}
                        p={2}
                        flexDir={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"400px"}
                    >
                        <GiConversation size={100} />
                        <Text fontSize={20}>Select a conversation to start messaging</Text>
                    </Flex>
                )}
                {selectedConvo._id && (
                    <MessageContainer />
                )}
            </Flex>
        </Box>
    )
}

export default ChatPage