var assert = require("assert");
var should = require("should");

//var should = require('should');
var io = require('socket.io-client');
var socketURL = "http://localhost:4567";

var options = {
    transports: ['websocket'],
    'forceNew': true
};

var messagesCount = 0;

describe("Digital Chat Socket Test :: ", function () {
    describe("Login and name errors :", function () {
        it("should login to server", function (done) {
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Antony" });
            });

            client1.on("welcome", function (data) {
                //data["content"].should.equal("Welcome!");
                assert.equal(data["content"], "Welcome!");

                client1.disconnect();
                done();
            });
        });

        it("should logout from server", function (done) {
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Antony" });
            });

            var client2 = io.connect(socketURL, options);
            //Connect First client
            client2.on('connect', function (data) {
                client2.emit("login", { "fromUser": "User2" });
            });

            client1.on("welcome", function (data) {
                setTimeout(function () {
                    client1.emit("logout", { "fromUser": "Antony" });
                }, 500);
            });

            client2.on("userLogout", function (data) {
                assert.equal(data["fromUser"], "Antony");

                client1.disconnect();
                client2.disconnect();
                done();
            });
        });

        it("should logout repeadetly from server", function (done) {
            messagesCount = 0;
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Antony" });
            });

            var client2 = io.connect(socketURL, options);
            //Connect First client
            client2.on('connect', function (data) {
                client2.emit("login", { "fromUser": "User2" });
            });

            var client3 = io.connect(socketURL, options);
            //Connect First client
            client3.on('connect', function (data) {
                client3.emit("login", { "fromUser": "User3" });
            });

            client1.on("welcome", function (data) {
                setTimeout(function () {
                    client1.emit("logout", { "fromUser": data["fromUser"] });
                }, 200);
            });

            client2.on("userLogout", function (data) {
                assert.equal(data["fromUser"], "Antony");

                setTimeout(function () {
                    client1.emit("login", { "fromUser": "Antony" });
                }, 500);

                messagesCount++;
                if (messagesCount == 3) {
                    client1.disconnect();
                    client2.disconnect();
                    client3.disconnect();
                    done();
                }
            });
        });


        it("should raise error if user with wrong name", function (done) {
            messagesCount = 0;
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                //empty name
                client1.emit("login", { "fromUser": "" });
                //name is less then 3
                client1.emit("login", { "fromUser": "ab" });
                //name is more then 16
                client1.emit("login", { "fromUser": "anhaa" });
            });

            client1.on("err", function (data) {
                assert.equal(data["content"], "Bad user name!");

                messagesCount++;
                if (messagesCount == 2) {
                    client1.disconnect();
                    done();
                }

            });
        });

        it("should raise error if user with same 'SOCKET' logged in ", function (done) {
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Antony" });

                setTimeout(function () {
                    client1.emit("login", { "fromUser": "Antony2" });
                }, 1000);
            });

            client1.on("err", function (data) {
                //data["content"].should.equal("Welcome!");
                assert.equal(data["content"], "Can't login twice!");
                client1.disconnect();
                done();
            });
        });


        it("should raise error if user with same name logged in", function (done) {
            var client1, client2;

            messagesCount = 0;
            varCheckLogin = function (client, eventName, resultString) {
                client.on(eventName, function (data) {
                    //data["content"].should.equal(resultString);
                    assert.equal(data["content"], resultString);
                    messagesCount++;
                    if (messagesCount == 2) {
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    }
                });
            };

            client1 = io.connect(socketURL, options);
            varCheckLogin(client1, 'welcome', "Welcome!");

            //Connect First client
            client1.on('connect', function (data) {
                client2 = io.connect(socketURL, options);

                client1.emit("login", { "fromUser": "Client1" });

                varCheckLogin(client2, 'err', "Name 'Client1' already exists!");
                client2.on('connect', function (data) {
                    client2.emit("login", { "fromUser": "Client1" });
                });
            });
        });

    });
});