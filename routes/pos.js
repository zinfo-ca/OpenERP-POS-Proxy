"use strict";

var escpos = require('../lib/node-escpos.js');
var EscPosDisplay = escpos.EscPosDisplay;
var EscPosPrinter = escpos.EscPosPrinter;
var poleDisplay = new EscPosDisplay("/dev/ttyUSB0");
var printer = new EscPosPrinter("/dev/ttyS0");

poleDisplay.on("ready", function() {
    console.log('poleDisplay ready.');
    poleDisplay.showCursor(true);
    poleDisplay.centeredUpperLine("Bienvenue");
    poleDisplay.centeredBottomLine("Welcome");
});

printer.on("ready", function() {
    console.log('printer ready.');
    printer.printLine("printLine test");
    printer.printCentered("printCentered test");
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
        printer.printCentered(receipt.company['name']);
        printer.printCentered(receipt.company['contact_address']);
        printer.printCentered(receipt.company['phone']);
        printer.printCentered("F A C T U R E");
        printer.printCentered(receipt.date['year'] + '-' + receipt.date['month'] + '-'+ receipt.date['date'] + ' - ' + receipt.date['hour'] + ':' + receipt.date['minute']);
        printer.printCentered(receipt.orderlines[0].quantity + ' ' + receipt.orderlines[0].product_name + ' ' + receipt.orderlines[0].price_display.toFixed(2) + ' $');
        printer.printCentered('Sous-Total ' + receipt.subtotal.toFixed(2) + ' $');
        printer.printCentered('TPS ' + receipt.orderlines[0].tps + ' $');
        printer.printCentered('TVQ ' + receipt.orderlines[0].tvq + ' $');
        printer.printCentered('Total ' + receipt.total_with_tax.toFixed(2) + ' $');
        printer.printCentered('ARGENT ' + receipt.total_paid + ' $');        
        printer.printLine('No. TPS: ');
        printer.printLine('No. TPS: ');        
        printer.printCentered('VOUS AVEZ ETE SERVI PAR');
        printer.printCentered(receipt.cashier);
        printer.printCentered('Merci et revenez nous voir!');         
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

    if (text) {
        console.log('Pole display: ' + text);
        poleDisplay.text("\x1b\x40");
        poleDisplay.text(text);
    } else {
        if (req.query.line1) {
            poleDisplay.centeredUpperLine(req.query.line1);
        }
        if (req.query.line2) {
            poleDisplay.centeredBottomLine(req.query.line2);
        }
    }


    var jsonResponse = {id: "OK"};
    res.json(jsonResponse);
};

