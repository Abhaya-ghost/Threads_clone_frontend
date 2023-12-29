import { Button, Flex, Image, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import { Link } from 'react-router-dom';
import { AiFillHome } from 'react-icons/ai'
import { RxAvatar } from 'react-icons/rx'
import { FiLogOut } from 'react-icons/fi';
import useLogout from '../hooks/useLogout';
import authScreenAtom from '../atoms/authAtom';
import {FaRocketchat} from 'react-icons/fa'

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom)
  const logout = useLogout()
  const setAuthScreen = useSetRecoilState(authScreenAtom)

  return (
    <Flex justifyContent={"space-between"} mt={6} mb='12'>
      {user && (
        <Link to='/'>
          <AiFillHome size={24} />
        </Link>
      )}

      {!user && (
        <Link onClick={
          () => setAuthScreen('login')
        } to={'/auth'}>
          Login
        </Link>
      )}

      <Image
        cursor={"pointer"}
        alt='logo'
        w={6}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        onClick={toggleColorMode}
      />

      {user && (
        <Flex alignItems={'center'} gap={4}>
          <Link to={`/${user.username}`}>
            <RxAvatar size={24} />
          </Link>
          <Link to={`/chat`}>
            <FaRocketchat size={24} />
          </Link>
          <Button size={'xs'} onClick={logout} >
            <FiLogOut size={20} />
          </Button>
        </Flex>
      )}

      {!user && (
        <Link onClick={
          () => setAuthScreen('signup')
        } to={'/auth'}>
          Sign Up
        </Link>
      )}
    </Flex>
  )
}

export default Header