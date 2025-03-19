import React from 'react'
import { Outlet } from 'react-router-dom'

const RoomLayout: React.FC = () => {
    return (
        <div className='w-screen h-screen flex justify-center'>
            <Outlet />
        </div>
    )
}

export default RoomLayout
