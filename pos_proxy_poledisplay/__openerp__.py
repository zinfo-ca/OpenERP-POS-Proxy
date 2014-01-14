# -*- coding: utf-8 -*-
{
    'name': 'POS Proxy PoleDisplay',
    'version': '1.0.0',
    'category': 'Point Of Sale',
    'sequence': 3,
    'author': 'ZEA Informatique Inc.',
    'summary': 'Pole Display via proxy for Point Of Sale',
    'description': """
Manage the proxy for Point of Sale Pole Display peripheral
======================================
This module adds functionality for sale information to be sent to a Point of Sale pole display via proxy, similar to the "print via proxy" option.

    """,
    'depends': ["point_of_sale"],
    'js': [
        'static/src/js/pos_proxy_poledisplay.js',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
