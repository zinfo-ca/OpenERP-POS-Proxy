"use strict";

var escpos = require('../lib/node-escpos.js');
var EscPosDisplay = escpos.EscPosDisplay;
var poleDisplay = new EscPosDisplay("/dev/ttyUSB0");

poleDisplay.on("ready", function() {
    console.log('poleDisplay ready.');
    poleDisplay.text("      Bienvenue\n\r       Welcoméà");
    poleDisplay.showCursor(true);
});

exports.print_receipt = function(req, res) {
    console.log('METHOD');
    console.log(req.method);
    console.log('QUERY');
    console.log(req.query);
    var jsonResponse = {};
    var receipt = {};
    var jsonpData;

    if (req.method === 'GET') {
        if (req.query.r) {
            jsonpData = JSON.parse(req.query.r);
        }
    } else {
        if (req.body.r) {
            jsonpData = JSON.parse(req.body.r);
        }
    }

    if (jsonpData) {
        receipt = jsonpData.params.receipt;
        console.log(receipt);
    }

    jsonResponse.id = req.query.id;
    console.log('RESPONSE');
    console.log(jsonResponse);
    res.json(jsonResponse);
};

exports.open_cashbox = function(req, res) {
    var jsonpData = JSON.parse(req.query.r);
    console.log(jsonpData);
    var jsonResponse = {id: jsonpData.params.id};
    res.json(jsonResponse);
};

exports.pole_display = function(req, res) {
    var text;

    if (req.query.r) {
        var jsonpData = JSON.parse(req.query.r);
        text = jsonpData.params.text;
    }

    if (req.query.line1) {

        text = req.query.line1;
        if (req.query.line2) {
            text += "\n\r";
            text += req.query.line2;
        }
    }

    if (text) {
        console.log('Pole display: ' + text);
        poleDisplay.text("\x1b\x40");
        poleDisplay.text(text);
    }

    var jsonResponse = {id: "OK"};
    res.json(jsonResponse);
};

