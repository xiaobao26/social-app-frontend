import { Button } from '@/components/ui/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home: React.FC = () => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/waiting-room')
    }

    return (
        <div className='h-screen w-screen'>
            <div className='h-full flex flex-col justify-center items-center'>
                <h1 className='text-xl'>Welcome to chat app</h1>
                <Button variant="outline" onClick={handleClick}>Click me to join a chat</Button>
            </div>
        </div>
    )
}

export default Home
