# -*- coding: utf-8 -*-
##############################################################################
#    
# Module : pos_quebec
# Créé le : 2014-01-14 par ZEA Informatique Inc.
#
# Ajout de TPS et TVQ sur la facture dans Point of Sale et proxy d\'écran client
#
##############################################################################
import openerp
from openerp import netsvc, tools, pooler
from openerp.osv import fields, osv
from openerp.tools.translate import _
import time

class inherit_pos_order_for_quebec(osv.osv):
    _name='pos.order'
    _inherit='pos.order'

    def get_tax_detail(self, cr, uid, tax_browse, fields, context=None):
        account_tax_obj = self.pool.get('account.tax')
        taxes = {}
        tax_result = account_tax_obj.read(cr, uid, tax_browse.id, fields, context=context)
        if tax_browse.child_ids:
            child_result = []
            for child in tax_browse.child_ids:
                 child_result.append(self.get_tax_detail(cr, uid, child, fields, context=context))
            tax_result['child_ids'] = child_result
        return tax_result

    def get_all_taxes(self, cr, uid, fields, context=None):
        account_tax_obj = self.pool.get('account.tax')
        tax_ids = account_tax_obj.search(cr, uid, [('parent_id', '=', False)], context=context)
        result = []
        for tax_browse in account_tax_obj.browse(cr, uid, tax_ids, context=context):
            tax_result = self.get_tax_detail(cr, uid, tax_browse, fields, context=context)
            result.append(tax_result)
        return result

inherit_pos_order_for_quebec()

