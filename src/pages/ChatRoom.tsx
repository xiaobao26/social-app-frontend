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
        <div className='w-full h-full flex flex-col bg-gray-100 max-w-md mx-auto rounded-lg shadow-lg'>
            <div className='flex-1 text-sm text-gray-500 my-1 text-center'>
                <h1>Welcome chat room {roomNumber}</h1>
                {adminMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>

            <div className='flex flex-col h-2/3 gap-2 p-3 bg-gradient-to-b from-indigo-100 to-purple-200 rounded-lg overflow-y-auto'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Translate ({preferredLanguage || "Original"})</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Languages</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={preferredLanguage} onValueChange={handleLanguageChange}>
                            <DropdownMenuRadioItem value="">Show Origin</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="zh-Hans">Chinese (Simplified)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="fr">French</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="de">German</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="it">Italian</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="ja">Japanese</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="ru">Russian</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="th">Thai</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                {preferredLanguage === "" 
                    ? (
                        allMessages.map((originMessage, index) => (
                            <div key={index} className={`flex mb-2 ${originMessage.user === userName ? `justify-end` : `justify-start`}`}>
                                <div className='text-xs'>
                                    {originMessage.user !== userName && (
                                        <div className='font-light'>
                                            {originMessage.user}:
                                        </div>
                                    )}
                                    <p className='bg-gray-50 rounded-xl px-2 ml-2 font-bold'>
                                        {originMessage.text}
                                    </p>
                                </div>
                            </div>
                        ))
                    )
                    : (
                        translatedMessages.map((translatedMessage, index) => (
                            <div key={index} className={`flex mb-2 ${allMessages[index].user === userName ? `justify-end` : `justify-start`}`}>
                                <div className='text-xs'>
                                    {allMessages[index].user !== userName && (
                                        <div className='font-light'>
                                            {allMessages[index].user}
                                        </div>
                                    )}
                                    <p className='bg-gray-50 rounded-xl px-2 ml-2 font-bold'>
                                        {translatedMessage.translatedMessage}
                                    </p>
                                </div>
                            </div>
                        ))
                    )
                }
            </div>

            <div className='flex h-auto justify-center p-2 shadow-md gap-1'>
                <Input value={userInput}
                    onChange={(e) => setUserInput(e.target.value)} 
                    placeholder='Type a message ...'
                    />
                <Button 
                    type="submit" 
                    onClick={handleSubmit}
                    className='hover:border-y-indigo-100'
                >
                    Send
                </Button>
            </div>
        </div>
    )
}

export default ChatRoom
