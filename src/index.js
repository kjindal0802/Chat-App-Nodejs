const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0;

//.emit means send and .on means receive
// socket uses for one and io for everyone

//server (emit) -> client (recieve) -> acknowledgement --> server
//client (emit) -> server (recieve) -> acknowledgement --> client

io.on('connection', (socket) => { //connection is inbuilt event

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}!`)) // message is custom event
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!.`)) //Broadcast to everyone except the user who has called this
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback()
        //io.to.emit = emits an event to everyone in a room
        //socket.broadcast.to.emit - sends an event to everyone in room except that client
    })

    socket.on('sendMessage', (chatMessage, callback) => {

        const user = getUser(socket.id)

        const filter = new Filter();

        if (filter.isProfane(chatMessage)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, chatMessage));  // Send message to everyone
        callback('Delivered')
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {

        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback('Location Shared')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left !`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })


})

server.listen(port, (req, res) => {
    console.log(`Server is up on ${port}`)
})


