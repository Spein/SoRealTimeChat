const chatForm=document.getElementById('chat-form')
const chatMessages=document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

//Get username and Room from URL through qs.js

const {username,room} = Qs.parse(location.search,{
  ignoreQueryPrefix:true
});

const socket = io()
//Join chatroom
socket.emit('joinRoom',{username,room})

// Get room and users
socket.on('roomUser',({room,users})=>{
  outputRoomName(room);
  outputUsers(users);
})

//catch the emit from server
socket.on('message',message=>{
  outputMessage(message);

  //Scroll down on message
  chatMessages.scrollTop=chatMessages.scrollHeight

})

//Message submit
chatForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  //Get Message text
  const msg = e.target.elements.msg.value;
  //Emit message to server
  socket.emit('chatMessage',msg)

  //Clear nput
  e.target.elements.msg.value='';
  e.target.elements.msg.focus()
})

//output message to DOM

function outputMessage(message){
  const div = document.createElement('div')
  div.classList.add('message');
  div.innerHTML=`
                  <p class="meta">${message.username}<span>${message.time}</span></p>
                  <p class="text">${message.text}</p>
  `
  document.querySelector('.chat-messages').appendChild(div)
  
}
//Add room name to DOM
function outputRoomName(room){
  console.log(room)
  roomName.innerText=room
}

//Add users to Dom
function outputUsers(users){
  usersList.innerHTML=
    `${users.map(user=>`<li>${user.username}</li>`).join('')}`

}