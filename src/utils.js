// hey let's see how javascript modules work

const Stream = require("node:stream");
const mystream = new Stream.Writable();

mystream._write = (chunk, encoding, cb) => {
    console.log("in the stream");
    console.log(chunk);
    console.log("callback");
    console.log(cb);
    cb();
}

mystream.on('open', function () { console.log("OPEN")})
mystream.on('close', function () { console.log("CLOSE")})
mystream.on('error', function () { console.log("ERROR")})
mystream.on('pipe', function () { console.log("PIPE")})
mystream.on('finish', function () { console.log("FINISH")})
module.exports = { mystream }