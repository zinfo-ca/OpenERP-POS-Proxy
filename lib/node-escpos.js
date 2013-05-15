"use strict";

var util = require('util');
var serialport = require("serialport");
var Iconv = require('iconv').Iconv;
var SerialPort = serialport.SerialPort;

var controlCodes = {
    NUL: String.fromCharCode(0),
    EOT: String.fromCharCode(4),
    ENQ: String.fromCharCode(5),
    HT: String.fromCharCode(9),
    LF: String.fromCharCode(10),
    FF: String.fromCharCode(12),
    CR: String.fromCharCode(13),
    DLE: String.fromCharCode(16),
    DC4: String.fromCharCode(20),
    CAN: String.fromCharCode(24),
    ESC: String.fromCharCode(27),
    FS: String.fromCharCode(28),
    GS: String.fromCharCode(29)
};

var escPosCommands = {
    hwInit: "\x1b\x40"
};

var centerText = function(txt, lineWidth) {
    if(txt.length < lineWidth -2) {
        var pad = "";
        var nbSpaces = (lineWidth - txt.length)/2;
        for(var i=0; i<nbSpaces; i++) {
            pad += " ";
        }
        return pad + txt;
    } else {
        return txt;
    }
}

function EscPos(path, options) {
    serialport.SerialPort.call(this, path, options);
    var self = this;

    this.on("open", function() {
        self.write(escPosCommands.hwInit);
        self.emit('ready');
    });
}
util.inherits(EscPos, serialport.SerialPort);

EscPos.prototype.text = function(txt) {
    var iconv = new Iconv('UTF-8', 'CP437//TRANSLIT//IGNORE');
    var buffer = iconv.convert(txt);
    this.write(buffer);
};

/****************************************************
 * 
 * ESC/POS SFD DISPLAY STUFF
 * 
 ****************************************************/
var escPosVfdCommands = {
    moveCursorRight: "\x09",
    moveCursorLeft: "\x08",
    moveCursorUp: "\x1F\x0A",
    moveCursorDown: "\x0A",
    moveCursorRightMostPosition: "\x1F\x0D",
    moveCursorLeftMostPosition: "\x0D",
    moveCursorHomePosition: "\x0B",
    moveCursorBottomPosition: "\x1F\x42",
    cursorGoto: "\x1F\x24", // 1F 24 x y (1 <= x <= 20; 1 <= y <= 2)
    cursorDisplay: "\x1f\x43", // 1F 43 n (n=0, hide; n=1, show)
    clearScreen: "\x0C",
    clearCursorLine: "\x18",
    brightness: "\x1F\x58", // 1F 58 n (1 <= n <= 4)
    blinkDisplay: "\x1F\x45" // 1F 45 n (0 < n < 255 (n*50msec ON / n*50msec OFF; n=0, blink canceled; n=255, display turned off)
};

function EscPosDisplay(path, options) {
    EscPos.call(this, path, options);
    var self = this;
    this.on('data', function(data) {
        console.log("EscPosDisplay at " + self.path + "received data: " + data);
        self.emit('data', data);
    });
}
util.inherits(EscPosDisplay, EscPos);

EscPosDisplay.prototype.showCursor = function(v) {
    if (v === true) {
        this.write(escPosVfdCommands.cursorDisplay + String.fromCharCode(1));
    } else {
        this.write(escPosVfdCommands.cursorDisplay + String.fromCharCode(0));
    }
};

EscPosDisplay.prototype.centeredUpperLine = function(txt) {
    this.write(escPosVfdCommands.moveCursorHomePosition);
    this.write(escPosVfdCommands.clearCursorLine);
    this.text(centerText(txt, 20));
};

EscPosDisplay.prototype.centeredBottomLine = function(txt) {
    this.write(escPosVfdCommands.moveCursorBottomPosition);
    this.write(escPosVfdCommands.clearCursorLine);
    this.text(centerText(txt, 20));
};

/****************************************************
 * 
 * ESC/POS PRINTER STUFF
 * 
 ****************************************************/
var escPosPrinterCommands = {
};

function EscPosPrinter(path, options) {
    EscPos.call(this, path, options);
    var self = this;
    this.on('data', function(data) {
        console.log("EscPosPrinter at " + self.path + "received data: " + data);
        self.emit('data', data);
    });
}
util.inherits(EscPosPrinter, EscPos);

module.exports.EscPosDisplay = EscPosDisplay;
module.exports.EscPosDisplay = EscPosPrinter;