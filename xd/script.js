import {Getcredontial,Getauditdata } from "./getdata.js"
import { showNotification } from "./utils.js";
function showlogedin(){
  const root = document.getElementById("root")
  root.innerHTML= ''
}
export function showAuthFormLogin() {
  const root = document.getElementById('root');
  if (!root) {
    console.error("Element with id 'root' not found.");
    return;
  }

  root.innerHTML = '';

  const formContainer = document.createElement('div');
  formContainer.className = 'auth-form-container';

  formContainer.innerHTML = `
    <h2>Login</h2>
    <form class="auth-form" autocomplete="off">
      <input type="text" name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `;

  root.appendChild(formContainer);

  const form = formContainer.querySelector('.auth-form');
  const loginbtn = formContainer.querySelector('.login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await sendlogindata(data.username, data.password);
  });

//   loginbtn.addEventListener('click', showAuthFormSignup);
}


async function sendlogindata(username, password) {
  
  try{
  const res = await fetch ("https://zone01-auth-proxy.onrender.com/auth",{
    method : "POST",
    headers: {
      "Content-Type" : "application/json",
      "Authorization" : `Basic ${btoa(username+ ":" + password)}`
    }
  })
  const data = await res.json()
  if (res.ok){  

    console.log("watkiiiiiiiiiii")
     localStorage.setItem('jwt',data)
       showlogedin()
       Getcredontial()
       Getauditdata()
       showNotification("Login successful")
  }
  if (!res.ok){
    let name = document.querySelector('[name="username"]')
    let pass = document.querySelector('[name="password"]')
    name.value=""
    pass.value =""  
    showNotification("Wrong credentials")
  }
 } catch(error){    
        console.error("Login error:", error);
        alert(error.message);

  }
  
}


document.addEventListener('DOMContentLoaded', ()=>{
    const jwt = localStorage.getItem('jwt')
    if (jwt){
      showlogedin()
       Getcredontial()
       Getauditdata()
    }else{
      showAuthFormLogin()
    }

});
