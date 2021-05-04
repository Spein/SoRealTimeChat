const path = require('path');
const http = require("http");
const express = require("express");
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server)
const botName = "ChatLive Bot"
//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Open the connection btw server and client 
// Run When a client connect 
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        //Socket functionality to join certain room
        socket.join(user.room)
        //emit to client of the user
        socket.emit('message', formatMessage(botName, 'Welcome to Chat!'))
        //Broadcast in a specific room when a user connects. Broadcast will emit to everybody except the user
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} joined the chat`))

        //Send users and room info
        io.to(user.room).emit('roomUser', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        //Listen for chatMessage
        socket.on('chatMessage', (msg) => {
            const user = getCurrentUser(socket.id)
            io.to(user.room).emit("message", formatMessage(user.username, msg))
        })
        //Runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id)

            if (user) {
                io.to(user.room).emit('message',
                    formatMessage(botName,
                        `${user.username} left the chat`))
                io.to(user.room).emit('roomUser', {
                    room: user.room,
                    users: getRoomUsers(user.room),
                },
                )

            }
        })
    })




})


const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`server running on ${PORT}`))