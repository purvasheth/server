const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT);
// WARNING: app.listen(80) will NOT work here!

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });



const people = {};
const sockmap = {};


io.on('connection', (socket) => {

    console.log("user connected")
    socket.on("join", (name, room) => {
        socket.join(room);
        if (!people.hasOwnProperty(room)) {
            people[room] = {};
        }

        people[room][socket.id] = {
            name: name,
            id: socket.id
        }
        sockmap[socket.id] = {
            name: name,
            room: room
        }

        socket.emit("people-list", people[room]);
        socket.to(room).broadcast.emit("add-person", name, socket.id);
        console.log(name, "has connected to room", room);

    })


    socket.on('chat message', (data, room, id) => {
        socket.to(room).broadcast.emit('broadcast', data)
        //get index of data[0]
        //send turn as next using people to that room

        const l = Object.entries(people[room]).length;
        const index = Object.keys(people[room]).indexOf(id)
        const next = (Object.keys(people[room])[(index + 1) % l])
        io.emit("turn", next);
    });


    socket.on('disconnect', () => {
        const room = sockmap[socket.id].room;
        io.emit("remove-person", socket.id);
        delete people[room][socket.id];
        delete sockmap[socket.id];
    }
    );
});