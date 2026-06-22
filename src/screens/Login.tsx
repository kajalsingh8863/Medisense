import  {useState} from "react";
import { useNavigate } from "react-router-dom";


const Login = () => {
let navigate=useNavigate()

    const[formData,setFormData]=useState({
         username:"",
    password:""
    })
    const handleChange=(e:any)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }
const handleSubmit=async(e:any)=>{
    e.preventDefault();
  let res=await  handleLoginapi(formData.username,formData.password);
  alert(res.message)
if (res.statusCode==200){
    navigate("/chat")
}
    
    
}
  return (
    <div className="data">
        <div className="form-box">
            <form onSubmit={handleSubmit}>
                <h2>Medisense Login</h2>
                    <input 
                    className="section"
                    type="text"
                    name="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}

                    /><br/>
                     <input 
                     className="section"
                    type="text"
                    name="password"
                    placeholder="password"
                    value={formData.password}
                    onChange={handleChange}

                    /><br/>
                    
                   <button className="btn" type="submit">Login
                    </button> 


            </form>
<button className="btn" ><a href="#/signup">go to signup</a></button>

        </div>
      
    </div>
  )
}

export default Login
async function handleLoginapi(email:string,password:string){
   let res= await fetch ("https://medisense.kajalsingh8863.workers.dev/api/auth/login",
    {
        method:"POST",
        body: JSON.stringify({
    email,
    password
})
    }
   )
   let data=await res.json()
   console.log(data);
   return data;
}


