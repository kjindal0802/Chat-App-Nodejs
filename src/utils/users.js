const users = [];

//addUser, RemoveUser, getUSer, getUsersinARoom

const addUser = ({ id, username, room }) => {
    //Clean the data

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if (!username || !room) {
        return {
            error: "User name and room are required"
        }
    }

    //Check for exisitng user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //console.log(existingUser)

    if (existingUser) {
        return {
            error: "Username is already in use."
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room
    })

    if (!usersInRoom) {
        {
            return {
                error: "Room not found"
            }
        }
    }

    return usersInRoom

}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}