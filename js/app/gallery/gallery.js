
(function( $, _DataTable, _Translation, _Editor, _Field ) {
    /**
     * function to check if the value's type is same type of compate
     * @param value
     * @param compare
     * @returns {boolean}
     * @private
     */
    function _fnCheckSameType(value, compare) {
        return typeof value === typeof compare;
    }
    /**
     * function to check if the value's type is string and its not empty
     * @param value
     * @returns {boolean}
     * @private
     */
    function _fnCheckTypeStringNotEmpty (value){
        return _fnCheckSameType(value, "") && value !== "";
    }

    /**
     * function to get an object by index
     * @param obj
     * @param property
     * @param defValue
     * @private
     */
    function _getObjByProp(obj, property, defValue) {
        if( _fnCheckSameType(obj, {}) && _fnCheckTypeStringNotEmpty(property)){
            return obj.hasOwnProperty(property) ?  obj[property] : defValue;
        }else {
            return defValue;
        }
    }

    /**
     * function to create an jquery element by it's tag name and attribute
     * @param tag
     * @param attr
     * @returns {*|HTMLElement}
     * @private
     */
    function _createJqueryElement (tag, attr) {
        var $elem = $('<' + tag + '/>');
        if(_fnCheckSameType(attr, {})){
            $elem.attr(attr);
        }
        return $elem;
    }


    /**
     * @private
     */
    var _Gallery = {
        debug : false
    };

    $.fn.Gallery = function (settings) {
        var drawAll = -1;
        if(_Gallery.debug){
            console.log("$.fn.Gallery(settings) called", {settings : settings});
        }
        /**
         * merge settings with default options
         */
        settings = GalleryFn.card._mergeSetting(settings);

        /**
         * set the jquerySelector
         */
        settings.jquerySelector = this[0];

        this.settings = settings;

        var that = this;

        settings.event.onStart(settings);

        that.selector = {};

        var jsonData = {};

        /**
         * @private
         * @param data
         * @returns {{}}
         */

        function setData(data) {
            if( _fnCheckSameType(data, {}) && ! $.isEmptyObject(data)){
                jsonData = data;
            }
            return jsonData;
        }

        /**
         * @public
         */

        /**
         * first function to be called
         * load data from the ajax url
         * @returns {$}
         */
        that.init = function () {
            settings.event.initLoad();
            settings.event.preLoad();
            var
                url = settings.ajax,
                dataSrc = settings.dataSrc
            ;
            if(
                _fnCheckTypeStringNotEmpty(url) && _fnCheckTypeStringNotEmpty(dataSrc)
            ){
                $.ajax( {
                    url: url,
                    method: "GET",
                    async: false,
                    data: { _t: dataSrc},
                    success: function ( ajaxResponse ) {
                        settings.event.onLoad(that.settings);

                        setData(JSON.parse(ajaxResponse));

                        GalleryFn.card._createRowContainer(that);


                        var $select = $("select", ".dc-search-panel");
                        var drawItem = drawAll;
                        if($select.length){
                            drawItem = parseInt($select.val());
                        }



                        if(settings.pageLength !== false && _fnCheckSameType(settings.pageLength, 1)){
                            drawItem = settings.pageLength;
                            if($select.length && $("option[value='"+drawItem+"']", $select).length){
                                $select.val(settings.pageLength);
                            }
                        }

                        that.draw(0, drawItem);

                        settings.event.postLoad();

                        return that;
                    }
                } );
            }

            return that;
        };


        /**
         * draw the Gallery plugin from the array data
         * @returns {$}
         */
        that.draw = function (start, end) {
            var jsonData = that.data();
            var data = _getObjByProp(jsonData, indexes.data, []);
            var dataMultiField = _getObjByProp(jsonData, indexes.dataMulti, []);
            start = start < 0 ? 0 : start;
            end = end < 0 || end >= data.length  ? data.length : end;
            console.log({
                start : start,
                end : end,
                data : data,
                length : data.length
            });
            var elements = data.slice(start, end);

            GalleryFn.card._displayCards(elements, dataMultiField, that);


            settings.event.initDraw();
            settings.event.preDraw();
            settings.event.onDraw();

            GalleryFn.initListener(that, editor);
            _Editor._enableField(editor, editorFields);

            settings.event.postDraw();
            return that;
        };

        /**
         * destroy the Gallery plugin from the array data
         * @returns {$}
         */
        that.destroy = function () {
            var panelSelector = $(settings.jquerySelector);
            if(panelSelector !== null && panelSelector instanceof jQuery){
                panelSelector.html("");
            }
            var btnPanelSelector = $(settings.controlPanel);
            if(btnPanelSelector !== null && btnPanelSelector instanceof jQuery){
                btnPanelSelector.html("");
            }
            return that;
        };

        /**
         * get the settings
         * @returns {*}
         */
        that.settings = function () {
            return settings;
        };

        /**
         * get translation
         * @returns {*}
         */
        that.i18n = function () {
            return _Translation._get(settings.language);
        };

        /**
         * get ajax data
         * @returns {{}}
         */
        that.data = function () {
            return jsonData;
        };

        /**
         * get array fields
         */
        that.fields = function () {
            //TODO
        };

        /**
         * get array multi fields
         */
        that.multiFields = function () {
            //TODO
        };

        that.filter = function (inputVal) {
            var $allCards = $("."+models.card.item.attr.class, settings.jquerySelector);
            if(inputVal !== ""){
                $allCards.each(function () {
                    var $elem = $(this);
                    var found = false;
                    var $fieldDisplay = $('.dc-field:not(.hide) .dc-field-display', $elem);
                    $fieldDisplay.each(function (fieldIndex, fieldDisplay) {
                        var fieldText = $(fieldDisplay).text();
                        if(fieldText.toLowerCase().includes(inputVal)){
                            found = true;
                        }

                    });
                    var $multiFieldDisplay = $('.dc-multi-field:not(.hide) .dc-field-display', $elem);
                    $multiFieldDisplay.each(function (multiFieldIndex, multiFieldDisplay) {
                        var multiFieldText = $(multiFieldDisplay).text();
                        if(multiFieldText.toLowerCase().includes(inputVal)){
                            found = true;
                        }

                    });
                    if(found){
                        $elem.show();
                    }else {
                        $elem.hide();
                    }
                });
            }else {
                $allCards.show();
            }
        };

        that.length = function (length) {

            var $allCards = $("."+models.card.item.attr.class, settings.jquerySelector);
            if(length > 0){
                if($allCards.length > length){
                    $allCards.each(function (index, element) {
                        var realIndex = index +1;
                        if(realIndex > length){
                            $(element).remove();
                        }
                    });
                }else {
                    that.draw($allCards.length, length);
                }
            }else {
                that.draw($allCards.length, drawAll);
            }
        };

        var editorFields = GalleryFn.field._getEditorField(settings);

        _createCustomEditorTemplate(settings);
        /**
         * return the editor instance
         * @returns {Editor|*}
         */
        that.editor = function () {
            return editor;
        };



        var editor = new $.fn.DataTable.Editor( {
            ajax: settings.ajax,
            template : settings.template,
            fields: editorFields,
            idSrc : "_col_id_code",
            i18n : that.i18n()
        } );
        console.log({editor : editor});

        /**
         * private function
         */

        CardEditorFn.init(that, editor);




        that.init();

        settings.event.started();
        if(_Gallery.debug){
            console.log({
                0 : "$.fn.Gallery() parameter",
                editorFields : editorFields,
                Gallery : that,
                editor : editor
            });
        }
        return that;

    };


    /**
     * Gallery functions
     */

    var Gallery = $.fn.Gallery;


    /**
     * Gallery indexes
     */
    var indexes = Gallery.index = {
        data : "data",
        dataMulti : "dataMulti",
        ajax : "ajax",
        dataSrc : "dataSrc",
        idSrc : "idSrc",
        titleSrc : "titleSrc",
        lengthMenu : "lengthMenu",
        offSet : "offSet",
        columnDisplay : "columnDisplay",
        fields : "fields",
        multiFields : "multiFields",
        itemSrc : "itemSrc",
        select : "select",
        sortable : "sortable",
        controlPanel : "controlPanel",
        buttons : "buttons",
        language : "language",
        edit : "edit",
        template : "template",
        create : "create",
        remove : "remove",
        fieldItemOptions : {
            className : "className",
            name : "name",
            data : "data",
            id : "id",
            label : "label",
            type : "type",
            visible : "visible",
            searchable : "searchable",
            orderable : "orderable",
            options : "options"
        }
    };

    /**
     * Gallery Models
     */
    var models = Gallery.model = {
        hideClass : "hide",
        selectedClass : "selected",
        disabledClass : "disabled",
        btnXsClass : "btn-xs",
        dataIdAttr : "data-id",
        dataEditorIdAttr : "data-editor-id",
        dataEditorFieldAttr : "data-editor-field"
    };

    models.control = {
        controlPanelContainer : {
            attr : {
                'class' : "dc-control-container"
            }
        },
        btnPanel : {
            attr : {
                'class' : 'dc-btn-panel'
            }
        },
        btn : {
            btnGroup : {
                attr : {
                    "class" : "dc-btn-group btn-group flex-wrap"
                }
            },
            item : {
                attr : {
                    "class" : "dc-button btn  m-b-0",
                    "data-toggle" : "tooltip",
                    "data-placement" : "bottom",
                    title : ''
                }
            },
            edit : {
                attr : {
                    "class" : "edit"
                },
                icon : '<i class="fas fa-edit"></i>'
            },
            remove : {
                attr : {
                    "class" : "remove"
                },
                icon : '<i class="far fa-trash-alt"></i>'
            },
            create : {
                attr : {
                    "class" : "create"
                },
                icon : '<i class="fa fa-plus"></i>'
            },
            selectAll : {
                attr : {
                    "class" : "select-all"
                },
                icon : '<span class="fa-stack fa-xs text-sm">' +
                '<i class="far fa-square fa-stack-2x"></i><i class="fas fa-check-double fa-inverse"></i>' +
                '</span>'
            },
            selectNone : {
                attr : {
                    "class" : "select-none"
                },
                icon : '<i class="far fa-square"></i>'
            }
        },
        clone : {
            attr : {
                "class" : "dc-control-clone"
            },
            stickyClass : "sticky bg-light elevation"
        },
        filterClass : "dc-control-filter",
        selectLength : {
            attr : {
                'class' : 'dc-select-length'
            }
        },
        inputSearch : {
            attr : {
                type : 'search',
                'class' : 'dc-input-search'
            }
        }
    };

    models.card = {
        rowCardContainer : {
            attr : {
                "class" : 'dc-row-container'
            }
        },
        rowPageLengthContainer : {
            attr : {
                "class" : 'dc-row-length-container'
            }
        },
        pageInfo : {
            attr : {
                "class" : 'dc-page-info',
                id : 'dc-page-info'
            }
        },
        pagination : {
            attr : {
                "class" : 'dc-pagination',
                id : 'dc-pagination'
            }
        },
        item : {
            attr : {
                "class" : "dc-card"
            }
        },
        container : {
            attr: {
                "class": "dc-card-container",
                "data-toggle" : "tooltip",
                "data-placement" : "top",
                title : ''
            }
        },
        btnContainer : {
            attr : {
                "class" : "dc-card-btn-container"
            }
        }

    };

    models.field = {
        fieldContainer : {
            attr : {
                "class" : "dc-field-container"
            }
        },
        multiFieldContainer : {
            attr : {
                "class" : "dc-multi-field-container"
            }
        },
        item : {
            attr : {
                "class" : "dc-field"
            },
            multi : {
                attr : {
                    "class" : "dc-multi-field"
                }
            },
            legend : {
                attr : {
                    "class" : "dc-field-title"
                }
            },
            label : {
                attr : {
                    "class" : "dc-field-label"
                }
            },
            display : {
                attr : {
                    "class" : "dc-field-display m-l-10"
                }
            },
            value : {
                attr : {
                    "class" : "dc-field-value"
                }
            }
        }
    };

    models.editor = {
        template : {
            attr : {
                "class" : "dc-editor-template",
                id : "dc-editor-template"
            }
        }
    };

    /**
     * create a custom template for the editor
     * @param settings
     * @private
     */
    function _createCustomEditorTemplate(settings) {
        console.log("_createCustomEditorTemplate() called");
        var $templateContainer = _createJqueryElement("div", models.editor.template.attr);

        var
            arrayFields = _getObjByProp(settings, indexes.fields, []),
            dataSrc = _getObjByProp(settings, indexes.dataSrc, "")
        ;
        if(arrayFields.length>0){
            var $fieldSetNormal = _createFieldSetNormal(arrayFields, dataSrc);
            $templateContainer.append($fieldSetNormal);
        }

        var
            multiField = _getObjByProp(settings, indexes.multiFields, {}),
            multiDataSrc = _getObjByProp(multiField, indexes.dataSrc, ""),
            multiItemSrc = _getObjByProp(multiField, indexes.itemSrc, []),
            arrayMultiFields = _getObjByProp(multiField, indexes.fields, [])
        ;
        $.each(multiItemSrc, function (index, itemSrc) {
            $templateContainer.append(_createFieldSetMulti(arrayMultiFields, itemSrc, dataSrc, multiDataSrc));
        });
        $templateContainer.appendTo("body");

    }

    function _createFieldSetNormal(arrayFields, dataSrc) {
        var $fieldSetNormal = _createJqueryElement("div", {"class" : "col-lg-12"});
        $.each(arrayFields, function (index, element) {
            var field = $.extend(true, {}, element);
            field.data = dataSrc + "." + element.name;
            field.name = dataSrc + "." + element.name;
            var $editorField = _createJqueryElement("editor-field", {"name" : field.name});

            $fieldSetNormal.append($editorField);
        });
        return $fieldSetNormal;
    }

    function _createFieldSetMulti(arrayMultiFields, itemSrc, dataSrc, multiDataSrc) {
        var $fieldSetMulti = _createJqueryElement("div", {"class" : "col-lg-6"});
        var $fieldSet = _createJqueryElement("fieldset", models.field.item.multi.attr);
        var $legend = _createJqueryElement("legend", models.field.item.legend.attr).text("title");
        $fieldSet.append($legend);
        $.each(arrayMultiFields, function (multiFieldIndex, element) {
            var field = $.extend(true, {}, element);

            var dataSrcMulti = _fnCheckSameType(dataSrc, '') && multiDataSrc !== "" ? multiDataSrc+ '.' : "";

            var src = typeof itemSrc === typeof "" && itemSrc !== "" ? itemSrc+ '.' : "";


            field.data = dataSrcMulti + field.name;
            field.name = dataSrcMulti + src + field.name;

            var $editorField = _createJqueryElement("editor-field", {"name" : field.name});
            $editorField.appendTo($fieldSet);
        });
        $fieldSetMulti.append($fieldSet);
        return $fieldSetMulti;
    }


    var GalleryFn = Gallery.functions = {

    };

    /**
     * All the listener for the plugin
     */
    GalleryFn.listener = {

    };

    /**
     * initialize all the listener
     * @param Gallery
     * @param editor
     */
    GalleryFn.initListener = function (Gallery, editor) {
        var allListener = GalleryFn.listener;
        $.each(allListener, function (index, listener) {
            if(_fnCheckSameType(listener, function () {})){
                listener(Gallery, editor);
            }
        });
    };

    GalleryFn.jqElement = {

    };
    /**
     * functions card
     */

    GalleryFn.card = {
        debug : false,
        /**
         * merge settings with default options
         * @param settings
         * @private
         */
        _mergeSetting : function (settings) {
            var
                mergedSettings =  $.extend(true, {}, $.fn.Gallery.defaults.options, settings),
                arraySettingsFields = mergedSettings.fields
            ;

            var arrayFields = [];

            $.each(arraySettingsFields, function (index, element) {
                var field = $.extend({}, $.fn.Gallery.defaults.field.options, element);
                field.render = GalleryFn.field._getFieldRender(field.type, field.options);
                arrayFields[index] = field;
            });

            mergedSettings.fields = arrayFields;

            if(settings.hasOwnProperty(indexes.multiFields)){
                var multiField = settings[indexes.multiFields];
                multiField = GalleryFn.card._mergeMultiField(multiField);

                mergedSettings.multiField = multiField;
            }
            return mergedSettings;
        },
        /**
         * get each card jQuery element
         * @param settings
         * @param dataItem
         * @param idSrc
         * @returns {*}
         * @private
         */
        _getCardPanelJquery : function (settings, dataItem, idSrc) {
            var $cardPanel = null;

            var id = _getObjByProp(dataItem, idSrc, "");
            if( _fnCheckTypeStringNotEmpty(id) ){
                $cardPanel = $("<div/>")
                    .attr(models.card.item.attr)
                    .addClass('col-md-4 col-lg-4 col-sm-6')
                    .attr(models.dataEditorIdAttr, id)
                ;
                var $cardContainer = $("<div/>").attr(models.card.container.attr).addClass('elevation p-10 m-b-10 m-t-10');

                var $btnContainer = $('<div/>').attr(models.card.btnContainer.attr);

                var $editBtn = null;

                if(settings.edit){
                    $editBtn = $('<button/>')
                        .attr(models.control.btn.item.attr )
                        .addClass(models.control.btn.edit.attr.class)
                        .addClass(models.btnXsClass)
                        .attr(models.dataIdAttr, id)
                        .append($(models.control.btn.edit.icon))
                    ;
                    $btnContainer.append($editBtn);
                }
                var $removeBtn = null;
                if(settings.remove){
                    $removeBtn = $('<button/>')
                        .attr(models.control.btn.item.attr )
                        .addClass(models.control.btn.remove.attr.class)
                        .addClass(models.btnXsClass)
                        .attr(models.dataIdAttr, id)
                        .append($(models.control.btn.remove.icon))
                    ;
                    $btnContainer.append($removeBtn);
                }

                if($editBtn !== null || $removeBtn !== null){
                    $cardContainer.append($btnContainer);
                }


                var $fieldContainer = $('<div/>').attr(models.field.fieldContainer.attr);
                var $multiFieldContainer = $('<div/>').attr(models.field.multiFieldContainer.attr);

                $cardContainer.append($fieldContainer).append($multiFieldContainer);

                $cardPanel.append($cardContainer);
            }
            return $cardPanel;
        },
        /**
         * merge the multiField setting with default options
         * @param multiField
         * @returns {*}
         * @private
         */
        _mergeMultiField : function (multiField) {
            if(multiField.hasOwnProperty(indexes.fields)){
                var fieldsMulti = multiField[indexes.fields];
                if(typeof fieldsMulti === typeof []){
                    var arrayFieldsMulti = [];
                    $.each(fieldsMulti, function (index, fieldMulti) {

                        fieldMulti =  $.extend(true, {}, $.fn.Gallery.defaults.field.options, fieldMulti);
                        fieldMulti.render = GalleryFn.field._getFieldRender(fieldMulti.type, fieldMulti.options);
                        arrayFieldsMulti.push(fieldMulti);
                    });
                    multiField.fields = arrayFieldsMulti;
                }
            }
            multiField = $.extend({}, $.fn.Gallery.defaults.multiField.options, multiField);

            return multiField;
        },
        /**
         * process the response from the ajax data
         * @param data
         * @param dataMultiField
         * @param Gallery
         * @private
         */
        _displayCards : function (data, dataMultiField, Gallery) {
            var settings = Gallery.settings();
            if(GalleryFn.card.debug){
                console.log("GalleryFn._displayCards(settings, editor, response) called");
            }
            var $rowContainer = $('.'+models.card.rowCardContainer.attr.class, settings.jquerySelector);
            if($rowContainer.length){
                $.each(data, function (index, dataItem) {
                    var $cardPanel = GalleryFn.card._createItemPanel(settings, dataItem, dataMultiField);
                    if($cardPanel !== null ){

                        $rowContainer.append( $cardPanel);
                    }

                });
            }
            if(GalleryFn.card.debug){
                // console.log(debug);
            }

            if(settings.sort){
                GalleryFn.editor.sortable('.' + models.card.rowCardContainer.attr.class);
            }
        },

        _createItemPanel : function (settings, dataItem, dataMultiField) {
            var arrayFields = _getObjByProp(settings, indexes.fields, []);
            var idSrc = _getObjByProp(settings, indexes.idSrc, "");
            var $panel = null;

            var debug = {};
            debug[0] = "GalleryFunctions._createPanel(settings, data, arrayFields, idSrc) called";
            debug.settings = settings;
            debug.data = dataItem;
            debug.arrayFields = arrayFields;
            debug.idSrc = idSrc;
            debug.fields = [];

            if( _fnCheckTypeStringNotEmpty(idSrc) ){
                var id = dataItem[idSrc];
                $panel = GalleryFn.card._getCardPanelJquery(settings, dataItem, idSrc);

                if($panel !== null && $panel instanceof jQuery){


                    $.each(arrayFields, function (index, fieldElement) {
                        var fieldString = GalleryFn.field._getFieldString(dataItem , fieldElement, settings);
                        if(fieldString.length){
                            $("."+ models.field.fieldContainer.attr.class , $panel).append(fieldString);
                            debug.fields[index] = fieldString;
                        }
                    });

                    if(settings.hasOwnProperty(indexes.multiFields)){
                        var settingsMultiField = settings[indexes.multiFields];
                        var itemSrc = settingsMultiField.itemSrc;
                        if(typeof itemSrc === typeof [] && itemSrc.length > 0){
                            if(dataMultiField.hasOwnProperty(id)){
                                var arrayDataMultiField = dataMultiField[id];

                                $.each(itemSrc, function (index, src) {
                                    if(arrayDataMultiField.hasOwnProperty(src)){
                                        var data = arrayDataMultiField[src];
                                        var $multiFieldPanel = GalleryFn.field._getMultiFieldPanel(settings, data, src);
                                        if($multiFieldPanel !== null && $multiFieldPanel instanceof jQuery && $multiFieldPanel.length){

                                            $("."+ models.field.multiFieldContainer.attr.class, $panel).append($multiFieldPanel);
                                        }
                                    }
                                });
                            }
                        }
                    }



                    debug.panel = $panel;
                }


            }
            if(GalleryFn.card.debug){
                console.log(debug);
            }
            return $panel;
        },
        _createRowContainer : function (Gallery) {
            var settings = Gallery.settings();
            var $rowContainer = $('<div/>').attr(models.card.rowCardContainer.attr).addClass("row");
            $rowContainer.appendTo(settings.jquerySelector);
        }
    };

    /**
     * Gallery functions field
     */

    GalleryFn.field = {
        debug : false,
        /**
         *
         * @param settings
         * @param dataItem
         * @param src
         * @returns {*}
         * @private
         */
        _getMultiFieldPanel : function (settings, dataItem, src ) {
            if(!$.isEmptyObject(dataItem)){
                var
                    $panelJquery = null,
                    multiField = settings.multiField,
                    arrayFields = _getObjByProp(multiField, indexes.fields, []),
                    titleSrc = _getObjByProp(multiField, indexes.titleSrc, ""),
                    title = ""
                ;
                if(dataItem.hasOwnProperty(titleSrc)){
                    title = dataItem[titleSrc];
                }
                var displayPanel = false;
                var panelLength = 0;
                var $panel = $('<fieldset/>').attr(models.field.item.multi.attr);
                var $titleLegend = $('<legend/>').attr(models.field.item.legend.attr).text(title);
                $panel.append($titleLegend);
                $.each(arrayFields, function (index, fieldElement) {
                    var $fieldMulti = GalleryFn.field._getFieldMultiField(dataItem , fieldElement, settings, src);
                    if($fieldMulti !== null && $fieldMulti instanceof jQuery){
                        if(!$fieldMulti.hasClass(models.hideClass)){
                            displayPanel = true;
                        }
                        $panel.append($fieldMulti);
                        panelLength++;
                    }
                });
                if(panelLength > 0){
                    $panelJquery = $panel;
                    if(!displayPanel){
                        $panelJquery.addClass(models.hideClass);
                    }
                }

            }

            if(GalleryFn.field.debug){
                console.log({
                    settings : settings, arrayFields : arrayFields, dataItem : dataItem, title : title, $panel : $panel, titleSrc : titleSrc
                });
            }

            return $panelJquery;
        },

        _getFieldMultiField : function (data, field, settings, src) {
            var
                $returnField = null,
                dataSrc = settings.multiField.dataSrc,
                fieldLabel = field.label,
                fieldData = field.name
            ;
            if(data.hasOwnProperty(fieldData) && _fnCheckTypeStringNotEmpty( data[fieldData] ) ){
                $returnField = $('<div/>').attr(models.field.item.multi.attr);
                if( !field.visible ){
                    $returnField.addClass(models.hideClass);
                }
                var renderData = data[fieldData];
                if(typeof field.render === typeof function () {}){
                    renderData = field.render(data[fieldData], field.type, settings);
                }
                if( _fnCheckTypeStringNotEmpty(src) ){
                    src += ".";
                }
                var dataEditorField = dataSrc + '.' +src + fieldData;
                var $fieldLabel = $('<div/>').attr(models.field.item.label.attr).text(fieldLabel);
                var $fieldDisplay = $('<div/>').attr(models.field.item.display.attr).text(renderData);
                var $fieldValue = $('<div/>').attr(models.field.item.value.attr).text(data[fieldData]).attr(models.dataEditorFieldAttr, dataEditorField);
                $returnField
                    .append($fieldLabel)
                    .append($fieldDisplay)
                    .append($fieldValue)
                ;
            }



            if(GalleryFn.field.debug){
                console.log({
                    dataSrc : dataSrc,
                    fieldLabel : fieldLabel,
                    fieldData : fieldData
                });
            }

            return $returnField;
        },

        _getFieldString : function (data, field, settings) {
            var
                $returnField = "",
                dataSrc = settings.dataSrc,
                fieldLabel = field.label,
                fieldData = field.name
            ;
            if(data.hasOwnProperty(fieldData) && _fnCheckTypeStringNotEmpty( data[fieldData] ) ){

                $returnField = $('<div/>').attr(models.field.item.attr);
                if( !field.visible ){
                    // fieldClass += models.hideClass;
                    $returnField.addClass(models.hideClass);
                }
                var renderData = data[fieldData];
                if(typeof field.render === typeof function () {}){
                    renderData = field.render(data[fieldData], field.type, settings);
                }
                var $fieldLabel = $('<div/>').attr(models.field.item.label.attr).text(fieldLabel);
                var $fieldDisplay = $('<div/>').attr(models.field.item.display.attr).text(renderData);
                var $fieldValue = $('<div/>').attr(models.field.item.value.attr).text(data[fieldData])
                    .attr(models.dataEditorFieldAttr, dataSrc)
                ;
                $returnField
                    .append($fieldLabel)
                    .append($fieldDisplay)
                    .append($fieldValue)
                ;
            }
            return $returnField;

        },

        _getEditorField : function (settings) {
            var returnFields = [];
            var fields = GalleryFn.field._getGalleryField(settings);
            returnFields = returnFields.concat(fields);

            var fieldsMulti = GalleryFn.field._getGalleryFieldMulti(settings);
            returnFields = returnFields.concat(fieldsMulti);


            if(GalleryFn.field.debug || true){
                console.log({
                    0 : "_getEditorField() called",
                    settings : settings,
                    returnFields : returnFields
                });
            }

            return returnFields;
        },

        _getGalleryField : function (settings) {
            var returnFields = [];
            var
                arrayFields = settings.hasOwnProperty(indexes.fields) ?  settings[indexes.fields] : [],
                dataSrc = settings.hasOwnProperty(indexes.dataSrc) ?  settings[indexes.dataSrc] : ""
            ;
            $.each(arrayFields, function (index, element) {
                var field = $.extend(true, {}, element);
                field.data = dataSrc + "." + element.name;
                field.name = dataSrc + "." + element.name;
                returnFields.push(field);
            });
            console.log("_getGalleryField() called", { returnFields : returnFields });

            return returnFields;
        },

        _getGalleryFieldMulti : function (settings) {
            var returnFields = [];
            var
                multiField = settings.hasOwnProperty(indexes.multiFields) ?  settings[indexes.multiFields] : {},
                dataSrc = multiField.hasOwnProperty(indexes.dataSrc) ?  multiField[indexes.dataSrc] : "",
                multiItemSrc = multiField.hasOwnProperty(indexes.itemSrc) ?  multiField["itemSrc"] : [],
                arrayMultiFields = multiField.hasOwnProperty("fields") ?  multiField["fields"] : []
            ;
            $.each(multiItemSrc, function (index, itemSrc) {
                $.each(arrayMultiFields, function (multiFieldIndex, element) {
                    var field = $.extend(true, {}, element);

                    var multiDataSrc = typeof dataSrc === typeof "" && dataSrc !== "" ? dataSrc+ '.' : "";

                    var src = typeof itemSrc === typeof "" && itemSrc !== "" ? itemSrc+ '.' : "";

                    field.data = multiDataSrc + field.name;
                    field.name = multiDataSrc + src + field.name;
                    field.data = field.name;
                    returnFields.push(field);
                });
            });
            return returnFields;

        },

        _getFieldRender : function (type, options) {
            return _Column._getColumnRender(type, options);
        }

    };



    /**
     * Gallery functions editor
     */

    GalleryFn.editor = {
        sortable : function (jquerySelector) {
            if (jQuery.ui){

                /**
                 *make jquerySelector sortable
                 */
                $(jquerySelector).sortable();
            }
        }
    };

    /**
     * Gallery options
     */

    var GalleryDefaults = $.fn.Gallery.defaults = {
        options : {},
        field : {},
        multiField : {},
        buttons : {},
        template : "",
        events : {}
    };

    GalleryDefaults.options = {
        ajax : "/_api/gallery/",
        dataSrc : "",
        idSrc : "",
        template : "#"+models.editor.template.attr.id,
        columnDisplay : 3,
        pageLength : 25,
        lengthMenu : [ 25, 50, 100, -1],
        fields : [],
        filter : true,
        multiField : [],
        select : true,
        sortable : true,
        controlPanel : '.'+models.control.controlPanelContainer.attr.class,
        buttons : [
            "create",
            "edit" ,
            "remove",
            "select-none",
            "select-all"
        ],
        language : _Table._language.def,
        edit : true,
        create : true,
        remove : true,
        fixedControl : {
            offSet: 52
        }
    };

    GalleryDefaults.options.event = {
        onStart : function (settings) {
            if(_Gallery.debug){
                console.log("Gallery onStart() called", {
                    settings :settings
                });
            }
        },
        started : function () {
            if(_Gallery.debug){
                console.log("Gallery started() called");
            }
        },
        initLoad : function () {
            if(_Gallery.debug){
                console.log("Gallery initLoad() called");
            }
        },
        preLoad : function () {
            if(_Gallery.debug){
                console.log("Gallery preLoad() called");
            }
        },
        onLoad : function (settings) {
            if(_Gallery.debug){
                console.log("Gallery onLoad() called", {settings : settings});
            }
        },
        postLoad : function () {
            if(_Gallery.debug){
                console.log("Gallery postLoad() called");
            }
        },
        initDraw : function () {
            if(_Gallery.debug){
                console.log("Gallery initDraw() called");
            }
        },
        preDraw : function () {
            if(_Gallery.debug){
                console.log("Gallery preDraw() called");
            }
        },
        onDraw : function () {
            if(_Gallery.debug){
                console.log("Gallery onDraw() called");
            }
        },
        postDraw : function () {
            if(_Gallery.debug){
                console.log("Gallery postDraw() called");
            }
        }
    };

    GalleryDefaults.multiField.options = {
        dataSrc : "",
        idSrc : "",
        titleSrc : "",
        itemSrc : [],
        fields : []
    };

    GalleryDefaults.multiField.itemSrc = {
        name : ""
    };

    /**
     * content editor settings
     */
    GalleryDefaults.field.options = {
        className : "",
        name : "",
        id : "",
        label : "",
        type : "text",
        visible : true,
        searchable : true,
        orderable : true,
        create : true,
        edit : true,
        options : {

        }
    };

    /**
     * content editor settings
     */
    GalleryDefaults.buttons.options  = {
        className : "",
        icon : "",
        action : function(event, Gallery, node, config){}
    };





    $.fn.Gallery.Editor = function (settings) {
        /**
         * merge settings with default options
         */
        // var thisSettings = this.settings =  $.extend(true, $.fn.Gallery.Editor.defaults, settings);
        //TODO



    };


    var GalleryEditor = $.fn.Gallery.Editor;

    var CardEditorFn = GalleryEditor.functions = {

    };
    CardEditorFn.listener = {
        preSumbit : function (Gallery, editor) {
            editor.on( _Editor._event.preSubmit, function ( e, data, action ) {
                console.log({
                    data : data,
                    action : action
                })
            } );
        }
    };

    CardEditorFn.init = function (Gallery, editor) {
        var allListener = CardEditorFn.listener;

        $.each(allListener, function (index, listener) {
            if(typeof listener === typeof  function () {}){
                listener(Gallery, editor);
            }
        });

    };


    /**
     * content editor settings
     */
    var CardEditorDefault = $.fn.Gallery.Editor.defaults = {
        debug : false,
        showItem : 50,
        template : ""
    };

    /**
     * content editor settings
     */
    CardEditorDefault.options = {
        debug : false,
        showItem : 50,
        template : ""
    };






}( jQuery, _DataTable, _Translation, _Editor, _Field ));



