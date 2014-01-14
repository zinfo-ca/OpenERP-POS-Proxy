function openerp_pos_taxes_quebec(instance, module){ //module is instance.point_;of_sale
    var module = instance.point_of_sale;
    var QWeb = instance.web.qweb;
    _t = instance.web._t;
    var round_di = instance.web.round_decimals;
    var round_pr = instance.web.round_precision;

    module.TaxesQuebecOrderWidget = module.OrderWidget.include({
        template:'OrderWidget',
        update_summary: function(){
            var order = this.pos.get('selectedOrder');
            var total     = order ? order.getTotalTaxIncluded() : 0;
            var taxes     = order ? total - order.getTotalTaxExcluded() : 0;
//TPSTVQ B
            var tps     = order ? order.getTps() : 0;
            var tvq     = order ? order.getTvq() : 0;
//TPSTVQ E
            this.$('.summary .total > .value').html(this.format_currency(total));
            this.$('.summary .total .tps .value').html(this.format_currency(tps));
            this.$('.summary .total .tvq .value').html(this.format_currency(tvq));
            this.$('.summary .total .subentry .value').html(this.format_currency(taxes));
        },
        set_display_mode: function(mode){
            if(this.display_mode !== mode){
                this.display_mode = mode;
                this.renderElement();
            }
        },
    });

    module.Orderline = Backbone.Model.extend({
        initialize: function(attr,options){
            this.pos = options.pos;
            this.order = options.order;
            this.product = options.product;
            this.price   = options.product.get('price');
            this.quantity = 1;
            this.quantityStr = '1';
            this.discount = 0;
            this.discountStr = '0';
            this.type = 'unit';
            this.selected = false;
        },
        // sets a discount [0,100]%
        set_discount: function(discount){
            var disc = Math.min(Math.max(parseFloat(discount) || 0, 0),100);
            this.discount = disc;
            this.discountStr = '' + disc;
            this.trigger('change');
        },
        // returns the discount [0,100]%
        get_discount: function(){
            return this.discount;
        },
        get_discount_str: function(){
            return this.discountStr;
        },
        get_product_type: function(){
            return this.type;
        },
        // sets the quantity of the product. The quantity will be rounded according to the 
        // product's unity of measure properties. Quantities greater than zero will not get 
        // rounded to zero
        set_quantity: function(quantity){
            if(quantity === 'remove'){
                this.order.removeOrderline(this);
                return;
            }else{
                var quant = Math.max(parseFloat(quantity) || 0, 0);
                var unit = this.get_unit();
                if(unit){
                    this.quantity    = Math.max(unit.rounding, round_pr(quant, unit.rounding));
                    this.quantityStr = this.quantity.toFixed(Math.max(0,Math.ceil(Math.log(1.0 / unit.rounding) / Math.log(10))));
                }else{
                    this.quantity    = quant;
                    this.quantityStr = '' + this.quantity;
                }
            }
            this.trigger('change');
        },
        // return the quantity of product
        get_quantity: function(){
            return this.quantity;
        },
        get_quantity_str: function(){
            return this.quantityStr;
        },
        get_quantity_str_with_unit: function(){
            var unit = this.get_unit();
            if(unit && unit.name !== 'Unit(s)'){
                return this.quantityStr + ' ' + unit.name;
            }else{
                return this.quantityStr;
            }
        },
        // return the unit of measure of the product
        get_unit: function(){
            var unit_id = (this.product.get('uos_id') || this.product.get('uom_id'));
            if(!unit_id){
                return undefined;
            }
            unit_id = unit_id[0];
            if(!this.pos){
                return undefined;
            }
            return this.pos.get('units_by_id')[unit_id];
        },
        // return the product of this orderline
        get_product: function(){
            return this.product;
        },
        // selects or deselects this orderline
        set_selected: function(selected){
            this.selected = selected;
            this.trigger('change');
        },
        // returns true if this orderline is selected
        is_selected: function(){
            return this.selected;
        },
        // when we add an new orderline we want to merge it with the last line to see reduce the number of items
        // in the orderline. This returns true if it makes sense to merge the two
        can_be_merged_with: function(orderline){
            if( this.get_product().get('id') !== orderline.get_product().get('id')){    //only orderline of the same product can be merged
                return false;
            }else if(this.get_product_type() !== orderline.get_product_type()){
                return false;
            }else if(this.get_discount() > 0){             // we don't merge discounted orderlines
                return false;
            }else if(this.price !== orderline.price){
                return false;
            }else{ 
                return true;
            }
        },
        merge: function(orderline){
            this.set_quantity(this.get_quantity() + orderline.get_quantity());
        },
        export_as_JSON: function() {
            return {
                qty: this.get_quantity(),
                price_unit: this.get_unit_price(),
                discount: this.get_discount(),
                product_id: this.get_product().get('id'),
            };
        },
        //used to create a json of the ticket, to be sent to the printer
        export_for_printing: function(){
            return {
                quantity:           this.get_quantity(),
                unit_name:          this.get_unit().name,
                price:              this.get_unit_price(),
                discount:           this.get_discount(),
                product_name:       this.get_product().get('name'),
                price_display :     this.get_display_price(),
                price_with_tax :    this.get_price_with_tax(),
                price_without_tax:  this.get_price_without_tax(),
                tax:                this.get_tax(),
//TPSTVQ B
                tps:                this.get_tps(),
                tvq:                this.get_tvq(),
//TPSTVQ E
                product_description:      this.get_product().get('description'),
                product_description_sale: this.get_product().get('description_sale'),
            };
        },
        // changes the base price of the product for this orderline
        set_unit_price: function(price){
            this.price = round_di(parseFloat(price) || 0, 2);
            this.trigger('change');
        },
        get_unit_price: function(){
            var rounding = this.pos.get('currency').rounding;
            return round_pr(this.price,rounding);
        },
        get_display_price: function(){
            var rounding = this.pos.get('currency').rounding;
            return  round_pr(round_pr(this.get_unit_price() * this.get_quantity(),rounding) * (1- this.get_discount()/100.0),rounding);
        },
        get_price_without_tax: function(){
            return this.get_all_prices().priceWithoutTax;
        },
        get_price_with_tax: function(){
            return this.get_all_prices().priceWithTax;
        },
        get_tax: function(){
            return this.get_all_prices().tax;
        },
//TPSTVQ B
        get_tps: function(){
            return this.get_all_prices().tps;
        },
        get_tvq: function(){
            return this.get_all_prices().tvq;
        },
//TPSTVQ E
        compute_all: function(taxes, price_unit){
            var self = this;
            var res = []
            var currency_rounding = this.pos.get('currency').rounding;
            var base = price_unit;
            _(taxes).each(function(tax) {
                if (tax.price_include) {
                    if (tax.type === "percent") {
                        tmp =  base - round_pr(base / (1 + tax.amount),currency_rounding);
                        data = {amount:tmp, price_include:true}
                        res.push(data) 
                    } else if (tax.type === "fixed") {
                        tmp = round_pr(tax.amount * self.get_quantity(),currency_rounding);
                        data = {amount:tmp, price_include:true}
                        res.push(data)
                    } else {
                        throw "This type of tax is not supported by the point of sale: " + tax.type;
                    }
                } else {
                    if (tax.type === "percent") {
                        tmp = tax.amount * base;
                        data = {amount:tmp, price_include:false}
                        res.push(data)
                    } else if (tax.type === "fixed") {
                        tmp = tax.amount * self.get_quantity();
                        data = {amount:tmp, price_include:false}
                        res.push(data)
                    } else {
                        throw "This type of tax is not supported by the point of sale: " + tax.type;
                    }
                    amount2 = data.amount;
                    var amount3 = 0.0;
                    if (tax.child_ids) {
                        if (tax.child_depend) {
                            latest = res.pop()
                        }
                        amount = amount2
                        child_tax = self.compute_all(tax.child_ids, amount);
                        res.push(child_tax)
                        _(child_tax).each(function(child) {
                            amount3 += child.amount
                        });
                    }
                }
                if (tax.include_base_amount) {
                    base += amount2 + amount3
                }
            });
            return res
            },
        get_all_prices: function(){
            var self = this;
            var currency_rounding = this.pos.get('currency').rounding;
            var base = round_pr(this.get_quantity() * this.get_unit_price() * (1.0 - (this.get_discount() / 100.0)), currency_rounding);
            var totalTax = base;
            var totalNoTax = base;
            var product_list = this.pos.get('product_list');
            var product =  this.get_product(); 
            var taxes_ids = product.get('taxes_id');
            var taxes =  self.pos.get('taxes');
            var taxtotal = 0;
            var product_taxes = []
            _(taxes_ids).each(function(el){
                product_taxes.push(_.detect(taxes, function(t) { return t.id === el;}));
            });
//TPSTVQ B
            var totaltps = 0;
            var totaltvq = 0;
            _(product_taxes).each(function(tax){
                if (tax.child_ids) {
                    if (tax.child_depend) {
                        _(tax.child_ids).each(function(child){
	    	if (totaltvq == 0 && totaltps != 0) {
			totaltvq = child.amount * base;
		}
	    	if (totaltps == 0) {
			totaltps = child.amount * base;
			}
                        });
                    }
                }
	    });
//TPSTVQ E
            all_taxes = this.compute_all(product_taxes, base);
            var all_taxes = _(all_taxes).flatten()
            _(all_taxes).each(function(tax) {
               if (tax.price_include === true) {
                   totalNoTax -= tax.amount
               } else {
                   totalTax += tax.amount
               }
               taxtotal += tax.amount
            });
            return {
                "priceWithTax": totalTax,
                "priceWithoutTax": totalNoTax,
                "tax": taxtotal,
//TPSTVQ B
		"tps": totaltps,
		"tvq": totaltvq
//TPSTVQ E
            };
        },
    });

    module.Order = Backbone.Model.extend({
        initialize: function(attributes){
            Backbone.Model.prototype.initialize.apply(this, arguments);
            this.set({
                creationDate:   new Date(),
                orderLines:     new module.OrderlineCollection(),
                paymentLines:   new module.PaymentlineCollection(),
                name:           "Order " + this.generateUniqueId(),
                client:         null,
            });
            this.pos =     attributes.pos; 
            this.selected_orderline = undefined;
            this.screen_data = {};  // see ScreenSelector
            this.receipt_type = 'receipt';  // 'receipt' || 'invoice'
            return this;
        },
        generateUniqueId: function() {
            return new Date().getTime();
        },
        addProduct: function(product, options){
            options = options || {};
            var attr = product.toJSON();
            attr.pos = this.pos;
            attr.order = this;
            var line = new module.Orderline({}, {pos: this.pos, order: this, product: product});

            if(options.quantity !== undefined){
                line.set_quantity(options.quantity);
            }
            if(options.price !== undefined){
                line.set_unit_price(options.price);
            }

            var last_orderline = this.getLastOrderline();
            if( last_orderline && last_orderline.can_be_merged_with(line) && options.merge !== false){
                last_orderline.merge(line);
            }else{
                this.get('orderLines').add(line);
            }
            this.selectLine(this.getLastOrderline());
        },
        removeOrderline: function( line ){
            this.get('orderLines').remove(line);
            this.selectLine(this.getLastOrderline());
        },
        getLastOrderline: function(){
            return this.get('orderLines').at(this.get('orderLines').length -1);
        },
        addPaymentLine: function(cashRegister) {
            var paymentLines = this.get('paymentLines');
            var newPaymentline = new module.Paymentline({},{cashRegister:cashRegister});
            if(cashRegister.get('journal').type !== 'cash'){
                newPaymentline.set_amount( this.getDueLeft() );
            }
            paymentLines.add(newPaymentline);
        },
        getName: function() {
            return this.get('name');
        },
        getSubtotal : function(){
            return (this.get('orderLines')).reduce((function(sum, orderLine){
                return sum + orderLine.get_display_price();
            }), 0);
        },
        getTotalTaxIncluded: function() {
            return (this.get('orderLines')).reduce((function(sum, orderLine) {
                return sum + orderLine.get_price_with_tax();
            }), 0);
        },
        getDiscountTotal: function() {
            return (this.get('orderLines')).reduce((function(sum, orderLine) {
                return sum + (orderLine.get_unit_price() * (orderLine.get_discount()/100) * orderLine.get_quantity());
            }), 0);
        },
        getTotalTaxExcluded: function() {
            return (this.get('orderLines')).reduce((function(sum, orderLine) {
                return sum + orderLine.get_price_without_tax();
            }), 0);
        },
        getTax: function() {
            return (this.get('orderLines')).reduce((function(sum, orderLine) {
                return sum + orderLine.get_tax();
            }), 0);
        },
//TPSTVQ B
        getTps: function() {
            return (this.get('orderLines')).reduce((function(sum, orderLine) {
                return sum + orderLine.get_tps();
            }), 0);
        },
        getTvq: function() {
            return (this.get('orderLines')).reduce((function(sum, orderLine) {
                return sum + orderLine.get_tvq();
            }), 0);
        },
//TPSTVQ E
        getPaidTotal: function() {
            return (this.get('paymentLines')).reduce((function(sum, paymentLine) {
                return sum + paymentLine.get_amount();
            }), 0);
        },
        getChange: function() {
            return this.getPaidTotal() - this.getTotalTaxIncluded();
        },
        getDueLeft: function() {
            return this.getTotalTaxIncluded() - this.getPaidTotal();
        },
        // sets the type of receipt 'receipt'(default) or 'invoice'
        set_receipt_type: function(type){
            this.receipt_type = type;
        },
        get_receipt_type: function(){
            return this.receipt_type;
        },
        // the client related to the current order.
        set_client: function(client){
            this.set('client',client);
        },
        get_client: function(){
            return this.get('client');
        },
        get_client_name: function(){
            var client = this.get('client');
            return client ? client.name : "";
        },
        // the order also stores the screen status, as the PoS supports
        // different active screens per order. This method is used to
        // store the screen status.
        set_screen_data: function(key,value){
            if(arguments.length === 2){
                this.screen_data[key] = value;
            }else if(arguments.length === 1){
                for(key in arguments[0]){
                    this.screen_data[key] = arguments[0][key];
                }
            }
        },
        //see set_screen_data
        get_screen_data: function(key){
            return this.screen_data[key];
        },                           
        // exports a JSON for receipt printing
        export_for_printing: function(){
            var orderlines = [];
            this.get('orderLines').each(function(orderline){
                orderlines.push(orderline.export_for_printing());
            });

            var paymentlines = [];
            this.get('paymentLines').each(function(paymentline){
                paymentlines.push(paymentline.export_for_printing());
            });
            var client  = this.get('client');
            var cashier = this.pos.get('cashier') || this.pos.get('user');
            var company = this.pos.get('company');
            var shop    = this.pos.get('shop');
            var date = new Date();

            return {
                orderlines: orderlines,
                paymentlines: paymentlines,
                subtotal: this.getSubtotal(),
                total_with_tax: this.getTotalTaxIncluded(),
                total_without_tax: this.getTotalTaxExcluded(),
                total_tax: this.getTax(),
                total_paid: this.getPaidTotal(),
                total_discount: this.getDiscountTotal(),
                change: this.getChange(),
                name : this.getName(),
                client: client ? client.name : null ,
                invoice_id: null,   //TODO
                cashier: cashier ? cashier.name : null,
                date: { 
                    year: date.getFullYear(), 
                    month: date.getMonth(), 
                    date: date.getDate(),       // day of the month 
                    day: date.getDay(),         // day of the week 
                    hour: date.getHours(), 
                    minute: date.getMinutes() 
                }, 
                company:{
                    email: company.email,
                    website: company.website,
                    company_registry: company.company_registry,
                    contact_address: company.contact_address, 
                    vat: company.vat,
                    name: company.name,
                    phone: company.phone,
                },
                shop:{
                    name: shop.name,
                },
                currency: this.pos.get('currency'),
            };
        },
        exportAsJSON: function() {
            var orderLines, paymentLines;
            orderLines = [];
            (this.get('orderLines')).each(_.bind( function(item) {
                return orderLines.push([0, 0, item.export_as_JSON()]);
            }, this));
            paymentLines = [];
            (this.get('paymentLines')).each(_.bind( function(item) {
                return paymentLines.push([0, 0, item.export_as_JSON()]);
            }, this));
            return {
                name: this.getName(),
                amount_paid: this.getPaidTotal(),
                amount_total: this.getTotalTaxIncluded(),
                amount_tax: this.getTax(),
                amount_return: this.getChange(),
                lines: orderLines,
                statement_ids: paymentLines,
                pos_session_id: this.pos.get('pos_session').id,
                partner_id: this.pos.get('client') ? this.pos.get('client').id : undefined,
                user_id: this.pos.get('cashier') ? this.pos.get('cashier').id : this.pos.get('user').id,
            };
        },
        getSelectedLine: function(){
            return this.selected_orderline;
        },
        selectLine: function(line){
            if(line){
                if(line !== this.selected_orderline){
                    if(this.selected_orderline){
                        this.selected_orderline.set_selected(false);
                    }
                    this.selected_orderline = line;
                    this.selected_orderline.set_selected(true);
                }
            }else{
                this.selected_orderline = undefined;
            }
        },
    });

};

openerp.point_of_sale = function(instance) {
    instance.point_of_sale = {};

    var module = instance.point_of_sale;

    openerp_pos_db(instance,module);            // import db.js
    openerp_pos_models(instance,module);        // import pos_models.js
    openerp_pos_basewidget(instance,module);    // import pos_basewidget.js
    openerp_pos_keyboard(instance,module);      // import  pos_keyboard_widget.js
    openerp_pos_scrollbar(instance,module);     // import pos_scrollbar_widget.js
    openerp_pos_screens(instance,module);       // import pos_screens.js
    openerp_pos_widgets(instance,module);       // import pos_widgets.js
    openerp_pos_devices(instance,module);       // import pos_devices.js

    openerp_pos_taxes_quebec(instance,module);       // import openerp_pos_proxy_taxes_quebec

    instance.web.client_actions.add('pos.ui', 'instance.point_of_sale.PosWidget');
};

