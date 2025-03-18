import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import * as signalR from "@microsoft/signalr"
import { useSignal } from '@/context/signalRContext'

const WaitingRoom: React.FC = () => {
    const navigate = useNavigate();
    const { setConnection } = useSignal();

    const [userName, setUserName] = useState<string>("");
    const [roomNumber, setRoomNumber] = useState<string>("");


    const handleJoinChatRoom = async (event: React.FormEvent) => {
        event.preventDefault()
        // create connection
        const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://social-app-f8fme2f5anarcpf7.australiacentral-01.azurewebsites.net/Chat")
        .withAutomaticReconnect()
        .build();

        // start connection
        // invoke JoinRoom method
        try {
            await hubConnection.start()
            console.log("signalR connected")
            const userConnection = { 
                UserName: userName, 
                RoomNumber: roomNumber
            }
            await hubConnection.invoke("JoinChatroom", userConnection)
            // store connection in context
            setConnection(hubConnection)

            navigate(`/chat-room/${roomNumber}`, { state: { userName: userName }})
        } catch (err){
            console.error(`[ERROR-Connection] ${err}`)
        }
    }

    return (
        <div className='h-full w-full flex flex-col justify-center items-center'>
            <h1>Join a chat now</h1>
            <form 
                className='flex flex-col items-center'
                onSubmit={(e) => handleJoinChatRoom(e)}
            >
                <div className='flex w-full max-w-sm items-center space-x-2'>
                    <Label>UserName</Label>
                    <Input 
                        placeholder='username'
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
                </div>
                <div className='flex w-full max-w-sm items-center space-x-2'>
                    <Label>Room Number</Label>
                    <Input 
                        placeholder='room number'
                        onChange={(e) => setRoomNumber(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit">Join Now!</Button>
            </form>
        </div>
    )
}

export default WaitingRoom
