var Server = function (options) {
    var self = this;
    self.io = options.io;

    //All user list
    self.users = [];

    //Init function
    self.init = function () {
        self.io.on("connection", function (socket) {
            self.handleConnection(socket);
        });
    }

    //Handle income connection
    self.handleConnection = function (socket) {
        socket.on('login', function (username) {
            //Check if name is OK
            if (!username || username.length < 3 || username.length > 10) {
                socket.emit('error', "bad user name!");
                return;
            }

            //If name already exists
            var isNameExists = _.some(self.users, function (item) {
                return item.user == username;
            });
            if (isNameExists) {
                socket.emit('error', "name already exists!");
                return;
            }

            //Create new user
            var newUser = new User({ user: username, socket: socket });
            //Save the user in list
            self.users.push(newUser);
            //Attach listener functions
            self.attachListeners(newUser);
            //Broadcast about just entered user. (socket.broadcast doesn't send to self)
            socket.broadcast.emit("userConnected", "User" + username + " has entered.");
            socket.emit("Welcome.");

        });
    }

    //Add Listenter functions to user login
    self.attachListeners = function (user) {
        user.socket.on("disconnect", self.onDisconnect(user));
        user.socket.on("getOnlinePeers", self.onGetOnlinePeers());
        user.socket.on("talkToPeer", self.onTalkToPeer(text));
        user.socket.on("broadcast", self.onBroadcast(text));
    }

    //
    self.onDisconnect = function (user) {
        // remove the user from list
        self.users.splice(self.users.indexOf(user), 1);
        //send user left message to all sockets
        self.io.sockets.emit('userDisconnected', user.user); //socket.broadcast.emit('userDisconnected', "User '"user.user"' has disconnected");
    }

    self.onGetOnlinePeers = function (user) {
        //get user list
        var users = _.map(self.users, function (item) {
            return item.user;
        });

        user.socket.emit('getOnlinePeers', users);
    }

    self.onTalkToPeer = function (text) {
        if (text['toUser']) {
            var foundToUser = jsObjects.filter(function (obj) {
                return obj.user == text['toUser'];
            });

            foundToUser[0].socket.emit({ sender: user.user, message: chat });
        } 
    }

    self.onBroadcast = function (text) { }


}