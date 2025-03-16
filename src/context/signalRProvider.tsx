import React, { useState } from 'react'
import * as signalR from "@microsoft/signalr"
import { SignalRContext, SignalRContextType } from './signalRContext'

const SignalRProvider:React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    const contextValue: SignalRContextType = {connection, setConnection}

    return (
        <SignalRContext.Provider value={contextValue}>
            {children}
        </SignalRContext.Provider>
    )
}

export default SignalRProvider
