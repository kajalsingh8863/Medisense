import { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e:any) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const  handleSubmit =async (e:any) => {
    e.preventDefault();
console.log(formData);


    console.log("User Data:", formData);
   let res=await handlesignupapi(formData.fullName,formData.email,formData.password);
   setMessage(res.message)
    setFormData({
      fullName: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h2 id="heading">MediSense Signup</h2>

        <input
         className="sign"
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
        /><br/>

        <input
         className="sign"
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        /><br/>

        <input
         className="sign"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        /><br/>

        <button  className ="btn" type="submit">Sign Up</button><br/>
        <button className="btn" ><a href="/">Login
          </a></button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default Signup;
async function handlesignupapi(name:string,email:string,password:string){
   let res= await fetch ("https://medisense.kajalsingh8863.workers.dev/api/auth/register",
    {
        method:"POST",
        body: JSON.stringify({
          name,
    email,
    password
})
    }
   )
   let data=await res.json()
   return data;
}

