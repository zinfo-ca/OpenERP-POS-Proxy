# -*- coding: utf-8 -*-
{
    'name': 'POS Taxes Quebec',
    'version': '1.0.0',
    'category': 'Point Of Sale',
    'sequence': 3,
    'author': 'ZEA Informatique Inc.',
    'summary': 'Ajout de TPS et TVQ sur la facture dans Point of Sale',
    'description': """
Ajout TPS et TVQ sur la facture dans Point of Sale 
======================================
Ce module ajoute le montant et le texte des taxes Canadienne (TPS) et Québécoise (TVQ) sur le sommaire d'une transaction et la facture dans Point Of Sale. 
Dans le POS, il suffit d'utiliser la taxe portant le nom "TPS + TVQ sur les ventes" code "TPSTVQ_SALE" disponible dans le tableau de compte "Canada - Plan compatible pour les provinces francophones".  Le module s'occupe de prendre les deux sous taxes et les ajoute automatiquement sur les factures.

    """,
    'depends': ["point_of_sale"],
    'js': [
        'static/src/js/pos_taxes_quebec.js',
    ],
    'css': [
        'static/src/css/pos_taxes_quebec.css',
    ],
    'qweb': [
        'static/src/xml/pos_taxes_quebec.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
