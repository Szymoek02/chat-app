import { useState, useEffect } from 'react'
import Chat from './chat.jsx'
import Contacts from './contacts.jsx'

class appUser
{
  constructor(id, username, first_name, last_name, email, joining_date)
  {
    this.id = id
    this.username = username
    this.first_name = first_name
    this.last_name = last_name
    this.email = email
    this.joining_date = joining_date
  }
}

class wschatAPI
{
  async getUserContacts()
  {
    const requestContacts = {
      type: "LOAD_USER_CONTACTS",
      userID: 1,
      session_key: '0123456789abcdef'
    }

    this.socket.send(JSON.stringify(requestContacts))
    return await new Promise((resolve, reject) => {
      this.socket.addEventListener('message', (event) => {
        const res = JSON.parse(event.data)
        if(res['type'] == 'USER_CONTACTS_RESPONSE')
        {
          resolve(res)
          this.socket.removeEventListener('message', this)
        }
      })
    })
  }

  async getUserInfo()
  {
    const requestInfo = {
      type: "LOAD_USER_INFO",
      userID: 1,
      session_key: '0123456789abcdef'
    }

    this.socket.send(JSON.stringify(requestInfo))
    return await new Promise( (resolve, reject) => {
      this.socket.addEventListener('message', (event) => {
        const res = JSON.parse(event.data)
        if(res['type'] == 'USER_INFO_RESPONSE')
        {
          resolve(res)
          this.socket.removeEventListener('message', this)
        }
      })
    })
  }

  async getChat(chat_id)
  {
    const requestInfo = {
      type: "LOAD_CHAT",
      chatID: chat_id,
      userID: 1,
      session_key: '0123456789abcdef'
    }

    this.socket.send(JSON.stringify(requestInfo))
    return await new Promise( (resolve, reject) => {
      this.socket.addEventListener('message', (event) => {
        const res = JSON.parse(event.data)
        if(res['type'] == 'LOAD_CHAT_RESPONSE')
        {
          resolve(res)
          this.socket.removeEventListener('message', this)
        }
      })
    })
  }
  
  async waitForWebSocketConnection(webSocket, maxAttempts = 10, delay = 500) {
    let attempts = 0
    while (webSocket.readyState !== WebSocket.OPEN && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay))
        attempts++
    }
    if (webSocket.readyState === WebSocket.OPEN)
    {
      console.log("WebSocket connection established!")
      return true
    } else {
      console.error("Unable to establish WebSocket connection within the specified number of attempts.")
      //load saved offline messages
      return false
    }
  }

  async connect(url)
  {
    this.socket = new WebSocket(url)
    await this.waitForWebSocketConnection(this.socket)
  }

}

const chatApi = new wschatAPI
function App() {
  const [loading, setLoading] = useState(true)
  const [userContacts, setUserContacts] = useState()
  const [userInfo, setUserInfo] = useState()
  const [user, setUser] = useState()
  const [selectedChat, setSelectedChat] = useState(0)
  const [currentChatContent, setCurrentChatContent] = useState([])

  useEffect(() => {
    async function fetchData() 
    {
      try {
        await chatApi.connect('ws://localhost:8000')
        // only if session key
        const _userInfo = await chatApi.getUserInfo()
        setUserInfo(_userInfo)
        
        const _userContacts = await chatApi.getUserContacts()
        setUserContacts(_userContacts)

        const u = _userInfo['user_info'][0]
        setUser(new appUser(u.id, u.username, u.first_name, u.last_name, u.email, u.joining_date))

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
    return () => {}
  }, [])

  useEffect(() => {
    async function requestChatContent()
    {
      try {
        if(selectedChat != 0)
        {
          const chat_content = await chatApi.getChat(selectedChat)
          setCurrentChatContent(chat_content['chat_content'])
        }
      }
      catch(error) {
        console.error("Error fetching chat:", error)
      }
    }

    requestChatContent()
    return () => {}
  }, [selectedChat])

  return (
    <>
      {loading ? (<p>Loading...</p>) : (
        <> 
          <Contacts data={userContacts['user_contacts']} select={setSelectedChat} hello={user.first_name}/>
          <Chat messages={currentChatContent} user={user}/>
        </>
      )}
    </>
  )
}

export default App