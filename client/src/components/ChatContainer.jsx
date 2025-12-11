import React, { useEffect, useRef } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'

const ChatContainer = ({selectedUser,setSelectedUser}) => {
  const scrollEnd=useRef()
  useEffect(()=>{
    if(scrollEnd.current){
      scrollEnd.current.scrollIntoView({behavior:'smooth'})
    }

  },[])
  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>

      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>{selectedUser?.fullName}
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
        </p>
        <img onClick={()=>setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7' />
        <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />

      </div>

      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messagesDummyData.map((msg,index)=>(
          <div key={index} className={`flex items-end gap-3 mb-3 ${msg.senderId === '680f50e4f10f3cd28382ecf9' ? 'justify-start' : 'justify-end'}`}>
            {msg.senderId === '680f50e4f10f3cd28382ecf9' ? (
              // Left side messages (Martin Johnson - the person you're chatting with)
              <>
                <div className='text-center text-xs order-1'>
                  <img src={selectedUser?.profilePic || assets.profile_martin} alt="" className='w-7 h-7 rounded-full' />
                  <p className='text-gray-500 mt-1'>{formatMessageTime(msg.createdAt)}</p>
                </div>
                <div className='order-2'>
                  {msg.image ? (
                    <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden' />
                  ) : (
                    <p className='p-3 max-w-[200px] md:text-sm font-light rounded-lg bg-violet-500/30 text-white rounded-bl-none'>
                      {msg.text}
                    </p>
                  )}
                </div>
              </>
            ) : (
              // Right side messages (You/Current User)
              <>
                <div className='order-1'>
                  {msg.image ? (
                    <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden' />
                  ) : (
                    <p className='p-3 max-w-[200px] md:text-sm font-light rounded-lg bg-gray-700/30 text-white rounded-br-none'>
                      {msg.text}
                    </p>
                  )}
                </div>
                <div className='text-center text-xs order-2'>
                  <img src={assets.avatar_icon} alt="" className='w-7 h-7 rounded-full' />
                  <p className='text-gray-500 mt-1'>{formatMessageTime(msg.createdAt)}</p>
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input type="text" placeholder='send a message' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400' />
          <input type="file" id='image' accept='image/png,image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img src={assets.send_button} alt="" />

      </div>
    </div>
  ):(
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' alt="" />
      <p className='text-lg font-medium text-white'>Chat anytime,anywhere</p>
    </div>
  )
}

export default ChatContainer