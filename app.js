
/**
 * Module dependencies.
 */

var express = require('express'),
        pos = require('./routes/pos'),
        http = require('http'),
        path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8069);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('jsonp callback', true);
app.set('env', 'development');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/pos/print_receipt', pos.print_receipt);
app.post('/pos/print_receipt', pos.print_receipt);
app.get('/pos/open_cashbox', pos.open_cashbox);
app.get('/pos/pole_display', pos.pole_display);

if ('development' == app.get('env')) {
    http.createServer(app).listen(app.get('port'), function() {
        console.log('OpenERP POS proxy server listening on port *:' + app.get('port'));
    });
} else {
    http.createServer(app).listen(app.get('port'), 'localhost', function() {
        console.log('OpenERP POS proxy server listening on port localhost:' + app.get('port'));
    });
}
