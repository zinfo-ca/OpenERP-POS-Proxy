OpenERP-POS-Proxy
=================

This is an OpenERP POS Proxy written in node.js.  The proxy is used to communicate with devices like thermal printer, pole display, cash drawers.

Quick start
-----------

**Clone the project:**

    git clone git://github.com/zinfo-ca/OpenERP-POS-Proxy.git
    cd OpenERP-POS-Proxy
    npm install .

**To start the proxy:**
    node app

node app.js [PrinterDevicePort] [DisplayDevicePort] [DisplayInitFirstLine] [DisplayInitSecondLine] [DisplayOffFirstLine] [DisplayOffSecondLine]

The arguments are optional. 

Defaults are :

PrinterDevicePort = "/dev/ttyS0"
DisplayDevicePort = "/dev/ttyUSB0"
DisplayInitFirstLine = "Bonjour"
DisplayInitSecondLine = "Welcome"
DisplayOffFirstLine = "Fermé"
DisplayOffSecondLine = "Closed"
