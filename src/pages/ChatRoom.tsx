import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSignal } from '@/context/signalRContext'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'


const ChatRoom:React.FC = () => {
    const { roomNumber }  = useParams()
    const location = useLocation()
    const userName = location.state?.userName
    const { connection } = useSignal()

    const [adminMessages, setAdminMessages] = useState<string[]>([])
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<{ user:string, text: string}[]>([])

    // prevent duplicated event register
    const isRegistered = useRef(false)

    const registerReceiveJoinRoomMessageEvent = (user: string, message: string) => {
        setAdminMessages((prevMessages) => [...prevMessages, message])
    }
    const registerReceiveUserInputMessageEvent = (user: string, text: string) => {
        setMessages((prevMessages) => [...prevMessages, { user, text }])
    }

    const JoinRoom = async () => {
        if (!connection) return 
        try {
            await connection.invoke("JoinChatroom", { UserName: userName, RoomNumber: roomNumber})

        } catch(error) {
            console.error(`[ERROR] for join chat room, ${error}`)
        }
    }
    const handleSubmit = async () => {
        if (!connection || userInput.trim() === "") return

        try {
            await connection.invoke("SendChatMessage", { UserName: userName, RoomNumber: roomNumber}, userInput)
            setUserInput("")
        } catch (error) {
            console.error(`[ERROR] for send message ${error}`)
        }
    }

    useEffect(() => {
        if (!connection) {
            console.error("No signalR connect found.")
            return
        }
        
        // listen events
        if (!isRegistered.current) {
            connection.on("ReceiveMessage", registerReceiveJoinRoomMessageEvent)
            connection.on("ReceiveChatMessage", registerReceiveUserInputMessageEvent)
            isRegistered.current = true
        }

        // invoke methods
        JoinRoom()

        return () => {
            connection.off("ReceiveMessage", registerReceiveJoinRoomMessageEvent)
            connection.off("ReceiveChatMessage", registerReceiveUserInputMessageEvent)
            isRegistered.current = false
        }
    }, [connection])


    return (
        <div className='w-full h-full flex flex-col justify-between'>
            <div className='bg-amber-50'>
                <h1>Admin Broadcast Message</h1>
                {adminMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>

            <div className='bg-fuchsia-100'>
                <h1>Users Chat Content</h1>
                {messages.map((item, index) => (
                    <p key={index}>{item.user}: {item.text}</p>
                ))}
            </div>

            <div className='flex gap-1'>
                <Input value={userInput} onChange={(e) => setUserInput(e.target.value)} />
                <Button type="submit" onClick={handleSubmit}>Send</Button>
            </div>
        </div>
    )
}

export default ChatRoom
