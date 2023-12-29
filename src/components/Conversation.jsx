import { Avatar, AvatarBadge, Box, Flex, Image, Stack, Text, WrapItem, useColorMode, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { BsCheck2All, BsFillImageFill } from 'react-icons/bs'
import { selectedConversationAtom } from '../atoms/messagesAtom'

const Conversation = ({ convo, isOnline }) => {
    const user = convo.participants[0]
    const lastMessage = convo.lastMessage
    const currentUser = useRecoilValue(userAtom)
    const [selectedConvo, setSelectedConvo] = useRecoilState(selectedConversationAtom)
    const colorMode = useColorMode()

    return (
        <Flex
            gap={4}
            alignItems={'center'}
            p={1}
            _hover={{
                cursor: 'pointer',
                bg: useColorModeValue('gray.600', 'gray.dark'),
                color: 'white'
            }}
            onClick={() => setSelectedConvo({
                mock: convo.mock,
                _id: convo._id,
                userId: user._id,
                userProfilePic: user.profilePic,
                username: user.username
            })}
            bg={selectedConvo?._id === convo._id ? (colorMode === 'light' ? 'gray.600' : 'gray.dark') : ''}
            borderRadius={'md'}
        >
            <WrapItem>
                <Avatar size={{
                    base: 'xs',
                    sm: 'sm',
                    md: 'md'
                }} src={user.profilePic} >
                    {isOnline ? <AvatarBadge boxSize={'1em'} bg={'green.500'} /> : ''}
                </Avatar>
            </WrapItem>

            <Stack direction={'column'} fontSize={'sm'}>
                <Text fontWeight={'700'} display={'flex'} alignItems={'center'}>
                    {user.username} <Image src='/verified.png' w={4} h={4} ml={1} />
                </Text>
                <Flex display={'flex'} alignItems={'center'} gap={1}>
                    {currentUser._id === lastMessage.sender ? (
                        <Box color={lastMessage.seen ? "blue.400" : ""}>
                            <BsCheck2All size={16} />
                        </Box>
                    ) : ""}
                    <Text fontSize={'xs'}>
                    {lastMessage.text.length > 15 ? lastMessage.text.substring(0, 15) + '...' : lastMessage.text || (<BsFillImageFill size={16} />)}
                    </Text>
                </Flex>
            </Stack>
        </Flex>
    )
}

export default Conversation