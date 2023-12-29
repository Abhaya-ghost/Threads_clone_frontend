import { Flex, Image, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react';
import React, { useRef, useState } from 'react'
import { BsFillImageFill } from 'react-icons/bs';
import { IoSendSharp } from 'react-icons/io5'
import useShowToast from '../hooks/useShowToast';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { conversationAtom, selectedConversationAtom } from '../atoms/messagesAtom';
import usePreviewImg from '../hooks/usePreviewImg';

const MessageInput = ({ setMessages }) => {
	const imgRef = useRef()
	const [messageText, setMessageText] = useState('')
	const showToast = useShowToast();
	const selectedConvo = useRecoilValue(selectedConversationAtom)
	const setConvo = useSetRecoilState(conversationAtom)
	const {onClose} = useDisclosure()
	const {handleImgChange, imgUrl, setImgUrl} = usePreviewImg()
	const [isSending, setIsSending] = useState(false)


	const handleSendMessage = async (e) => {
		e.preventDefault()
		if (!messageText && !imgUrl) return;
		if(isSending) return

		setIsSending(true)

		try {
			const res = await fetch('/api/message', {
				method: "POST",
				headers : {
					"Content-Type":"application/json"
				},
				body: JSON.stringify({
					message: messageText,
					recipientId: selectedConvo.userId,
					img: imgUrl,
				})
			})
			const data = await res.json()
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			setMessages((messages) => [...messages, data])
			setConvo(prevConvos => {
				const updatedConvo = prevConvos.map(convo => {
					if(convo._id === selectedConvo._id){
						return {
							...convo,
							lastMessage : {
								text: messageText,
								sender: data.sender
							}
						}
					}
					return convo
				})
				return updatedConvo
			})
			setMessageText('')
			setImgUrl('')
		} catch (err) {
			showToast('Error', err, 'error')
		} finally{
			setIsSending(false)
		}
	}
	return (
		<Flex gap={2} alignItems={"center"}>
			<form style={{ flex: 95 }} onSubmit={handleSendMessage}>
				<InputGroup>
					<Input
						w={"full"}
						placeholder='Type a message'
						onChange={(e) => setMessageText(e.target.value)}
						value={messageText}
					/>
					<InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
						<IoSendSharp />
					</InputRightElement>
				</InputGroup>
			</form>
			<Flex flex={5} cursor={"pointer"}>
				<BsFillImageFill size={20} onClick={() => imgRef.current.click()} />
				<Input type={"file"} hidden ref={imgRef} onChange={handleImgChange} />
			</Flex>
			<Modal
				isOpen={imgUrl}
				onClose={() => {
					onClose();
					setImgUrl("");
				}}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex mt={5} w={"full"}>
							<Image src={imgUrl} />
						</Flex>
						<Flex justifyContent={"flex-end"} my={2}>
							{!isSending ? (
								<IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
							) : (
								<Spinner size={"md"} />
							)}
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Flex>
	)
}

export default MessageInput