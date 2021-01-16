const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Parsing url options
//const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) //Qs is library //Object Destructuring
const urlParams = new URLSearchParams(window.location.search);

const username = urlParams.get("username");
const room = urlParams.get("room")

const autoscroll = () => {
    //New mwssage element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight 

    //MEssages container Height
    const containerHeight = $messages.scrollHeight

    //How far I have scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on('message', (message) => {
    //console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        chatmessage: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    //console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        locationURL: message.locationURL,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// const chatInput = document.querySelector("input").addEventListener('keydown', () => {
//     socket.emit('sendMessage', "User is typing")
// })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() // To prevent browser from refreshing

    //disable form button
    $messageFormButton.setAttribute('disabled', 'disabled');

    const chatMessage = e.target.elements.chatmessage.value; //targeting event value
    socket.emit('sendMessage', chatMessage, (error) => {

        $messageFormButton.removeAttribute('disabled'); // enabling form button again
        $messageFormInput.value = '';
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        //console.log('Message Delivered')
    });
})

$sendLocationButton.addEventListener('click', () => {

    $sendLocationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (acknowledgementMessage) => {

            $sendLocationButton.removeAttribute('disabled')
            //console.log(acknowledgementMessage)

        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})