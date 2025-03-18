import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSignal } from '@/context/signalRContext'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const ChatRoom:React.FC = () => {
    const { roomNumber }  = useParams()
    const location = useLocation()
    const userName = location.state?.userName
    const { connection } = useSignal()

    const [adminMessages, setAdminMessages] = useState<string[]>([])
    const [userInput, setUserInput] = useState<string>("")

    const [allMessages, setAllMessages] = useState<{ user:string, text: string }[]>([])
    const [preferredLanguage, setPreferredLanguage] = useState<string>("")
    const [translatedMessages, setTranslatedMessages] = useState<{ originMessage: string, translatedMessage: string }[]>([])


    // prevent duplicated event register
    const isRegistered = useRef(false)

    const registerReceiveJoinRoomMessageEvent = (_: string, message: string) => {
        setAdminMessages((prevMessages) => [...prevMessages, message])
    }

    const registerReceiveUserInputMessageEvent = (user: string, text: string) => {
        setAllMessages((prevMessages) => [...prevMessages, { user, text }])
    }

    const registerReceiveTranslatedMessageEvent = (originMessage: string, translatedMessage: string) => {
        setTranslatedMessages((prevMessages) => [...prevMessages, { originMessage, translatedMessage}])
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

            if (preferredLanguage.trim() !== ("")) {
                await connection.invoke("TranslateMessage", userInput, preferredLanguage)
            }
        } catch (error) {
            console.error(`[ERROR] for send message ${error}`)
        }
    }

    const handleLanguageChange = async (newLanguage: string) => {
        setPreferredLanguage(newLanguage)
        setTranslatedMessages([])
        if (!connection || newLanguage.trim() === "") return

        try {
            for (const message of allMessages) {
                await connection.invoke("TranslateMessage", message.text, newLanguage)
                console.log(`translated: ${message.text} ${newLanguage}`)
            }
        } catch (error) {
            console.error(`[ERROR] for translate language ${error}`)
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
            connection.on("ReceiveTranslatedMessage", registerReceiveTranslatedMessageEvent)
            isRegistered.current = true
        }

        // invoke methods
        JoinRoom()

        return () => {
            connection.off("ReceiveMessage", registerReceiveJoinRoomMessageEvent)
            connection.off("ReceiveChatMessage", registerReceiveUserInputMessageEvent)
            connection.off("ReceiveTranslatedMessage", registerReceiveTranslatedMessageEvent)
            isRegistered.current = false
        }
    }, [connection])


    return (
        <div className='w-full h-full flex flex-col'>
            <div className='bg-amber-50 flex-1/5  mb-3'>
                <h1>Admin Broadcast Message</h1>
                {adminMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>

            <div className='bg-fuchsia-100 flex flex-col flex-1/2  mb-3'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Translate ({preferredLanguage || "Original"})</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Languages</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={preferredLanguage} onValueChange={handleLanguageChange}>
                            <DropdownMenuRadioItem value="">Show Origin</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="de">German</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="zh-Hans">Chinese (Simplified)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="fr">French</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <h1>Users Chat Content</h1>
                {preferredLanguage === "" 
                    ? (
                        allMessages.map((originMessage, index) => (
                            <p key={index}>{allMessages[index].user}: {originMessage.text}</p>
                        ))
                    )
                    : (
                        translatedMessages.map((translatedMessage, index) => (
                            <p key={index}>{allMessages[index].user}: {translatedMessage.translatedMessage}</p>
                        ))
                    )
                }
            </div>

            <div className='flex'>
                <Input value={userInput} onChange={(e) => setUserInput(e.target.value)} />
                <Button type="submit" onClick={handleSubmit}>Send</Button>
            </div>
        </div>
    )
}

export default ChatRoom
