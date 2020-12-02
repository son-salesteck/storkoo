(function ($) {
    // $ = jQuery.noConflict();
    var typeTakeAway = 0;
    var typeDelivery = 1;
    var sessionTimeOutStatus = -1;
    var _apiSrc = '/_api/_eshop/',
        lang = Fn._getLang()
    ;


    function checkStatusSessionTimeOut(status) {
        if (status === sessionTimeOutStatus) {
            setTimeout(function () {
                location.reload();
            }, BootstrapNotify.elemTimer);
        }
    }


    var merchantId = function () {
        return $('[data-merchant-id]').attr('data-merchant-id');
    };

    var Cartify = $.fn.Cartify = function (settings) {

        /**
         * Private property
         */

        settings = fnCartify.static._mergeSetting(settings);

        var dataOptions = {};

        var productsCart = [];

        var promotionsCart = null;

        var deliveryFee = 0;

        var that = this;

        /**
         * END Private property
         */


        /**
         * Private functions
         */

        function setData(data) {
            if (Fn._isSameType(data, {}) && !$.isEmptyObject(data)) {
                productsCart = data;
            }
            return productsCart;
        }

        function setOption(options) {
            if (Fn._isSameType(options, []) && !$.isEmptyObject(options)) {
                dataOptions = options;
            }
            return dataOptions;
        }

        function updateSession() {
            if (Cartify.defaults.debug) {
                console.log("updateSession() called", {productsCart: productsCart});
            }
            if (Fn._isStringNotEmpty(settings.sessionUrl)) {
                // var dataSend = {
                //     _q: 'cart', _cartElements: productsCart, lang: settings.lang,
                //     merchantId: settings.merchantId, _event: "update"
                // };

                // $.post(settings.sessionUrl, dataSend, function(){}, "json").done(function (ajaxResponse) {
                //     if (Cartify.defaults.debug) {
                //         console.log(ajaxResponse);
                //     }
                //     Cartify.initListener(that);
                // });
                $.post(settings.sessionUrl, {
                    _q: 'cart', _cartElements: JSON.stringify(productsCart),
                    merchantId: settings.merchantId, lang: settings.lang, _event: "update"
                }, function () {}, "json").done(function (response) {
                    if (Cartify.defaults.debug) {
                        console.log(response);
                    }
                    if(response.status === true){
                        var arrayCartElement = response.data;
                        drawCartElement(arrayCartElement);
                    }
                });
            }
        }

        /**
         * END Private functions
         */

        /**
         * Public property
         */

        that.settings = settings;

        that.jQuerySelector = that[0];

        /**
         * END Public property
         */


        /**
         * Public functions
         */

        that.options = function () {
            return dataOptions;
        };

        that.cartElements = function () {
            return productsCart;
        };

        that.product = function (productId) {
            if (Cartify.defaults.debug) {
                console.log("cartify.product(productId) called", productId);
            }

            return productsCart.find(function (element) {
                return element.idCode === productId;
            });
        };

        that.addCartElement = function (product) {//TODO
            var idSrc = Fn._getObjByProp(settings, indexes.idSrc, null);
            if (Fn._isStringNotEmpty(idSrc)) {
                var productId = Fn._getObjByProp(product, idSrc, null);
                if (Fn._isStringNotEmpty(productId)) {
                    var foundProduct = that.product(productId);
                    if (foundProduct) {

                    } else {
                        var productQty = Fn._getObjByProp(product, indexes.fieldOptions._qty, null);
                        if (productQty !== null && parseInt(productQty) > 0) {

                        }

                    }
                }

            }
        };

        that.setDeliveryFee = function (value) {
            deliveryFee = Fn._isInteger(value) ? Math.abs(value) : 0;
            that.clearPromotion();
            that.drawTotal();
        };

        that.removeCartElement = function (productId, index) {
            if (Cartify.defaults.debug || true) {
                console.log("removeCartElement(productId) called", {
                    productId: productId, index : index, productsCart : productsCart
                });
            }
            if (index >= 0 && index < productsCart.length) {
                productsCart.splice(index, 1);
                updateSession();
                return true;
            }
            return false;

        };

        that.updateCartElement = function (product, index) {
            if (Cartify.defaults.debug || true) {
                console.log("updateCartElement(product) called", {
                    product: product, index : index
                });
            }
            var priceSrc = Fn._getObjByProp(settings, indexes.priceSrc, '');
            if (index >=0 && index < productsCart.length && Fn._isStringNotEmpty(priceSrc)) {

                product[indexes._cartElementTotal] =
                    (product[priceSrc] + product[indexes._extraOptionsTotal] ) * product[indexes.fieldOptions._qty];
                productsCart[index] = product;
                updateSession(productsCart);

            }
        };


        function drawCartElement(arrayCartElement) {
            fnCartify.cart._emptyCart(that);
            $.each(arrayCartElement, function (index, cartElement) {
                if (Cartify.defaults.debug || true) {
                    console.log({cartElement: cartElement});
                }
                var priceSrc = Fn._getObjByProp(settings, indexes.priceSrc, '');
                if(Fn._isStringNotEmpty(priceSrc)){
                    var qty = Fn._getObjByProp(cartElement, indexes.fieldOptions._qty, null);
                    var price = Fn._getObjByProp(cartElement, priceSrc, null);
                    var productExtraTotal = Fn._getObjByProp(cartElement, indexes._extraOptionsTotal, 0);
                    if(Fn._isNumeric(qty) && Fn._isNumeric(price) && Fn._isNumeric(productExtraTotal)){
                        cartElement[indexes.fieldOptions._qty] = parseInt(qty);
                        cartElement[priceSrc] = parseInt(price);
                        cartElement[indexes._extraOptionsTotal] = parseInt(productExtraTotal);
                        cartElement[indexes._cartElementTotal] =
                            (cartElement[priceSrc] + cartElement[indexes._extraOptionsTotal] ) * cartElement[indexes.fieldOptions._qty];
                        fnCartify.cart._addElementToCart(that, cartElement);
                    }
                }
            });

            productsCart = arrayCartElement;
            that.resetCart(that);
            that.drawTotal();
            Cartify.initListener(that);
        }

        that.emptyCart = function () {
            if (Cartify.defaults.debug) {
                console.log("productify.emptyCart() called");
            }
            Cartify.event.onEmptyProduct(that);
            productsCart = [];
            updateSession();
            Cartify.event.postUpdateCart(that);

            return true;
        };

        that.cartTotal = function () {
            var total = 0;
            $.each(productsCart, function (index, cartItem) {
                var priceSrc = Fn._getObjByProp(that.settings, indexes.priceSrc, '');
                var productQty = Fn._getObjByProp(cartItem, indexes.fieldOptions._qty, -1);
                var productPrice = Fn._getObjByProp(cartItem, priceSrc, 0);
                var productExtraTotal = Fn._getObjByProp(cartItem, "_extraOptionsTotal", 0);
                productExtraTotal = Fn._isNumeric(productExtraTotal) ? parseInt(productExtraTotal) : 0;
                var  totalPrice = productPrice + productExtraTotal;
                cartItem[indexes._cartElementTotal] = (totalPrice * productQty);
                if (totalPrice && productQty) {
                    total += cartItem[indexes._cartElementTotal];
                }
            });
            return total;
        };

        that.promotion = function (promotionCode, promotionValue, promotionValueString) {
            if (
                Fn._isStringNotEmpty(promotionCode) && Fn._isInteger(promotionValue) && Fn._isStringNotEmpty(promotionValueString)
            ) {
                promotionsCart = {
                    code: promotionCode,
                    value: promotionValue,
                    valueString: promotionValueString
                };
                promotionsCart = $.extend(true, {}, Cartify.defaults.promotion.options, promotionsCart);
                that.drawTotal();
                console.log({
                    promotionsCart: promotionsCart
                });
            }
            return promotionsCart;
        };

        that.clearPromotion = function () {
            promotionsCart = null;
            that.drawTotal();
            fnCartify.form.promotion._reset(that);
        };

        that.draw = function () {
            Cartify.event.onDraw(that);
            fnCartify.cart._loadTableElement(that);
            that.resetCart(that);
            that.drawTotal();
            Cartify.initListener(that);
            return that;
        };


        that.drawTotal = function () {
            var total = 0;
            var cartTotal = that.cartTotal();
            fnCartify.form.subTotal._update(cartTotal);
            total += cartTotal;

            if (promotionsCart !== null) {

                fnCartify.form.promotion._update(promotionsCart.code, promotionsCart.value, promotionsCart.valueString);
                total -= promotionsCart.value;
            }
            total += deliveryFee;
            fnCartify.form.deliveryFee._update(that, deliveryFee);

            fnCartify.form.total._update(total);

        };

        that.resetCart = function (that) {
            that.setDeliveryFee(0);

            fnCartify.form._start(that);
        };

        that.init = function () {

            Cartify.event.init(that);
            if (Cartify.defaults.debug) {
                console.log("cartify.init() called");
            }
            var
                url = settings.ajax,
                dataSrc = settings.dataSrc
            ;
            Cartify.event.onInit(that);
            if (
                Fn._isStringNotEmpty(url) && Fn._isStringNotEmpty(dataSrc)
            ) {
                $.ajax({
                    url: url,
                    method: "POST",
                    async: false,
                    data: {_q: dataSrc, _event: "load", lang: settings.lang, merchantId: settings.merchantId},
                    success: function (response) {
                        response = JSON.parse(response);
                        if (Cartify.defaults.debug) {
                            console.log("init ajax response", {response: response});
                        }
                        setData(response.data);
                        Cartify.event.initDraw(that);
                        Cartify.event.preDraw(that);
                        that.draw();
                        Cartify.event.postDraw(that);
                    }
                });
            }

            return that;
        };

        /**
         * END Public functions
         */

        Cartify.event.preInit(that);
        that.init();
        Cartify.event.postInit(that);

        if (Cartify.defaults.debug) {
            console.log(that);
        }

        return that;
    };

    var models = Cartify.models = {
        dataIdAttr: "data-cartify-id",
        cart: {
            attr: {
                "class": "cartify"
            }
        },
        cartItem: {
            attr: {
                "class": "cartify-item"
            }
        },
        addBtn: {
            attr: {
                'class': 'cartify-add-btn'
            }
        },
        removeBtn: {
            attr: {
                'class': 'cartify-remove-btn'
            }
        },
        updateBtn: {
            attr: {
                'class': 'cartify-update-btn'
            }
        },
        valueInput: {
            attr: {
                'class': 'cartify-value-input'
            }
        },
        removeTh: {
            attr: {
                'class': 'cart-product-remove'
            }
        },
        emptyBtn: {
            attr: {
                'class': 'cartify-empty-btn'
            }
        }
    };

    var indexes = Cartify.indexes = {
        ajax: 'ajax',
        dataSrc: 'dataSrc',
        idSrc: 'idSrc',
        priceSrc: 'priceSrc',
        fields: 'fields',
        imageSrc: 'imageSrc',
        addBtnSelector: 'addBtnSelector',
        updateBtnSelector: 'updateBtnSelector',
        removeBtnSelector: 'removeBtnSelector',
        emptyBtnSelector: 'emptyBtnSelector',
        fieldOptions: {
            _id: '_id',
            _qty: 'qty',
            data: 'data',
            type: 'type',
            searchable: 'searchable',
            filter: 'filter',
            options: 'options',
            render: 'render'
        },
        _cartElementTotal : "_cartElementTotal",
        _extraOptionsTotal : "_extraOptionsTotal"
    };

    Cartify.defaults = {
        currency: '€',
        debug: false,
        options: {},
        field: {},
        promotion: {},
        animation: {
            bounceIn: 'bounceIn',
            bounceOut: "bounceOut"
        }
    };

    Cartify.defaults.options = {
        ajax: _apiSrc,
        dataSrc: 'cart',
        idSrc: 'idCode',
        sessionUrl: _apiSrc,
        merchantId: merchantId(),
        lang: lang,
        priceSrc: '',
        fields: [],
        addBtnSelector: '',
        updateBtnSelector: '',
        removeBtnSelector: '.' + models.removeBtn.attr.class,
        emptyBtnSelector: '.' + models.emptyBtn.attr.class,
        remove: true
    };

    Cartify.defaults.field.options = {
        data: '',
        label: '',
        type: '',
        display: true,
        options: {},
        className: "",
        render: null
    };

    Cartify.defaults.promotion.options = {
        code: null,
        value: null,
        valueString: null
    };

    Cartify.listener = {
        removeCartElementBtn: function (cartify) {
            Cartify.event.initRemoveProduct(cartify);
            var $btn = $('.' + models.removeBtn.attr.class);
            $btn.unbind('click').bind('click', function (event) {

                event.preventDefault();
                event.stopPropagation();
                var $btnElement = $(this);
                if (Cartify.defaults.debug || true) {
                    console.log('removeProductBtn clicked', $($btn).index($btnElement));
                }
                var $element = $btnElement.closest('.' + models.cartItem.attr.class);
                var itemId = $element.attr(models.dataIdAttr);
                if (Fn._isStringNotEmpty(itemId)) {
                    var product = cartify.product(itemId);
                    Cartify.event.preRemoveProduct(cartify, product);
                    cartify.removeCartElement(itemId, $($btn).index($btnElement));
                    Cartify.event.postRemoveProduct(cartify, product);

                }
            });
        },
        updateBtnListener: function (cartify) {
            var $btn = $('.' + models.updateBtn.attr.class);
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var $btnElement = $(this);
                    if (Cartify.defaults.debug || true) {
                        console.log('updateBtnListener clicked');
                    }
                    var $element = $btnElement.closest('.' + models.cartItem.attr.class);
                    var $inputElement = $btnElement.siblings('.' + models.valueInput.attr.class);
                    var itemId = $element.attr(models.dataIdAttr);
                    var inputVal = $inputElement.val();


                    if (Fn._isStringNotEmpty(itemId)) {
                        var cartElement = cartify.product(itemId);
                        if (cartElement) {
                            var elementQty = Fn._getObjByProp(cartElement, indexes.fieldOptions._qty, null);
                            if (elementQty) {
                                elementQty = Math.floor(elementQty);
                                if (isNaN(inputVal) || Math.floor(inputVal) < 1) {
                                    inputVal = Math.floor(inputVal);
                                    $inputElement.val(elementQty);
                                } else {
                                    inputVal = Math.floor(inputVal);
                                    if (inputVal !== elementQty && inputVal > 0) {
                                        cartElement[indexes.fieldOptions._qty] = inputVal;
                                        $inputElement.val(inputVal);
                                        cartify.updateCartElement(cartElement, $($btn).index($btnElement));
                                        Animation._animate($btnElement, Cartify.defaults.animation.bounceIn);
                                    }
                                }
                            }
                        }

                    }
                    if (Cartify.defaults.debug) {
                        console.log({
                            $btnElement: $btnElement,
                            $element: $element,
                            $inputElement: $inputElement,
                            itemId: itemId,
                            inputVal: inputVal
                        });
                    }
                })
            ;
        },
        emptyCartBtn: function (cartify) {
            Cartify.event.initEmptyProduct(cartify);
            var $btn = fnCartify.cart._getEmptyBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    if (Cartify.defaults.debug) {
                        console.log('removeProductBtn clicked');
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    cartify.emptyCart();
                })
            ;
        },
        confirmCartBtn: function (cartify) {
            Cartify.event.initEmptyProduct(cartify);
            var $btn = fnCartify.form.confirmBtn._getJqueryBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {

                    if (Cartify.defaults.debug) {
                        console.log('confirmCartBtn clicked');
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    var $form = fnCartify.form._getJqueryForm(cartify);

                    $form.submit();

                })
            ;
        },
        formSubmit: function (cartify) {
            var $form = fnCartify.form._getJqueryForm(cartify);
            $form.validate({
                errorClass: 'is-invalid',
                validClass: 'is-valid',
                errorElement: "div",
                focusInvalid: false,
                rules: {
                    email: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true,
                        minlength: 5,
                        maxlength: 15
                    },

                    url: {
                        required: true
                    },
                    date: {
                        required: true
                    },
                    number: {
                        required: true
                    },
                    tel: {
                        required: true,
                        digits: true,
                        minlength: 5,
                        maxlength: 15
                    },
                    phone: {
                        required: true,
                        digits: true,
                        minlength: 5,
                        maxlength: 15
                    },
                    digits: {
                        required: true
                    },
                    takeawayPayment: {
                        required: true
                    },
                    deliveryPayment: {
                        required: true
                    },
                    option: {
                        required: true
                    },
                    options: {
                        required: true,
                        minlength: 1,
                        maxlength: 10
                    },
                    memo: {
                        required: true,
                        minlength: 10,
                        maxlength: 100
                    },
                    checkbox: {
                        required: true
                    },
                    checkboxes: {
                        required: true
                    },
                    radio: {
                        required: true
                    },
                    select: {
                        required: true
                    }
                },
                errorPlacement: function (error, element) {
                    element.parent().append(error);
                },
                submitHandler: function (form) {

                    fnCartify.form.confirmBtn._animate(true);
                    var serialize = $(form).serializeArray();
                    var dataSend = {
                        _q: 'checkout',
                        form: serialize,
                        lang: lang, merchantId: merchantId(),
                        cart_element: cartify.cartElements(),
                        promotion: cartify.promotion()
                    };

                    if (Cartify.defaults.debug || true) {
                        console.log(dataSend);
                    }
                    $.post(_apiSrc, dataSend).done(function (data) {
                        var response = JSON.parse(data);
                        var status = Fn._getObjByProp(response, 'status', false);
                        if (status === true) {
                            var redirect = Fn._getObjByProp(response, 'redirect', null);
                            if (Cartify.defaults.debug) {
                                console.log(data);
                            }
                            if (Fn._isStringNotEmpty(redirect)) {
                                cartify.emptyCart();
                                window.location.href = redirect;
                            }
                        } else {
                            var message = Fn._getObjByProp(response, "message", '');
                            BootstrapNotify.danger("", message);
                        }
                        fnCartify.form.confirmBtn._animate(false);
                    })
                }
            });
        }
    };

    Cartify.initListener = function (cartify) {
        var allListener = Cartify.listener;
        $.each(allListener, function (index, element) {
            if (Fn._isSameType(element, function () {
                })) {
                element(cartify);
            }
        })
    };

    Cartify.event = {
        init: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('init(cartify) called', {cartify: cartify});
            }

        },
        preInit: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('preInit(cartify) called', {cartify: cartify});
            }
        },
        onInit: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('onInit(cartify) called', {cartify: cartify});
            }

        },
        postInit: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('postInit(cartify) called', {cartify: cartify});
            }

        },
        initDraw: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('initDraw(cartify) called', {cartify: cartify});
            }

        },
        preDraw: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('preDraw(cartify) called', {cartify: cartify});
            }

        },
        onDraw: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('onDraw(cartify) called', {cartify: cartify});
            }

        },
        postDraw: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('postDraw(cartify) called', {cartify: cartify});
            }

        },
        initAddProduct: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('initAddProduct(cartify) called', {cartify: cartify});
            }

        },
        preAddProduct: function (cartify, product) {
            if (Cartify.defaults.debug) {
                console.log('preAddProduct(cartify, product) called', {cartify: cartify, product: product});
            }

        },
        onAddProduct: function (cartify, product) {
            if (Cartify.defaults.debug) {
                console.log('onAddProduct(cartify, product) called', {cartify: cartify, product: product});
            }

        },
        postAddProduct: function (cartify, product) {
            if (Cartify.defaults.debug) {
                console.log('postAddProduct(cartify, product) called', {cartify: cartify, product: product});
            }

        },
        initRemoveProduct: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('initRemoveProduct(cartify) called', {cartify: cartify});
            }

        },
        preRemoveProduct: function (cartify, product) {
            if (Cartify.defaults.debug) {
                console.log('preRemoveProduct(cartify, product) called', {cartify: cartify, product: product});
            }

        },
        onRemoveProduct: function (cartify, product) {
            if (Cartify.defaults.debug) {
                console.log('onRemoveProduct(cartify, product) called', {cartify: cartify, product: product});
            }

        },
        postRemoveProduct: function (cartify, product) {
            if (Cartify.defaults.debug) {
                console.log('postRemoveProduct(cartify, product) called', {cartify: cartify, product: product});
            }

        },
        onUpdateCart: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('onUpdateCart(cartify) called', {cartify: cartify});
            }

        },
        postUpdateCart: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('postUpdateCart(cartify) called', {cartify: cartify});
            }

        },
        initEmptyProduct: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('initEmptyProduct(cartify) called', {cartify: cartify});
            }

        },
        preEmptyProduct: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('preEmptyProduct(cartify, product) called', {cartify: cartify});
            }

        },
        onEmptyProduct: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('onEmptyProduct(cartify, product) called', {cartify: cartify});
            }

        },
        postEmptyProduct: function (cartify) {
            if (Cartify.defaults.debug) {
                console.log('postEmptyProduct(cartify, product) called', {cartify: cartify});
            }

        }

    };

    var fnCartify = Cartify.fn = {
        debug: false,
        cart: {
            debug: false,
            _getEmptyBtn: function () {
                return $('.' + models.emptyBtn.attr.class);
            },
            _disableEmptyBtn: function (disable) {

                if (fnCartify.cart.debug) {
                    console.log('form._disableEmptyBtn._enable() called', {disable: disable});
                }
                FnJquery._disableElem(fnCartify.cart._getEmptyBtn(), disable);

            },
            _getCartItemsContainer: function (cartify) {

                if (fnCartify.cart.debug) {
                    console.log('fnCartify.cart._getCartItemsContainer(cartify) called');
                }
                var cartSelector = cartify.jQuerySelector;
                return $('tbody', cartSelector);

            },
            _loadTableHeader: function (cartify) {
                var settings = cartify.settings;
                var arrayFields = settings.fields;
                var $cartTable = $(cartify.jQuerySelector);

                if (fnCartify.cart.debug) {
                    console.log('Cartify._loadTableHeader() called', {
                        settings: settings,
                        arrayFields: arrayFields,
                        $cartTable: $cartTable
                    });
                }
                if (arrayFields.length && $cartTable.length) {
                    var $tHead = $('<thead/>');
                    var $tr = $('<tr/>').addClass('primary');
                    $.each(arrayFields, function (index, field) {
                        if (field.display) {
                            var label = field.label;
                            var $th = $('<th>').text(label).addClass(field.className);
                            $tr.append($th)
                        }
                    });
                    $tHead.append($tr);
                    $cartTable.prepend($tHead);
                }


            },
            _loadTableElement: function (cartify) {
                fnCartify.cart._loadTableHeader(cartify);
                var settings = cartify.settings;
                var arrayCart = cartify.cartElements();
                var $cartTable = $(cartify.jQuerySelector);

                if (fnCartify.cart.debug || true) {
                    console.log('Cartify.loadProduct() called', {
                        settings: settings,
                        arrayData: arrayCart,
                        $cartTable: $cartTable
                    });
                }
                if (arrayCart.length) {
                    var $tBody = $('<tbody/>');
                    $tBody.appendTo($cartTable);
                    $.each(arrayCart, function (index, element) {
                        fnCartify.cart._addElementToCart(cartify, element);
                    });

                }
            },
            _createCartRow: function (cartify, cartData) {
                var clone = $.extend({}, cartData);
                console.log({
                    cartData : clone
                });
                var priceSrc = Fn._getObjByProp(cartify.settings, indexes.priceSrc, '');
                if(Fn._isStringNotEmpty(priceSrc)){
                    var qty = Fn._getObjByProp(cartData, indexes.fieldOptions._qty, null);
                    var price = Fn._getObjByProp(cartData, priceSrc, null);
                    var productExtraTotal = Fn._getObjByProp(cartData,indexes._extraOptionsTotal, 0);
                    if(Fn._isNumeric(qty) && Fn._isNumeric(price) && Fn._isNumeric(productExtraTotal)){
                        cartData[indexes._extraOptionsTotal] = parseInt(productExtraTotal);
                        cartData[indexes._cartElementTotal] =
                            (price + productExtraTotal ) * qty;
                    }
                }
                var settings = cartify.settings;
                var idSrc = Fn._getObjByProp(settings, indexes.idSrc, "");
                var $cartItemRow = null;
                var arrayFields = Fn._getObjByProp(settings, indexes.fields, []);

                if ( !$.isEmptyObject(cartData) && arrayFields.length) {
                    $cartItemRow = $('<tr/>');
                    var elementId = Fn._getObjByProp(cartData, idSrc, null);
                    if (elementId) {
                        console.log({
                            arrayFields : arrayFields
                        });
                        $.each(arrayFields, function (index, field) {
                            if (field.display) {
                                var fieldValue = Fn._getObjByProp(cartData, field.data, null);
                                var render = Fn._getObjByProp(field, indexes.fieldOptions.render, null);
                                if (Fn._isFunction(render)) {
                                    fieldValue = render(cartify, elementId, cartData, fieldValue);
                                }
                                var $td = $('<td/>').attr({}).addClass(field.className).html(fieldValue);
                                $cartItemRow.append($td);
                            }

                        });
                        $cartItemRow.attr(models.dataIdAttr, elementId).addClass(models.cartItem.attr.class);
                    }

                }
                return $cartItemRow;
            },
            _addElementToCart: function (cartify, product) {
                var $cartItems = fnCartify.cart._getCartItemsContainer(cartify);
                var idSrc = Fn._getObjByProp(cartify.settings, indexes.idSrc, "");
                var productId = Fn._isStringNotEmpty(idSrc) ? Fn._getObjByProp(product, idSrc, null) : null;

                if (fnCartify.cart.debug) {
                    console.log('Cartify._addElementToCart() called', {
                        cartify: cartify,
                        product: product,
                        idSrc: idSrc,
                        productId: productId
                    });
                }
                if ( $cartItems.length && !$.isEmptyObject(product) && Fn._isStringNotEmpty(productId) ) {
                    var $productElement = fnCartify.cart._createCartRow(cartify, product);

                    if (fnCartify.cart.debug) {
                        console.log("valid", {
                            $cartItems: $cartItems,
                            $productElement: $productElement
                        });
                    }
                    if ($productElement !== null) {
                        $cartItems.append($productElement);
                    }
                }
            },
            _emptyCart : function (cartify, product) {

                var $cartItems = fnCartify.cart._getCartItemsContainer(cartify);
                $cartItems.empty();
            }
        },
        static: {
            _mergeSetting: function (settings) {
                if (fnCartify.debug) {
                    console.log("_mergeSetting(settings) called", {settings: settings});
                }
                var
                    mergedSettings = $.extend(true, {}, Cartify.defaults.options, settings),
                    arraySettingsFields = mergedSettings.fields
                ;
                var arrayFields = [];
                if (mergedSettings.remove) {
                    var removeField = $.extend({}, Cartify.defaults.field.options, {
                        className: models.removeTh.attr.class,
                        type: "remove"
                    });

                    if (fnCartify.debug) {
                        console.log("removeField", {removeField: removeField});
                    }
                    arraySettingsFields.push(removeField);
                }
                $.each(arraySettingsFields, function (index, element) {
                    var field = $.extend({}, Cartify.defaults.field.options, element);
                    if (!Fn._isSameType(field.render, function () {
                        })) {
                        field.render = fnCartify.field._getFieldRender(field.type);
                    }
                    arrayFields.push(field);
                });
                mergedSettings.fields = arrayFields;

                if (fnCartify.debug) {
                    console.log("_mergeSetting() called", {mergedSettings: mergedSettings});
                }
                return mergedSettings;
            }
        },
        form: {
            debug: true,
            _start: function (cartify) {

                if (fnCartify.form.debug) {
                    console.log('form._start() called', {cartify: cartify});
                }
                fnCartify.form._reinitialize(cartify);
                if(cartify.cartElements().length > 0 && cartify.cartTotal() > 0){
                    fnCartify.cart._disableEmptyBtn(false);
                    fnCartify.form.takeAwayDelivery._start(cartify);
                }else {

                    var $submitBtn = fnCartify.form.confirmBtn._getJqueryBtn();
                    $submitBtn.prop( "disabled", true );
                    fnCartify.cart._disableEmptyBtn(true);
                }
            },
            _reinitialize: function (cartify) {

                if (fnCartify.form.debug) {
                    console.log('form._reinitialize() called', {cartify: cartify});
                }var $form = fnCartify.form._getJqueryForm(cartify);
                $form.trigger('reset');
                $("[required]", $form).prop( "disabled", true );
                fnCartify.form.promotion._reset(cartify);
            },
            takeAwayDelivery: {
                _start: function (cartify) {
                    if (fnCartify.form.debug || true) {
                        console.log('form.takeAwayDelivery._start(cartify) called', {cartify: cartify});
                    }
                    fnCartify.form.deliveryZone._end(cartify);
                    fnCartify.form.dateTime._end(cartify);
                    var $takeAwayDeliveryRadio = fnCartify.form.takeAwayDelivery._getJqueryRadio();
                    $takeAwayDeliveryRadio
                        .prop('checked', false)
                        .prop( "disabled", false )
                    ;
                    $takeAwayDeliveryRadio.unbind('change').bind('change', function () {
                        var value = parseInt($(this).val());
                        if (value === typeTakeAway) {
                            $(".delivery-group").hide();
                            $(".takeaway-group").show();

                            $("[data-group='takeaway']").prop( "disabled", false );
                            $("[data-group='delivery']")
                                .val("")
                                .prop('checked', false)
                                .prop( "disabled", true )
                            ;
                            fnCartify.form.dateTime._start(cartify);

                        } else if (value === typeDelivery) {
                            $(".delivery-group").show();
                            $(".takeaway-group").hide();


                            $("[data-group='delivery']").prop( "disabled", false );
                            $("[data-group='takeaway']")
                                .val("")
                                .prop('checked', false)
                                .prop( "disabled", true )
                            ;
                            fnCartify.form.deliveryZone._start(cartify);

                        }
                    });

                },
                _getValue: function (cartify) {
                    var $elem = fnCartify.form.takeAwayDelivery._getJqueryRadio();
                    return $elem.filter(':checked').val();
                },
                _getJqueryRadio: function () {
                    var $elem = $('input[type=radio][name=take-away-delivery]');
                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._getJqueryRadio(cartify) called', {$elem: $elem});
                    }
                    return $elem;

                },
                _resetChecked: function (cartify) {
                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._resetChecked(cartify) called', {cartify: cartify});
                    }
                    fnCartify.form.deliveryZone._end(cartify);
                    fnCartify.form.dateTime._end(cartify);
                    var $takeAwayDeliveryRadio = fnCartify.form.takeAwayDelivery._getJqueryRadio();
                    $takeAwayDeliveryRadio.prop('checked', false);
                    $takeAwayDeliveryRadio.unbind('change').bind('change', function () {
                        var value = parseInt($(this).val());
                        if (value === typeTakeAway) {
                            fnCartify.form.dateTime._start(cartify);
                            fnCartify.form.takeawayPayment._start(cartify);
                            fnCartify.form.deliveryZone._end(cartify);
                        } else if (value === typeDelivery) {
                            fnCartify.form.deliveryPayment._start(cartify);
                            fnCartify.form.deliveryZone._start(cartify);

                        }
                    });
                }
            },
            deliveryPayment: {

                _start: function (cartify) {

                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._start(cartify) called', {cartify: cartify});
                    }
                    var $deliveryPaymentGroup = fnCartify.form.deliveryPayment._getBlock(cartify);
                    $deliveryPaymentGroup.show();
                    var $deliveryPaymentRadio = fnCartify.form.deliveryPayment._getJqueryRadio();
                    FnJquery._disableElem($deliveryPaymentRadio, false);
                    fnCartify.form.takeawayPayment._end(cartify);

                },
                _end: function (cartify) {

                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._start(cartify) called', {cartify: cartify});
                    }
                    var $deliveryPaymentGroup = fnCartify.form.deliveryPayment._getBlock(cartify);
                    $deliveryPaymentGroup.hide();
                    var $deliveryPaymentRadio = fnCartify.form.deliveryPayment._getJqueryRadio();
                    FnJquery._disableElem($deliveryPaymentRadio, true);
                    $deliveryPaymentRadio.prop('checked', false);

                },
                _getJqueryRadio: function () {
                    var $elem = $('input[type=radio][name=deliveryPayment]');
                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._getJqueryRadio(cartify) called', {$elem: $elem});
                    }
                    return $elem;

                },
                _getBlock: function (cartify) {
                    var $elem = $('.delivery-payment-group');
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._getBlock() called', {cartify: cartify, $elem: $elem});
                    }
                    return $elem;
                }
            },
            takeawayPayment: {

                _start: function (cartify) {

                    fnCartify.form.deliveryPayment._end(cartify);
                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._start(cartify) called', {cartify: cartify});
                    }
                    var $takeawayPaymentGroup = fnCartify.form.takeawayPayment._getBlock(cartify);
                    $takeawayPaymentGroup.show();

                    var $takeawayPaymentRadio = fnCartify.form.takeawayPayment._getJqueryRadio();
                    FnJquery._disableElem($takeawayPaymentRadio, false);

                },
                _end: function (cartify) {

                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._start(cartify) called', {cartify: cartify});
                    }
                    var $takeawayPaymentGroup = fnCartify.form.takeawayPayment._getBlock(cartify);
                    $takeawayPaymentGroup.hide();
                    var $takeawayPaymentRadio = fnCartify.form.takeawayPayment._getJqueryRadio();
                    $takeawayPaymentRadio.prop('checked', false);
                    FnJquery._disableElem($takeawayPaymentRadio, true);

                },
                _getJqueryRadio: function () {
                    var $elem = $('input[type=radio][name=takeawayPayment]');
                    if (fnCartify.form.debug) {
                        console.log('form.takeAwayDelivery._getJqueryRadio(cartify) called', {$elem: $elem});
                    }
                    return $elem;

                },
                _getBlock: function (cartify) {
                    var $elem = $('.takeaway-payment-group');
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._getBlock() called', {cartify: cartify, $elem: $elem});
                    }
                    return $elem;
                }
            },
            deliveryZone: {
                _start: function (cartify) {

                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._start(cartify) called', {cartify: cartify});
                    }
                    fnCartify.form.dateTime._end(cartify);
                    fnCartify.form.deliveryZone._resetDeliveryZoneElement(cartify);
                    fnCartify.form.deliveryZone._loadDeliveryZoneElement(cartify);
                    var disable = false;
                    var required = true;
                    var $formBlock = fnCartify.form.deliveryZone._getBlock(cartify);
                    $formBlock.show();
                    var $selectDeliveryZone = fnCartify.form.deliveryZone._getJqueryDeliveryZone(cartify);
                    FnJquery._disableElem($selectDeliveryZone, disable);
                    FnJquery._requireElem($selectDeliveryZone, required);

                    var $addressDeliveryZone = fnCartify.form.deliveryZone._getJqueryAddressInput(cartify);
                    FnJquery._disableElem($addressDeliveryZone, disable);
                    FnJquery._requireElem($addressDeliveryZone, required);

                    var $address2DeliveryZone = fnCartify.form.deliveryZone._getJqueryAddressInput2(cartify);
                    FnJquery._disableElem($address2DeliveryZone, disable);


                    var $formDeliveryRow = fnCartify.form.deliveryZone._getJqueryRowDeliveryCart(cartify);
                    $formDeliveryRow.show();

                },
                _end: function (cartify) {
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._end(cartify) called', {cartify: cartify});
                    }
                    var disable = true;
                    var required = false;
                    fnCartify.form.deliveryZone._resetDeliveryZoneElement(cartify);
                    var $formBlock = fnCartify.form.deliveryZone._getBlock(cartify);
                    $formBlock.hide();
                    var $selectDeliveryZone = fnCartify.form.deliveryZone._getJqueryDeliveryZone(cartify);
                    FnJquery._disableElem($selectDeliveryZone, disable);
                    FnJquery._requireElem($selectDeliveryZone, required);

                    var $addressDeliveryZone = fnCartify.form.deliveryZone._getJqueryAddressInput(cartify);
                    FnJquery._disableElem($addressDeliveryZone, disable);
                    FnJquery._requireElem($addressDeliveryZone, required);

                    var $address2DeliveryZone = fnCartify.form.deliveryZone._getJqueryAddressInput2(cartify);
                    FnJquery._disableElem($address2DeliveryZone, disable);

                    var $formDeliveryRow = fnCartify.form.deliveryZone._getJqueryRowDeliveryCart(cartify);
                    cartify.setDeliveryFee(0);
                    $formDeliveryRow.hide();

                },
                _getBlock: function (cartify) {
                    var $elem = $('.delivery-zone-group');
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._getBlock() called', {cartify: cartify, $elem: $elem});
                    }
                    return $elem;
                },
                _getJqueryDeliveryZone: function (cartify) {
                    var $elem = $("#cartify-delivery-zone");
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._getJqueryDeliveryZone() called', {
                            cartify: cartify,
                            $elem: $elem
                        });
                    }
                    return $elem;

                },
                _getValue: function (cartify) {
                    var $deliveryZoneSelect = fnCartify.form.deliveryZone._getJqueryDeliveryZone(cartify);
                    return $deliveryZoneSelect.val();
                },
                _getJqueryAddressInput: function (cartify) {
                    var $elem = $("#cartify-delivery-address1");
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._getJqueryAddressInput() called', {
                            cartify: cartify,
                            $elem: $elem
                        });
                    }
                    return $elem;

                },
                _getJqueryAddressInput2: function (cartify) {
                    var $elem = $("#cartify-delivery-address2");
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._getJqueryAddressInput2() called', {
                            cartify: cartify,
                            $elem: $elem
                        });
                    }
                    return $elem;

                },
                _getJqueryRowDeliveryCart: function (cartify) {
                    var $elem = $('#cartify-form-delivery-row');
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._getJqueryRowDeliveryCart() called', {
                            cartify: cartify,
                            $elem: $elem
                        });
                    }
                    return $elem;
                },
                _resetDeliveryZoneElement: function (cartify) {
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._resetDeliveryZoneElement() called', {cartify: cartify});
                    }
                    var $selectDeliveryZone = fnCartify.form.deliveryZone._getJqueryDeliveryZone(cartify);
                    $selectDeliveryZone.children('option:not(:first)').remove();
                    $selectDeliveryZone.children('option:first').prop("selected", true);

                },
                _loadDeliveryZoneElement: function (cartify) {

                    if (fnCartify.form.debug || true) {
                        console.log('form.deliveryZone._loadDeliveryZoneElement() called', {cartify: cartify});
                    }
                    var settings = cartify.settings;
                    fnCartify.form.deliveryZone._resetDeliveryZoneElement(cartify);

                    $.post(_apiSrc, {
                        _q: 'deliveryzone', lang: settings.lang, merchantId: settings.merchantId
                    })
                        .done(function (ajaxResponse) {
                            ajaxResponse = JSON.parse(ajaxResponse);
                            if (fnCartify.form.debug) {
                                console.log(ajaxResponse);
                            }
                            if (Fn._isSameType(ajaxResponse, [])) {
                                var status = Fn._getObjByProp(ajaxResponse, "status", false);
                                if (status === true) {
                                    var $selectDeliveryZone = fnCartify.form.deliveryZone._getJqueryDeliveryZone(cartify);
                                    var zoneOptions = Fn._getObjByProp(ajaxResponse, "data", null);
                                    if (Fn._isSameType(zoneOptions, [])) {
                                        $.each(zoneOptions, function (index, option) {
                                            var $option = fnCartify.form.deliveryZone._createSelectOption(cartify, option);
                                            if ($option) {
                                                $selectDeliveryZone.append($option);
                                            }
                                        });
                                        $selectDeliveryZone.unbind("change").bind('change', function (event) {
                                            fnCartify.form.promotion._reset(cartify);
                                            var selectedOption = $selectDeliveryZone.children("option:selected");
                                            if (selectedOption.length) {
                                                var fee = selectedOption.attr('data-fee');
                                                if (Fn._isStringNotEmpty(fee) && !isNaN(fee)) {
                                                    fee = parseInt(fee);
                                                    cartify.setDeliveryFee(fee);
                                                    fnCartify.form.deliveryFee._update(cartify, fee);
                                                    fnCartify.form.dateTime._start(cartify);
                                                }
                                            }
                                            if (fnCartify.form.debug) {
                                                console.log(selectedOption);
                                            }
                                        });
                                    }
                                } else {
                                    var message = Fn._getObjByProp(ajaxResponse, "message", false);
                                    checkStatusSessionTimeOut(status);
                                    BootstrapNotify.warning('', message);
                                    fnCartify.form._end(cartify);
                                }
                            }
                        });

                },
                _createSelectOption: function (cartify, option) {
                    var selectOption = null;
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryZone._createSelectOption(option) called', {option: option});
                    }
                    if (Fn._isSameType(option, {})) {
                        var cartTotal = cartify.cartTotal();
                        var idCode = Fn._getObjByProp(option, 'idCode', null);
                        var name = Fn._getObjByProp(option, 'name', null);
                        var minOrder = Fn._getObjByProp(option, 'minOrder', null);
                        var fee = Fn._getObjByProp(option, 'fee', null);
                        if (
                            !isNaN(cartTotal) &&
                            Fn._isStringNotEmpty(idCode) &&
                            Fn._isStringNotEmpty(name) &&
                            Fn._isSameType(minOrder, 1) &&
                            Fn._isSameType(fee, 1)
                        ) {
                            cartTotal = parseInt(cartTotal);
                            minOrder = parseInt(minOrder);
                            fee = parseInt(fee);
                            selectOption = $('<option/>').attr({
                                id: idCode,
                                value: idCode,
                                'data-fee': fee,
                                'data-minimum': minOrder
                            });
                            var text = name;
                            if (cartTotal >= minOrder) {
                                FnJquery._disableElem(selectOption, false);
                                text = name + " - frais : " + Fn._intToPrice(fee);
                            } else {
                                text = name + " - minimum : " + Fn._intToPrice(minOrder);
                                FnJquery._disableElem(selectOption, true);
                            }
                            selectOption.text(text);
                        } else {
                            if (fnCartify.form.debug) {
                                console.log({
                                    cartTotal: cartTotal,
                                    idCode: idCode,
                                    name: name,
                                    minOrder: minOrder,
                                    fee: fee
                                });
                            }
                        }

                    }
                    return selectOption;
                }
            },
            dateTime: {
                _start: function (cartify) {

                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._start(cartify) called', {cartify: cartify});
                    }
                    var disable = false;
                    var required = true;
                    var $date = fnCartify.form.dateTime._getJqueryDate(cartify);
                    FnJquery._disableElem($date, disable);
                    FnJquery._requireElem($date, required);

                    var $time = fnCartify.form.dateTime._getJqueryTime(cartify);
                    FnJquery._disableElem($time, disable);
                    FnJquery._requireElem($time, required);

                    var $dateTimeBlock = fnCartify.form.dateTime._getBlock(cartify);
                    $dateTimeBlock.show();

                    fnCartify.form.dateTime._loadDateElement(cartify);


                },
                _end: function (cartify) {
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._end(cartify) called', {cartify: cartify});
                    }
                    fnCartify.form.promotion._reset(cartify);
                    var disable = true;
                    var required = true;
                    var $date = fnCartify.form.dateTime._getJqueryDate(cartify);
                    FnJquery._disableElem($date, disable);
                    FnJquery._requireElem($date, required);

                    var $time = fnCartify.form.dateTime._getJqueryTime(cartify);
                    FnJquery._disableElem($time, disable);
                    FnJquery._requireElem($time, required);

                    var $dateTimeBlock = fnCartify.form.dateTime._getBlock(cartify);
                    $dateTimeBlock.hide();


                },
                _resetDateElement: function (cartify) {
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._resetDateElement() called', {cartify: cartify});
                    }
                    var $selectDate = fnCartify.form.dateTime._getJqueryDate(cartify);
                    $selectDate.children('option:not(:first)').remove();
                    $selectDate.children('option:first').prop("selected", true);
                    fnCartify.form.dateTime._resetTimeElement(cartify);

                },
                _resetTimeElement: function (cartify) {
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._resetTimeElement() called', {cartify: cartify});
                    }
                    var $selectTime = fnCartify.form.dateTime._getJqueryTime(cartify);
                    $selectTime.children('option:not(:first)').remove();
                    $selectTime.children('option:first').prop("selected", true);

                },
                _getBlock: function (cartify) {
                    var $elem = $('.date-time-group');
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._getBlock() called', {cartify: cartify, $elem: $elem});
                    }
                    return $elem;

                },
                _getJqueryDate: function (cartify) {
                    var $elem = $('#cartify-date');
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._getJqueryDate() called', {cartify: cartify, $elem: $elem});
                    }
                    return $elem;

                },
                _getJqueryTime: function (cartify) {
                    var $elem = $('#cartify-time');
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._getJqueryTime() called', {cartify: cartify, $elem: $elem});
                    }
                    return $elem;

                },
                _loadDateElement: function (cartify) {
                    fnCartify.form.dateTime._resetDateElement(cartify);
                    var takeAwayDeliveryType = fnCartify.form.takeAwayDelivery._getValue(cartify);
                    var $deliveryZoneSelect = fnCartify.form.deliveryZone._getJqueryDeliveryZone(cartify);
                    var deliverZoneId = $deliveryZoneSelect.val();
                    var settings = cartify.settings;
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._loadDateElement() called', {
                            cartify: cartify,
                            takeAwayDeliveryType: takeAwayDeliveryType,
                            deliverZoneId: deliverZoneId
                        });
                    }

                    $.post(_apiSrc, {
                        _q: 'date', _type: takeAwayDeliveryType, _zone_id: deliverZoneId,
                        lang: settings.lang, merchantId: settings.merchantId
                    }).done(function (ajaxResponse) {

                        ajaxResponse = JSON.parse(ajaxResponse);
                        if (fnCartify.form.debug || true) {
                            console.log(ajaxResponse);
                        }
                        if (Fn._isSameType(ajaxResponse, {})) {
                            var status = Fn._getObjByProp(ajaxResponse, "status", false);
                            if (status === true) {
                                var dateOptions = Fn._getObjByProp(ajaxResponse, "data", null);
                                if (Fn._isSameType(dateOptions, [])) {
                                    var $selectDate = fnCartify.form.dateTime._getJqueryDate(cartify);
                                    $.each(dateOptions, function (index, option) {
                                        var $option = fnCartify.form.dateTime._createSelectOption(cartify, option);
                                        if ($option) {
                                            $selectDate.append($option);
                                        }
                                    });
                                    $selectDate.unbind("change").bind('change', function (event) {
                                        fnCartify.form.promotion._reset(cartify);
                                        var selectedOptionVal = $(this).val();
                                        fnCartify.form.dateTime._loadTimeElement(cartify);

                                        if (fnCartify.form.debug) {
                                            console.log(selectedOptionVal);
                                        }
                                    });
                                }
                            }
                            else {
                                var message = Fn._getObjByProp(ajaxResponse, "message", false);
                                checkStatusSessionTimeOut(status);
                                BootstrapNotify.warning('', message);
                                fnCartify.form._end(cartify);
                            }


                        }
                    });


                },
                _loadTimeElement: function (cartify) {
                    if (fnCartify.form.debug) {
                        console.log('form.dateTime._loadTimeElement() called', {cartify: cartify});
                    }
                    fnCartify.form.dateTime._resetTimeElement(cartify);
                    var $takeAwayDeliveryRadio = fnCartify.form.takeAwayDelivery._getJqueryRadio(cartify);
                    var takeAwayDeliveryType = parseInt($takeAwayDeliveryRadio.filter(':checked').val());
                    var $deliveryZoneSelect = fnCartify.form.deliveryZone._getJqueryDeliveryZone(cartify);
                    var deliverZoneId = $deliveryZoneSelect.val();
                    var $dateSelect = fnCartify.form.dateTime._getJqueryDate(cartify);
                    var dateVal = $dateSelect.val();
                    var settings = cartify.settings;
                    var dataSend = {
                        _q: 'time', _type: takeAwayDeliveryType,
                        _zone_id: deliverZoneId, _date: dateVal,
                        lang: settings.lang, merchantId: settings.merchantId
                    };
                    $.post(_apiSrc, dataSend).done(function (ajaxResponse) {
                        ajaxResponse = JSON.parse(ajaxResponse);
                        if (fnCartify.form.debug) {
                            console.log(ajaxResponse);
                        }

                        var status = Fn._getObjByProp(ajaxResponse, 'status', false);
                        if (status === true) {
                            var timeOptions = Fn._getObjByProp(ajaxResponse, "data", null);
                            if (Fn._isSameType(timeOptions, [])) {
                                var $selectTime = fnCartify.form.dateTime._getJqueryTime(cartify);
                                $.each(timeOptions, function (index, option) {
                                    var $option = fnCartify.form.dateTime._createSelectOption(cartify, option);
                                    if ($option) {
                                        $selectTime.append($option);
                                    }
                                });
                                $selectTime.unbind("change").bind('change', function (event) {
                                    fnCartify.form.promotion._reset(cartify);
                                    fnCartify.form.promotion._start(cartify);
                                });

                            }
                        } else {
                            var message = Fn._getObjByProp(ajaxResponse, "message", '');
                            BootstrapNotify.info('', message);
                            fnCartify.form._end(cartify);
                            checkStatusSessionTimeOut(status)
                        }
                    });


                },
                _createSelectOption: function (cartify, option) {
                    var selectOption = null;
                    if (fnCartify.form.debug) {
                        console.log('form.datetime._createSelectOption(option) called', {option: option});
                    }
                    if (Fn._isSameType(option, {})) {
                        var label = Fn._getObjByProp(option, 'label', null);
                        var value = Fn._getObjByProp(option, 'value', null);
                        if (
                            Fn._isStringNotEmpty(label) &&
                            Fn._isStringNotEmpty(value)
                        ) {
                            selectOption = $('<option/>').attr({
                                value: value
                            });
                            selectOption.text(label);
                        } else {
                            if (fnCartify.form.debug) {
                                console.log({
                                    label: label,
                                    value: value
                                });
                            }
                        }
                    }
                    return selectOption;
                }
            },
            promotion: {
                _start: function (cartify) {
                    var $input = fnCartify.form.promotion._getJqueryCodeInput();
                    FnJquery._disableElem($input, false);
                    $input.val('');
                    var $btn = fnCartify.form.promotion.promoBtn._getJqueryBtn();
                    FnJquery._disableElem($btn, false);
                    var settings = cartify.settings;
                    $btn.unbind('click').bind('click', function (e) {

                        e.preventDefault();
                        var $form = fnCartify.form._getJqueryForm(cartify);
                        var serialize = $form.serializeArray();

                        var $inputCode = fnCartify.form.promotion._getJqueryCodeInput();
                        var promoCode = $inputCode.val();
                        var dataSend = {
                            _q: 'promotion',
                            promotion_code: promoCode,
                            form: serialize,
                            //TODO in case of error
                            // cart_element : cartify.cartElements(),
                            lang: settings.lang, merchantId: settings.merchantId
                        };
                        if (Fn._isStringNotEmpty(promoCode)) {
                            fnCartify.form.promotion.promoBtn._animate(true);
                            $.post(_apiSrc, dataSend).done(function (ajaxResponse) {
                                if (fnCartify.form.debug) {
                                    console.log(ajaxResponse);
                                }
                                ajaxResponse = JSON.parse(ajaxResponse);
                                var status = Fn._getObjByProp(ajaxResponse, "status", false);
                                var promotion = Fn._getObjByProp(ajaxResponse, "data", null);
                                if (status && promotion) {
                                    cartify.promotion(promotion.code, promotion.value, promotion.valueString);
                                    fnCartify.form.promotion._clear(cartify);
                                    fnCartify.form.promotion._clearErrorMessage();
                                } else {
                                    var message = Fn._getObjByProp(ajaxResponse, "message", []);
                                    fnCartify.form.promotion._addErrorMessage(message);
                                }
                                fnCartify.form.promotion.promoBtn._animate(false);
                            });
                        }


                    });
                },
                _end: function (cartify) {
                    var $input = fnCartify.form.promotion._getJqueryCodeInput();
                    FnJquery._disableElem($input, false);
                    $input.val('');
                    var $btn = fnCartify.form.promotion.promoBtn._getJqueryBtn();
                    FnJquery._disableElem($btn, false);

                    $btn.unbind('click');
                },
                _clear: function (cartify) {
                    var $input = fnCartify.form.promotion._getJqueryCodeInput();
                    $input.val('');
                },
                _reset: function (cartify) {
                    var $input = fnCartify.form.promotion._getJqueryCodeInput();
                    FnJquery._disableElem($input, true);
                    $input.val('');
                    fnCartify.form.promotion._clear(cartify);
                    fnCartify.form.promotion._getJqueryAmountValue().text("");
                    fnCartify.form.promotion._getJqueryAmountValueString().text("");

                    var $btn = fnCartify.form.promotion.promoBtn._getJqueryBtn();
                    $btn.unbind('click');
                    FnJquery._disableElem($btn, true);

                },
                _clearErrorMessage: function () {
                    var $error = fnCartify.form.promotion._getJqueryErrorMessage();
                    $error.html('');
                },
                _addErrorMessage: function (message) {
                    fnCartify.form.promotion._clearErrorMessage();
                    var $error = fnCartify.form.promotion._getJqueryErrorMessage();
                    $error.append('<span class="small text-danger m-0">*' + message + '</span>');
                },
                _getJqueryErrorMessage: function () {
                    return $('#promotion-message');
                },
                _getJqueryAmountValue: function () {
                    return $("#cartify-form-promotion-amount");
                },
                _getJqueryAmountValueString: function () {
                    return $("#cartify-form-promotion-value-string");
                },
                _update: function (promotionCode, promotionValue, promotionValueString) {
                    var valuePrice = Fn._intToPrice(promotionValue);
                    fnCartify.form.promotion._getJqueryAmountValue().text("- " + valuePrice);
                    fnCartify.form.promotion._getJqueryAmountValueString().text(" : " + promotionValueString);
                },
                _getJqueryCodeInput: function (cartify) {
                    return $("#couponCode");
                },
                promoBtn: {
                    _getJqueryBtn: function () {
                        return $("#couponCodeBtn");

                    },
                    _animate: function (animate) {
                        if (fnCartify.form.debug) {
                            console.log('form.promoBtn._animate() called', {animate: animate});
                        }

                        var $submitBtn = fnCartify.form.promotion.promoBtn._getJqueryBtn();
                        Animation._animateLoaderBtn($submitBtn, animate);
                        FnJquery._disableElem($submitBtn, animate);

                    },
                    _disable: function (disable) {

                        if (fnCartify.form.debug) {
                            console.log('form.confirmBtn._disable() called', {disable: disable});
                        }
                        FnJquery._disableElem(fnCartify.form.promotion.promoBtn._getJqueryBtn(), disable);

                    }
                }
            },
            deliveryFee: {
                _getJquery: function (cartify) {
                    return $("#cartify-form-delivery-amount");
                },
                _update: function (cartify, deliveryFeeInt) {
                    if (fnCartify.form.debug) {
                        console.log('form.deliveryFee._update(deliveryFeeInt) called', {deliveryFeeInt: deliveryFeeInt});
                    }
                    var cartTotal = parseInt(cartify.cartTotal());
                    deliveryFeeInt = parseInt(deliveryFeeInt);
                    var total = cartTotal + deliveryFeeInt;
                    fnCartify.form.deliveryFee._getJquery(cartify).text(Fn._intToPrice(deliveryFeeInt));
                    fnCartify.form.total._update(total);

                }
            },
            subTotal: {
                _getJquery: function () {
                    return $("#cartify-subtotal");
                },
                _update: function (subTotal) {

                    if (fnCartify.form.debug) {
                        console.log('form.subTotal._update(subTotal) called', {subTotal: subTotal});
                    }
                    fnCartify.form.subTotal._getJquery().text(Fn._intToPrice(subTotal));

                }

            },
            total: {
                _reinitialize: function (cartify) {
                    var cartTotal = cartify.cartTotal();

                    fnCartify.form.total._update(cartTotal);

                },
                _getJquery: function () {
                    return $("#cartify-total");
                },
                _update: function (totalInt) {

                    if (fnCartify.form.debug) {
                        console.log('form.total._update(totalInt) called', {totalInt: totalInt});
                    }
                    fnCartify.form.total._getJquery().text(Fn._intToPrice(totalInt));

                }
            },
            confirmBtn: {
                _getJqueryBtn: function () {
                    return $("#cartify-confirm-order-btn");

                },
                _animate: function (animate) {
                    if (fnCartify.form.debug) {
                        console.log('form.confirmBtn._animate() called', {animate: animate});
                    }
                    var $submitBtn = fnCartify.form.confirmBtn._getJqueryBtn();
                    Animation._animateLoaderBtn($submitBtn, animate);
                }
            },
            _getJqueryForm: function (cartify) {
                return $("#form-checkout");
            }
        }
    };

    var _CartifyField = {
        debug : false,
        render: {
            remove: function () {
                return function (cartify, id, dataRow, value, options) {

                    return '<a class="' + models.removeBtn.attr.class + '" href="#"><i class="fa fa-times"></i></a>';
                }
            },
            price: function () {
                return function (cartify, id, dataRow, value, options) {

                    return Fn._intToPrice(value);
                }
            },
            image: function () {
                return function (cartify, id, dataRow, value, options) {

                    return '<img class="img-responsive" src="' + value + '">';
                }
            },
            qty: function () {
                return function (cartify, id, dataRow, value, options) {
                    if (_CartifyField.debug) {
                        console.log({
                            value: value
                        });
                    }
                    value = parseInt(value);
                    return '<div class="quantity">' +

                        '<input class="qty ' + models.valueInput.attr.class + '" type="text" value="' + value + '" name="quantity">' +
                        '<button class="update btn btn-outline ' + models.updateBtn.attr.class + '"><i class="fa fa-check"></i></button>' +
                        '</div>';
                }
            },
            category: function () {
                return function (cartify, id, dataRow, value, options) {
                    var categoryName = "";
                    var allCategory = Fn._getObjByProp(options, "category", null);
                    if (allCategory !== null) {
                        if (Fn._isStringNotEmpty(value)) {
                            var category = Fn._getObjByProp(allCategory, value, null);
                            categoryName = Fn._getObjByProp(category, "name", null);

                        }
                    }
                    return categoryName;
                }
            },
            total: function () {
                return function (cartify, id, dataRow, value, options) {
                    var total = dataRow[indexes._cartElementTotal];
                    return Fn._intToPrice(total);
                }
            }
        }
    };

    fnCartify.field = {
        debug: false,
        _getFieldRender: function (type) {
            var allRender = _CartifyField.render;
            if (allRender.hasOwnProperty(type) && typeof allRender[type] === typeof function () {
                }) {
                return allRender[type]();
            } else {
                return null;
            }
        }
    };

}(jQuery));