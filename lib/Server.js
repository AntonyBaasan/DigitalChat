// User Model
var User = function (args) {
    var self = this;

    // Socket field
    self.socket = args.socket;
    // username field
    self.user = args.user;
}

var Message = function (args) {
    var self = this;

    self.fromUser = args.fromUser;
    self.toUser = args.toUser;
    self.data = args.data;
    self.type = args.type;
    self.time = args.time;
}


var Server = function (io) {
    var self = this;
    self.io = io;

    //All user list
    self.users = [];


    //Init function
    self.init = function () {
        self.io.on("connection", function (socket) {
            console.log("Someone connected...");
            self.handleConnection(socket);
        });
    };

    //Handle income connection
    self.handleConnection = function (socket) {
        socket.on('login', function (data) {
            var username = data["username"];

            console.log("Login started for user: " + username);
            console.log("socket: " + socket);

            //Check if name is OK
            if (!username || username.length < 3 || username.length > 10) {
                socket.emit('err', { msg: "bad user name!" });
//                socket.emit('err', "bad user name!");
                return;
            }

            //If name already exists
            //            var isNameExists = _.some(self.users, function (item) {
            //              return item.user == username;
            //        });

            var foundToUser = self.users.filter(function (obj) {
                return obj.user == username;
            });

            //            if (isNameExists) {
            if (foundToUser[0]) {
                socket.emit('err', { msg: "name already exists!" });
                //                socket.emit('err', "name already exists!");
                return;
            }

            //Create new user
            var newUser = new User({ user: username, socket: socket });
            //Save the user in list
            self.users.push(newUser);
            //Attach listener functions
            self.attachListeners(newUser);
            //Broadcast about just entered user. (socket.broadcast doesn't send to self)
            socket.broadcast.emit("userConnected", {msg: "User '" + username + "' has entered."});
            socket.emit("welcome", { msg: "Welcome!" });
        });
    };

    //Add Listenter functions to user login
    self.attachListeners = function (user) {
        user.socket.on("disconnect", self.onDisconnect);
        user.socket.on("getOnlinePeers", self.onGetOnlinePeers);
        user.socket.on("talkToPeer", self.onTalkToPeer);
        user.socket.on("broadcast", self.onBroadcast);
    };

    //
    self.onDisconnect = function (user) {
        // remove the user from list
        self.users.splice(self.users.indexOf(user), 1);
        //send user left message to all sockets
        self.io.sockets.emit('userDisconnected', user.user); //socket.broadcast.emit('userDisconnected', "User '"user.user"' has disconnected");
    };

    self.onGetOnlinePeers = function (user) {
        //get user list
        var users = _.map(self.users, function (item) {
            return item.user;
        });

        user.socket.emit('getOnlinePeers', users);
    };

    self.onTalkToPeer = function (text) {
        if (text['toUser']) {
            var foundToUser = self.users.filter(function (obj) {
                return obj.user == text['toUser'];
            });

            foundToUser[0].socket.emit("talkToPeer", { sender: user.user, message: chat });
        }
    };

    self.onBroadcast = function (text) { };


};


module.exports = { Server: Server };