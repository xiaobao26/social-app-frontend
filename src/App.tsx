import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RoomLayout from './Layout/RoomLayout'
import WaitingRoom from './pages/WaitingRoom'
import ChatRoom from './pages/ChatRoom'
import './App.css'

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />

      <Route element={<RoomLayout />} >
        <Route path="waiting-room" element={<WaitingRoom />} />
        <Route path="chat-room/:roomNumber" element={<ChatRoom />} />
      </Route>
    </Routes>
  )
}

export default App
