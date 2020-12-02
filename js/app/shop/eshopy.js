
/**
 * The jQuery plugin eShopy.
 * @name jQuery.fn.eShopy()
 * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
 */


/**
 * @variable
 */
var _EshopField;
(function ($) {
    // $ = jQuery.noConflict();

    var
        /**
         *
         * @type {string}
         * @static
         */
        _apiSrc = '/_api/_search/',
        /**
         * @type {string}
         * @static
         */
        lang = Fn._getLang()
    ;

    /**
     *
     * @type {Object}
     * @private
     */
    var _Eshopy = {
        _fieldType : {
            text : "text",
            select : "select",
            checkbox : "checkbox",
            allergen : "allergen",
            integer : "integer",
            radio : "radio"
        }
    };

    /**
     *
     * @param array
     * @param value
     * @returns {*}
     */
    function inArray( array, value) {
        if(Fn._isSameType(array, [])){
            if(Fn._isSameType(value, "")){
                return Fn._isStringNotEmpty(value) && array.includes(value);
            }else if(Fn._isSameType(value, [])){
                return value.some( function (element) {
                    return Fn._isStringNotEmpty(element) && array.includes(element);
                } );
            }
        }
        return false;
    }

    /**
     *
     * @type {Object}
     * @private
     */
    _EshopField = {
        _searchableType  : [
            _Eshopy._fieldType.text,
            _Eshopy._fieldType.integer
        ]
        /**
         * render function
         * @example
         * param data
         * param rowData
         * param field
         * param options
         * render(data, rowData, field, options)
         * //return a value that is string or html string
         */
        , render: {
            /**
             * @param data
             * @param rowData
             * @param field
             * @param options
             */
            price: function (data, rowData, field, options) {
                return Fn._intToPrice(data);
            },
            /**
             *
             * @param data
             * @param rowData
             * @param field
             * @param options
             * @returns {string}
             */
            image: function (data, rowData, field, options) {
                return '<img src="' + data + '" class="img-fluid">';
            }

        }
    };


    /**
     * @module eShopy
     * @param {object} options
     *
     * @property {object} settings
     * @property {*} jQuerySelector
     * @property {string} eShopTemplate html template
     * @property {function} data
     * @property {function} option
     * @property {function} field
     * @property {function} fields
     * @property {function} draw
     * @property {function} init
     * @property {function} sort
     * @property {function} filter
     * @property {Object} defaults
     *
     */
    var Eshopy = $.fn.eShopy = function eShopy(options) {

        /**
         * Private property
         */

        /**
         * @var {object} settings
         * @type {object}
         * @private
         */
        var settings = fnEshopy.static._mergeSetting(options);

        console.log({
            settings : settings
        });

        /**
         * @member {Array} eShopData
         * @type {Array}
         */
        var eShopData = [];

        /**
         *
         * @type {{}}
         */
        var eShopOptions = {};


        /**
         *
         * @var {module:eShopy} that
         * @type {module:eShopy}
         */
        var that = this;

        /**
         * @var {object} settings
         * @type {Object}
         */
        that.settings = settings;

        /**
         *
         */
        that.jQuerySelector = this[0];



        /**
         *
         * @type {Array}
         * @private
         */
        var _displayShopData = [];

        /**
         *
         * @type {string}
         * @private
         */
        var _lastSearchValue = '';

        /**
         * END Private property
         */


        /**
         * Private functions
         */

        /**
         * @function setData
         * @param data {object|Array}
         * @returns {Array}
         */
        function setData(data) {
            if (Fn._isSameType(data, {}) && !$.isEmptyObject(data)) {
                eShopData = data;
                _displayShopData = eShopData.slice();
            }
            return eShopData;
        }

        /**
         * @function setOption
         * @param options {object|Array}
         * @returns {object}
         */
        function setOption(options) {
            if (Fn._isSameType(options, []) && !$.isEmptyObject(options)) {
                eShopOptions = options;
                $.each(settings.fields, function (index, field) {
                    var data = field[indexes.fieldOptions.data];
                    var fieldOption =  Fn._getObjByProp(eShopOptions, data, null);
                    if(fieldOption !== null){
                        field[indexes.fieldOptions.options] = fieldOption;
                    }
                });
            }
            return eShopOptions;
        }

        /**
         * END Private functions
         */

        /**
         * Public property
         */

        that.eShopTemplate = Eshopy.template.eShop;

        if(Fn._isStringNotEmpty(settings.templateSelector)){
            var $template = $(settings.templateSelector);
            if($template.length){
                that.eShopTemplate = $template.html();
                $template.remove();
            }
        }


        settings.event.init(that);

        /**
         * END Public property
         */


        /**
         * Public functions
         */

        /**
         * @function data
         * @returns {Array}
         */
        that.data = function $eShopy_data() {
            return eShopData;
        };

        /**
         * @function option
         * @returns {Object}
         */
        that.option = function $eShopy_option() {
            return eShopOptions;
        };

        /**
         * @function draw
         * @returns {module:eShopy}
         */
        that.draw = function $eShopy_draw() {
            settings.event.onDraw(that);

            fnEshopy.eShop._drawShop(that, settings, _displayShopData);

            return that;
        };

        /**
         * @function init
         * @returns {module:eShopy}
         */
        that.init = function $eShopy_init() {
            settings.event.preInit(that);
            var
                url = settings.ajax,
                dataSrc = settings.dataSrc
            ;
            settings.event.onInit(that);
            if (
                Fn._isStringNotEmpty(url) && Fn._isStringNotEmpty(dataSrc)
            ) {
                $.post(url, {_q: "search", lang : settings.lang}).done(function (ajaxResponse) {
                    var response = JSON.parse(ajaxResponse);
                    if (Eshopy.defaults.debug) {console.log(response)}
                    setData(response.data);
                    setOption(response.option);
                    that.sort();
                    settings.event.initDraw(that);
                    settings.event.preDraw(that);
                    fnEshopy.controls._drawControl(that, settings);
                    that.draw();

                    settings.event.postDraw(that);

                    Eshopy.initListener(that);
                });
            }

            settings.event.postInit(that);
            return that;
        };

        /**
         * @function sort
         * @returns {Array}
         */
        that.sort = function $eShopy_sort() {
            var arrayReturnedData = that.data().sort(function (a, b) {

            });
            if (Eshopy.defaults.debug) {console.log("sort", {
                arrayReturnedData : arrayReturnedData
            })}

            return arrayReturnedData;
        };

        /**
         * END Public functions
         */
        that.init();
        return that;
    };

    /**
     * @var {Object} defaults
     * @augments eShopy
     * @property {boolean} debug
     * @property {Object} options
     */
    Eshopy.defaults = {
        /**
         * @type {boolean}
         */
        debug: true,
        /**  */
        options: {}
    };

    /**
     * @var {Object} options
     * @extends eShopy.defaults
     * @augments eShopy.defaults.options
     * @type {Object}
     * @inner
     */
    Eshopy.defaults.options = {
        /**
         * url where the data should query
         * @property {string} ajax
         */
        ajax: _apiSrc,
        /** language of the query */
        lang: lang,
        /** source of the query */
        dataSrc: 'eshop',
        /** data's property to get the id */
        idSrc: 'idCode',
        /** DOM selector to display filter's control */
        controlSelector : '',
        /** define if process general search or not and draw the search input */
        search : true,
        /** all fields of eShopy */
        fields: [],
        //TODO
        image: false,
        /**  */
        templateSelector : '',
        filters : {
            search : "",
            category : "",
            postCode : "",
            promotion : false
        },
        event : Eshopy.event
    };






    Eshopy.template = {
        eShop:
        '<div class="eShop-item elevation dp-eShop">' +
        // '<div class="product-image">{imageWebPath}</div>' +
        '{imageWebPath}'+
        // '<div class="product-image"><img src="/yichan.jpg" alt=""></div>' +
        '<div class="product-all-details">' +
        '<div class="visible-details">' +
        '<div class="product-details">' +
        // '<p class="product-name text-xxxs text-accent">{categoryIdCode}</p>' +
        '<p class="product-name primary text-xs">{name}</p>' +
        '<p class="product-desc text-xxs">{description}</p>' +
        '<div class="product-allergen">'+
        '<p class="text-accent text-xxs m-b-5">allergènes</p>' +
        '<div>' +
        '{allergen}' +
        '</div>'+
        '</div>'+
        '</div>' +
        '<div class="product-extra">' +
        '<div class="price">' +
        // '<div class="price-option">' +
        //     '<div class="product-price">{price}</div>' +
        //     '<a href="/_api/_lightbox/product.php?id={idCode}" data-lightbox="ajax" class="btn btn-default product-detail">' +
        //         'détail' +
        //     '</a>' +
        //     '</div>' +
        // '</div>' +
        '<div class="cart">' +
        // '<div class="qty-cart">' +
        '<div class="product-price text-accent">{price}</div>' +
        '<input type="number" placeholder="1" value="1" min="1" class="qty-input form-control">' +
        '<button class="product-add btn dp-add-btn" data-dp-id={idCode}>' +
        '<i class="fas fa-cart-plus"></i>' +
        '</button>' +
        // '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'/*+



        '<div class="item-list right-checkout block-product shadow">' +
        '<div class="list-image">{imageWebPath}</div>' +
        '<div class="all-details">' +
        '<div class="visible-option">' +
        '<div class="details">' +
        '<p class=" product-name">{name}</p>' +
        '<p class="product-desc">{description}</p>' +
        '<a tabindex="0" class="allergen-popover" data-dp-id="{idCode}" role="button" data-trigger="" title="allergen" data-content=""> allergene</a>'+
        '</div>' +
        '<div class="extra">' +
        '<div class="price-info">' +
        '<div class="price-option">' +
        '<div class="product-price">{price}</div>' +
        '<a href="/_api/_lightbox/product.php?id={idCode}" data-lightbox="ajax" class="btn btn-default product-detail" ">détail</a>' +
        '</div>' +
        '</div>'+
        '<div class="cart-info">' +
        '<div class="qty-cart text-center">' +
        '<input data-sales-productid="2" type="number" placeholder="1" value="1" min="1" class="qty-input">' +
        '<button class="product-add btn" data-sales-productid="2"><i class="fas fa-cart-plus"></i></button>' +
        '</div>'+

        '</div>'+
        '</div>'+
        '</div>' +
        '</div>' +
        '</div>'*/
    };

    var models = Eshopy.models = {
        selectedAttr : "selected",
        dataAttr : "data-",
        dataIdAttr: "data-dc-id",
        eShop: {
            attr: {
                "class": "dc-eShop"
            }
        },
        controls : {
            inputNameAttr : 'dc_input_name',
            fieldNameDataAttr  : "data-search-field-name",
            dataFilterContainAttr : "data-filter-contain",
            inputSearch : {
                attr : {
                    class : "dc-general-search",
                    id : "dc-general-search"
                }
            }

        }
    };


    var indexes = Eshopy.indexes = {
        ajax: 'ajax',
        dataSrc: 'dataSrc',
        idSrc: 'idSrc',
        search : 'search',
        controlSelector : 'controlSelector',
        fields: 'fields',
        fieldsContain: 'fieldsContain',
        fieldsNotContain: 'fieldsNotContain',
        imageSrc: 'imageSrc',
        removeBtnSelector: 'removeBtnSelector',
        cartSelector: 'cartSelector',
        fieldOptions: {
            _id: '_id',
            _qty: 'qty',
            data: 'data',
            type: 'type',
            searchable: 'searchable',
            filter: 'filter',
            options: 'options',
            render: 'render',
            filterContain : 'filterContain'
        },
        fieldGroupOptions : {
            idSrc : 'idSrc',
            titleSelector : 'titleSelector',
            template : 'template',
            data : 'data',
            title : 'title',
            containerSelector : 'containerSelector',
            _valid : "_valid"
        }
    };

    Eshopy.listener = {

    };

    Eshopy.initListener = function (eShopy) {
        var allListener = Eshopy.listener;
        $.each(allListener, function (index, listener) {
            if ( Fn._isFunction(listener) ) {
                listener(eShopy);
            }
        })
    };

    Eshopy.event = {
        debug : false,
        init: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('init(eShopy) called', {eShopy: eShopy});
            }

        },
        preInit: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('preInit(eShopy) called', {eShopy: eShopy});
            }
        },
        onInit: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('onInit(eShopy) called', {eShopy: eShopy});
            }

        },
        postInit: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('postInit(eShopy) called', {eShopy: eShopy});
            }
        },
        initDraw: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('initDraw(eShopy) called', {eShopy: eShopy});
            }

        },
        preDraw: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('preDraw(eShopy) called', {eShopy: eShopy});
            }

        },
        onDraw: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('onDraw(eShopy) called', {eShopy: eShopy});
            }

        },
        postDraw: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('postDraw(eShopy) called', {eShopy: eShopy});
            }

            INSPIRO.header.mainMenu();
            INSPIRO.elements.magnificPopup();

        },
        initAddShop: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('initAddShop(eShopy) called', {eShopy: eShopy});
            }

        },
        preAddShop: function (eShopy, eShop) {
            if (Eshopy.event.debug) {
                console.log('preAddShop(eShopy, eShop) called', {eShopy: eShopy, eShop: eShop});
            }

        },
        onAddShop: function (eShopy, eShop) {
            if (Eshopy.event.debug) {
                console.log('onAddShop(eShopy, eShop) called', {eShopy: eShopy, eShop: eShop});
            }

        },
        postAddShop: function (eShopy, eShop) {
            if (Eshopy.event.debug) {
                console.log('postAddShop(eShopy, eShop) called', {eShopy: eShopy, eShop: eShop});
            }

        },
        initRemoveShop: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('initRemoveShop(eShopy) called', {eShopy: eShopy});
            }

        },
        preRemoveShop: function (eShopy, eShop) {
            if (Eshopy.event.debug) {
                console.log('preRemoveShop(eShopy, eShop) called', {eShopy: eShopy, eShop: eShop});
            }

        },
        onRemoveShop: function (eShopy, eShop) {
            if (Eshopy.event.debug) {
                console.log('onRemoveShop(eShopy, eShop) called', {eShopy: eShopy, eShop: eShop});
            }

        },
        postRemoveShop: function (eShopy, eShop) {
            if (Eshopy.event.debug) {
                console.log('postRemoveShop(eShopy, eShop) called', {
                    eShopy: eShopy,
                    eShop: eShop
                });
            }

        },
        onUpdateCart: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('onUpdateCart(eShopy) called', {eShopy: eShopy});
            }

        },
        postUpdateCart: function (eShopy) {
            if (Eshopy.event.debug) {
                console.log('postUpdateCart(eShopy) called', {eShopy: eShopy});
            }
            var $cartQty = $("#badge-qty");
            var length = Fn._getObjectLength(eShopy.cart());
            $cartQty.text(length);
        }

    };
    var fnEshopy = {};

    fnEshopy = Eshopy.fn = {
        debug : false,
        eShop: {
            _getElement: function (eShopy, rowData, eShopID) {
                var
                    settings = eShopy.settings,
                    arrayFields = settings.fields,
                    template = eShopy.eShopTemplate,
                    $eShopItem = null
                ;

                if (Fn._isStringNotEmpty(template)) {
                    $.each(arrayFields, function (index, field) {
                        var dataSrc = Fn._getObjByProp(field, indexes.fieldOptions.data, '');
                        if (Fn._isStringNotEmpty(dataSrc)) {
                            var fieldValue = Fn._getObjByProp(rowData, dataSrc, '');
                            var fieldOption = Fn._getObjByProp(field, indexes.fieldOptions.options, null);
                            var render = Fn._getObjByProp(field, indexes.fieldOptions.render, null);
                            if (fnEshopy.debug) {console.log({
                                field : field, fieldValue : fieldValue, fieldOption : fieldOption
                            })}

                            if (Fn._isFunction(render)) {
                                var fieldRender = render(fieldValue, rowData, field, fieldOption);
                                fieldValue = Fn._isNotUndefined(fieldRender) ? fieldRender : fieldValue;
                            }
                            if( ! Fn._isStringNotEmpty(fieldValue)){
                                fieldValue = "";
                            }
                            var searchRegExp = new RegExp('{' + dataSrc + '}', 'g');
                            template = template.replace(searchRegExp, fieldValue);
                        }

                    });
                    $eShopItem = $(template);
                    if (eShopID) {
                        $eShopItem.attr(models.dataIdAttr, eShopID).addClass(models.eShop.attr.class);
                    }
                }
                return $eShopItem;
            },
            _drawShop: function (eShopy, settings, arrayData) {
                $('.'+models.eShop.attr.class).remove();
                var idSrc = Fn._getObjByProp(settings, indexes.idSrc, "");
                if (fnEshopy.debug) {
                    console.log('Eshopy.loadShop() called', {eShopy: eShopy, arrayData : arrayData});
                }
                var $eShopPanels = $(eShopy.jQuerySelector);

                $.each(arrayData, function (index, eShop) {


                    var eShopId = Object.keys(eShop)[0];
                    eShop = eShop[eShopId];
                    var $eShopItem = fnEshopy.eShop._getElement(eShopy, eShop, eShopId);
                    if ($eShopItem !== null) {
                        $eShopItem.addClass(models.eShop.attr.class);

                        $eShopPanels.append($eShopItem);
                    }
                });
            }
        },
        static: {
            _mergeSetting: function (settings) {
                var
                    mergedSettings = $.extend(true, {}, Eshopy.defaults.options, settings)
                ;
                var event = Fn._getObjByProp(settings, "event", {});
                event = $.extend(true, {}, Eshopy.event, event);
                console.log({
                    event : event
                });
                mergedSettings.event = event;
                if (fnEshopy.debug) {console.log("_mergeSetting",{arguments: arguments})}
                return mergedSettings;
            },
            _stickyFilterMenu : function () {
                var pageMenu = document.getElementById("pageMenu");
                if (typeof pageMenu !== "undefined" && pageMenu !== null) {
                    var sticky = pageMenu.offsetTop - 80 ;
                    window.onscroll = function () {
                        if (window.pageYOffset >= sticky) {
                            pageMenu.classList.add("sticky")
                        } else {
                            pageMenu.classList.remove("sticky");
                        }
                    };
                }
            }
        }
    };

    fnEshopy.field = {
        _getFieldRender: function (type) {
            var allRender = _EshopField.render;
            if (allRender.hasOwnProperty(type) && typeof allRender[type] === typeof function () {
                }) {
                return allRender[type]();
            } else {
                return null;
            }
        }
    };

    fnEshopy.controls = {
        _drawControl : function (eShopy, settings) {
            var controlSelector = Fn._getObjByProp(settings, indexes.controlSelector, "");
            if(Fn._isStringNotEmpty(controlSelector)){
                var $searchControl = $(controlSelector);
                if($searchControl.length){
                    $searchControl.addClass('eShopy-controls');
                    var isValidGeneralSearch = fnEshopy.controls._isValidGeneralSearch(eShopy, settings, false);

                    if(isValidGeneralSearch){
                        var $generalSearch = fnEshopy.controls._getGeneralSearch(eShopy, settings);
                        $searchControl.append($generalSearch);
                    }
                    var arrayFields = Fn._getObjByProp(settings, indexes.fields, []);
                    $.each(arrayFields, function (index, fieldElement) {
                        var type = Fn._getObjByProp(fieldElement, indexes.fieldOptions.type, "");
                        var isFilter = Fn._getObjByProp(fieldElement, indexes.fieldOptions.filter, false);
                        var $fieldFilter = null;
                        if(Fn._isStringNotEmpty(type) && isFilter){
                            switch (type){
                                case _Eshopy._fieldType.select :
                                    $fieldFilter = fnEshopy.controls._getSelectFilter(eShopy, settings, fieldElement);

                                    break;
                                case _Eshopy._fieldType.radio :
                                    $fieldFilter = fnEshopy.controls._getRadioFilter(eShopy, settings, fieldElement);

                                    break;
                                case _Eshopy._fieldType.checkbox :
                                    $fieldFilter = fnEshopy.controls._getCheckBoxFilter(eShopy, settings, fieldElement);
                                    break;
                                case _Eshopy._fieldType.allergen :
                                    $fieldFilter = fnEshopy.controls._getCheckBoxAllergenFilter(eShopy, settings, fieldElement);
                                    break;
                            }
                        }
                        $searchControl.append($fieldFilter);
                        if(fnEshopy.debug) {
                            console.log("$.each(arrayFields)", {
                                fieldElement: fieldElement,
                                type: type
                            });
                        }
                    });

                    if(fnEshopy.debug) {
                        console.log("_drawControl()", {
                            isValidSearch: isValidGeneralSearch,
                            controlSelector: controlSelector,
                            $searchControl: $searchControl,
                            arrayFields: arrayFields
                        });
                    }
                }
            }
        },
        _getListElement : function (eShopy, settings) {
            return $('<li/>');
        },
        _getListElementDropDown : function (eShopy, settings, fieldElement) {
            var $listElement =  $('<li/>').addClass('dropdown');
            $listElement.append($('<a/>').attr({
                href : 'javascript:void(0)'
            }).text(fieldElement.title));
            $listElement.append($('<div/>').attr({
                class : 'dropdown-menu'
            }));
            return $listElement;
        },
        _isValidGeneralSearch : function (eShopy, settings) {
            var isSearch = Fn._getObjByProp(settings, indexes.search, false);
            var arrayFields = Fn._getObjByProp(settings, indexes.fields, []);

            if(isSearch === false){
                return false;
            }

            var searchFields = arrayFields.filter(function (field) {
                var searchable = Fn._getObjByProp(field, indexes.fieldOptions.searchable, false);
                var type = Fn._getObjByProp(field, indexes.fieldOptions.type, "");
                if(fnEshopy.debug) {
                    console.log('arrayFields.filter()', {
                        field: field,
                        searchable: searchable,
                        type: type
                    });
                }
                if(Fn._isStringNotEmpty(type)){
                    return searchable && _EshopField._searchableType.includes(type);
                }
                return false;
            });
            if(fnEshopy.debug) {
                console.log('_isValidGeneralSearch()', {
                    arguments: arguments,
                    isSearch: isSearch,
                    arrayFields: arrayFields,
                    searchFields: searchFields
                });
            }
            return searchFields.length > 0;
        },
        _getGeneralSearch : function (eShopy, settings) {
            var $listElement = fnEshopy.controls._getListElement(eShopy, settings);
            var $search =  $('<div class="input-group">' +
                '<div class="input-group-prepend"><span class="input-group-text"><i class="fa fa-search "></i></span></div>' +
                '<input id="" autocomplete="new-password" type="text" class="form-control text-xs " placeholder="produit">' +
                '</div>');
            $('input', $search).attr('id', models.controls.inputSearch.attr.id).addClass(models.controls.inputSearch.attr.class);
            return $listElement.append($search);
        },
        _getSelectOption : function (eShopy, settings, fieldElement, option) {
            if(fnEshopy.debug){
                console.log('_getSelectOption', {arguments : arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);
            var optionName = Fn._getObjByProp(option, "_name", null);
            if(Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)){
                return $('<option/>').attr('value', optionValue).text(optionName);
            }
            return null;
        },
        _getSelectFilter : function (eShopy, settings, fieldElement) {
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            var $listElement = fnEshopy.controls._getListElementDropDown(eShopy, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if(arrayOptions.length && $listElement.length && $dropDownContainer.length){
                var hasOption = false;
                var $select = $('<select/>').addClass('form-control').attr(models.controls.fieldNameDataAttr, fieldData);
                var $listOptionAll = fnEshopy.controls._getSelectOption(eShopy, settings, fieldElement, {
                    _value : "-1",
                    _name : "Tout"
                });
                $select.append($listOptionAll);
                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnEshopy.controls._getSelectOption(eShopy, settings, fieldElement, option);
                    if($listOption && $listOption.length){
                        hasOption = true;
                        $select.append($listOption);
                    }
                });
                if(hasOption){
                    $dropDownContainer.append($select);
                    return $listElement;
                }
            }
            return null;

        },
        _getCheckBoxOption : function (eShopy, settings, fieldElement, option) {
            if(fnEshopy.debug){
                console.log('_getCheckBoxOption', {arguments : arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);

            var optionName = Fn._getObjByProp(option, "_name", null);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            if(Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)){
                var $checkboxContainer = $('<div/>').addClass('form-check');
                var $label = $('<label/>').addClass('form-check-label').text(optionName);
                var $input = $('<input/>').addClass('form-check-input bg-primary')
                    .attr({
                        type : 'checkbox', checked : 'checked', value : optionValue
                    })
                    .attr(models.controls.fieldNameDataAttr, fieldData)
                    .attr(models.controls.dataFilterContainAttr, fieldElement[indexes.fieldOptions.filterContain]);
                return $checkboxContainer.append($input).append($label);
            }
            return null;
        },
        _getCheckBoxFilter : function (eShopy, settings, fieldElement) {
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var $listElement = fnEshopy.controls._getListElementDropDown(eShopy, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if(arrayOptions.length && $listElement.length && $dropDownContainer.length){
                var hasOption = false;
                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnEshopy.controls._getCheckBoxOption(eShopy, settings, fieldElement, option);
                    if($listOption && $listOption.length){
                        hasOption = true;
                        $dropDownContainer.append($listOption);
                    }
                });
                if(hasOption){
                    return $listElement;
                }
            }
            return null;

        },
        _getCheckBoxAllergenOption : function (eShopy, settings, fieldElement, option) {
            if(fnEshopy.debug){
                console.log('_getCheckBoxOption', {arguments : arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);

            var optionName = Fn._getObjByProp(option, "_name", null);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            if(Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)){
                var $checkboxContainer = $('<div/>').addClass('form-check allergen');
                var $label = $('<label/>').addClass('form-check-label').text(optionName);
                var $input = $('<input/>').addClass('form-check-input bg-primary')
                    .attr({
                        type : 'checkbox', checked : 'checked', value : optionValue
                    })
                    .attr(models.controls.fieldNameDataAttr, fieldData)
                    .attr(models.controls.dataFilterContainAttr, fieldElement[indexes.fieldOptions.filterContain]);
                return $checkboxContainer.append($input).append($label);
            }
            return null;
        },
        _getCheckBoxAllergenFilter : function (eShopy, settings, fieldElement) {
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var $listElement = fnEshopy.controls._getListElementDropDown(eShopy, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if(arrayOptions.length && $listElement.length && $dropDownContainer.length){
                var hasOption = false;
                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnEshopy.controls._getCheckBoxAllergenOption(eShopy, settings, fieldElement, option);
                    if($listOption && $listOption.length){
                        hasOption = true;
                        $dropDownContainer.append($listOption);
                    }
                });
                if(hasOption){
                    return $listElement;
                }
            }
            return null;

        },
        _getRadioOption : function (eShopy, settings, fieldElement, option) {
            if(fnEshopy.debug){
                console.log('_getRadioOption', {arguments : arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);
            var optionName = Fn._getObjByProp(option, "_name", null);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            if(Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)){
                var $checkboxContainer = $('<div/>').addClass('form-check');
                var $label = $('<label/>').addClass('form-check-label').text(optionName);
                var $input = $('<input/>').addClass('form-check-input bg-primary').attr({
                    type : 'radio', value : optionValue
                }).attr(models.controls.fieldNameDataAttr, fieldData);
                return $checkboxContainer.append($input).append($label);
            }
            return null;
        },
        _getRadioFilter : function (eShopy, settings, fieldElement) {
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var $listElement = fnEshopy.controls._getListElementDropDown(eShopy, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if(arrayOptions.length > 1 && $listElement.length && $dropDownContainer.length){
                var hasOption = false;

                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnEshopy.controls._getRadioOption(eShopy, settings, fieldElement, option);
                    if($listOption && $listOption.length){
                        hasOption = true;
                        $dropDownContainer.append($listOption);
                    }
                });
                if(hasOption){
                    return $listElement;
                }
            }
            return null;
        }
    };



}(jQuery));