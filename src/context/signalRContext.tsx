import { createContext, useContext } from "react"
import * as SignalR from "@microsoft/signalr"

export interface SignalRContextType {
    connection: SignalR.HubConnection | null;
    setConnection: (cnn: SignalR.HubConnection) => void
}

export const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const useSignal = () => {
    const context = useContext(SignalRContext);
    if (!context){
        throw new Error("SignalRContext must be used within SignalRProvider")
    }
    return context;
}