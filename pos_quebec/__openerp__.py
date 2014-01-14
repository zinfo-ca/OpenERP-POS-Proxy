# -*- coding: utf-8 -*-
{
    'name': 'POS Quebec',
    'version': '1.0.0',
    'category': 'Point Of Sale',
    'sequence': 3,
    'author': 'ZEA Informatique Inc.',
    'summary': 'Ajout de TPS et TVQ sur la facture dans Point of Sale et proxy d\'écran client',
    'description': """
Ajout TPS et TVQ sur la facture dans Point of Sale ainsi que proxy pour écran client.
======================================
Ce module ajoute le montant et le texte des taxes Canadienne (TPS) et Québécoise (TVQ) sur le sommaire d'une transaction et la facture dans Point Of Sale. 
Dans le POS, il suffit d'utiliser la taxe portant le nom "TPS + TVQ sur les ventes" code "TPSTVQ_SALE" disponible dans le tableau de compte "Canada - Plan compatible pour les provinces francophones".  Le module s'occupe de prendre les deux sous taxes et les ajoute automatiquement sur les factures.
Ce module inclus aussi la fonctionnalité pour que l'information de vente soie envoyer sur un écran client de point de vente via un proxy, semblable a l'option "print via proxy".

    """,
    'depends': ["point_of_sale"],
    'js': [
        'static/src/js/pos_quebec.js',
    ],
    'css': [
        'static/src/css/pos_quebec.css',
    ],
    'qweb': [
        'static/src/xml/pos_quebec.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
