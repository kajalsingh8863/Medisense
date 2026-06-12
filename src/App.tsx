
import { HashRouter, Route, Routes } from 'react-router-dom'
import ChatScreen from './screens/ChatScreen'
import Login from './screens/Login'
import Signup from './screens/Signup'



export default function App() {
  return (
   <>
  <HashRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/chat" element={<ChatScreen/>}/>
      
    </Routes>
    </HashRouter>
    

   
   </>
  )
}
