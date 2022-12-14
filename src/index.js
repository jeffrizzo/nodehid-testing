const defaultCommand = 0xa;

//import { mystream } from "./utils.js"
const me = require('./utils.js')

var command = defaultCommand;
var sendReports = 1; // default we're sending 1 report
var payload = Uint8Array.of(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
const args = process.argv.slice(2);

if (args[0]) {
    command = args[0];
}

var HID = require('node-hid');
var devices = HID.devices();
const cbor = require('node-cbor');

var deviceInfo = devices.find (function (d) {
    var isMyDevice = false;
    if (d.vendorId === 0x1d50) {
        if (d.productId === 0x615e || d.productId === 0x8002) {
            isMyDevice = true;
        }
    }
    //var isMyDevice = d.vendorId == 7504 && d.productId == 24926;
    return isMyDevice && d.interface == 2;
})

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join(' ');
}

if (deviceInfo) {
    var device = new HID.HID(deviceInfo.path);

    device.on('end', function () { console.log("HI I HAVE ENDED")}).on('data', function squawk(data) {

        console.log("data: ", buf2hex(data));
        // data is a Buffer (in node), so this works.
        // Buffer has built-in methods like readInt16LE()
        const reportNum = data.slice(1,3).readInt16LE();
        const numReports = data.slice(3,5).readInt16LE();

        const cmd = data.readInt8();

        switch (cmd) {
            case 5:
                //let behaviorList;
                //if (reportNum === 1) {
                //    behaviorList = data.slice(5);
                //} else {
                //    behaviorList.concat(data.slice(5));
                //}
                console.log("get behaviors");
                break;
            case 25:
                const toDecode = data.slice(5);
                cbor.decodeAll(toDecode).then(
                    (value) => { console.log(value); }
                );

                me.mystream.write(toDecode);

                break;
            default:
                break;
        }
        //if (data.slice(0,1))
        // We're only processing one response, so if
        // this is the last report, let's stop here.
        if (reportNum == numReports) {
            console.log("got the last report");
            device.close();
        }
    });

    switch (parseInt(command)) {
        case 25: // 0x19
            console.log("command 0x19");
            foo = cbor.encodeOne(777);
            console.log(foo);
            // foo is a Buffer, let's put it in payload
            payload.set(foo);
            break;
        default:
            break;
    }

    for (let report = 1; report <= sendReports; report++) {
        var outputReport = new Uint8Array(64);
        outputReport.set(Uint8Array.of(command,1,0,1,0));
        outputReport.set(payload,5);
        console.log("size is %d", outputReport.length);
        //console.log(outputReport);
        console.log("send to device: ", buf2hex(outputReport));
        device.write(outputReport);
    }
} else {
    console.log("no MyDevice device found");
}
