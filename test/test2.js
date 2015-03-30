var assert = require("assert");
var should = require("should");

//var should = require('should');
var io = require('socket.io-client');
var socketURL = "http://localhost:4567";

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var chatUser1 = { "name": "Tom" };
var chatUser2 = { "name": "Sally" };
var chatUser3 = { "name": "Dana" };

var messagesCount = 0;

describe("Array", function () {
    describe("#indexOf()", function () {
        it("should return -1 when the value is not present", function () {
            assert.equal(-1, [1, 2, 3].indexOf(5));
            assert.equal(-1, [1, 2, 3].indexOf(0));
        });

        it("bear has 4 legs", function () {
            assert.equal(4, 4);
        });

    });
});