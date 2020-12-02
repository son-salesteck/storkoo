(function ($) {

    var
        apiUrl = "/_api/_search/",
        MerchantFn = {debug : true},
        lang = Fn._getLang(),
        minSearchLength = 2,
        maxItem  = 10,
        $searchBarResult = $(".search-bar-result"),
        $searchBarInput = $("#searchMerchantInput"),
        $postCodeSelect = $("#postCodeSelect"),
        $categorySelect = $("#categorySelect")
    ;

    if(!$.fn.select2) {
        BootstrapNotify.danger("", "Select2 missing");
    }

    MerchantFn.getMerchantPromise = function (dataSend) {
        dataSend.lang = lang;
        return $.post(apiUrl, dataSend);
    };

    var searchFn  = MerchantFn.search = {};

    searchFn.listener = function () {
        var $searchInput = $searchBarInput;
        if($searchInput.length){
            if (MerchantFn.debug){console.log({
                $searchInput : $searchInput
            })}
            $searchInput.unbind('keyup').bind('keyup', function (e) {
                var searchValue = $(this).val();
                if(searchValue.length >= minSearchLength){
                    var dataSend = {
                        _q : 'search',
                        searchValue : searchValue
                    };
                    MerchantFn.getMerchantPromise(dataSend).done(function (data) {
                        var response = JSON.parse(data);
                        if (MerchantFn.debug) {console.log("MerchantFn.getMerchantPromise.done()", response)}
                    });
                }


            });
        }

    };

    MerchantFn._functions = function () {
        searchFn.listener();
    };

    // MerchantFn._functions();



    var SearchBar = $.fn.searchBar = $.fn.SearchBar = function SearchBar(options) {

        var settings = SearchBar.fn._mergeSetting(options);

        var that = this;

        that.settings = settings;

        that.jQuerySelector = this[0];

        if (SearchBar.debug) {console.log("$.fn.searchBar() called", {
            options: options,
            searchBar: that
        })}

        S_API.start(that, settings);

    };




    SearchBar.debug = true;

    SearchBar.default = {
        maxItem  : maxItem,
        template : '',
        searchInput : $searchBarInput
    };

    SearchBar.fn = {
        _mergeSetting: function (settings) {
            return $.extend(true, {}, SearchBar.default, settings);
        },
        _dataToElement : function (searchBar, _settings, data) {
            if (SearchBar.debug) {console.log('SearchBar.fn._dataToElement(searchBar) called', {
                searchBar: searchBar, _settings : _settings, data : data
            })}
            return $('<a/>').addClass('result-item').text(data.displayText).attr({
                href : data.shopPage
                // , target : "_blank"
            });

        },
        category : {
            _loadCategory : function (settings) {
                if($categorySelect.length){

                }
            }
        }
    };



    var S_API = SearchBar.api = {
        start : function (searchBar, _settings) {
            var lastSearchValue = "";
            if (SearchBar.debug) {console.log("S_API.start(searchBar, _settings)", {arguments : arguments})}
            var $searchInput = _settings.searchInput;
            if($searchInput.length){
                if (SearchBar.debug){console.log({
                    $searchInput : $searchInput
                })}
                $(".search-bar")
                    .on('focusin', function (e) {
                        searchBar.addClass('active');
                    })
                    .on('focusout', function (e) {
                        setTimeout(function () {

                            searchBar.removeClass('active');
                        },300)
                    })
                ;
                $searchInput.unbind('keyup').bind('keyup', function (e) {
                    var search = $(this).val();
                    if(search.length >= minSearchLength && lastSearchValue !== search){
                        if (SearchBar.debug) {console.log("keyup", {search : search})}
                        var dataSend = {
                            _q : 'search',
                            search : search
                        };
                        MerchantFn.getMerchantPromise(dataSend).done(function (data) {
                            var response = JSON.parse(data);
                            if (SearchBar.debug) {console.log("MerchantFn.getMerchantPromise.done()", response)}
                            S_API.draw(searchBar, _settings, response.data);
                        });
                    }else {
                        S_API.clear(searchBar, _settings);
                    }
                    lastSearchValue = search;
                });
            }
        },
        stop : function (searchBar, _settings) {
            if (SearchBar.debug) {console.log("S_API.stop(searchBar, _settings)", {arguments : arguments})}

        },
        draw : function (searchBar, _settings, elements) {
            if (SearchBar.debug) {console.log("S_API.draw(searchBar, _settings)", {arguments : arguments})}
            if(searchBar.length && Fn._isSameType(elements, [])){
                S_API.clear(searchBar, _settings);
                $.each(elements, function (index, data) {
                    var $render  = SearchBar.fn._dataToElement(searchBar, _settings, data);
                    if(index < _settings.maxItem ){
                        searchBar.append($render);
                    }
                })
            }

            
        },
        clear : function (searchBar, _settings) {
            if (SearchBar.debug) {console.log("S_API.clear(searchBar, _settings)", {arguments : arguments})}
            if(searchBar.length){
                searchBar.empty();
            }
        },
        add : function (searchBar, _settings, element) {
            if (SearchBar.debug) {console.log("S_API.add(searchBar, _settings)", {arguments : arguments})}

        },
        remove : function (searchBar, _settings, element) {
            if (SearchBar.debug) {console.log("S_API.remove(searchBar, _settings)", {arguments : arguments})}

        },
        update : function (searchBar, _settings, element) {
            if (SearchBar.debug) {console.log("S_API.update(searchBar, _settings)", {arguments : arguments})}

        }
    };

    SearchBar.event = {
        preInit: function (searchBar) {
            if (SearchBar.debug) {console.log('preInit(searchBar) called', {searchBar: searchBar});}
        },
        onInit: function (searchBar) {
            if (SearchBar.debug) {
                console.log('onInit(searchBar) called', {searchBar: searchBar});
            }

        },
        init: function (searchBar) {
            if (SearchBar.debug) {
                console.log('init(searchBar) called', {searchBar: searchBar});
            }

        },
        postInit: function (searchBar) {
            if (SearchBar.debug) {
                console.log('postInit(searchBar) called', {searchBar: searchBar});
            }
        },

        preDraw: function (searchBar) {
            if (SearchBar.debug) {
                console.log('preDraw(searchBar) called', {searchBar: searchBar});
            }

        },
        onDraw: function (searchBar) {
            if (SearchBar.debug) {
                console.log('onDraw(searchBar) called', {searchBar: searchBar});
            }

        },
        draw: function (searchBar) {
            if (SearchBar.debug) {
                console.log('draw(searchBar) called', {searchBar: searchBar});
            }

        },
        postDraw: function (searchBar) {
            if (SearchBar.debug) {
                console.log('postDraw(searchBar) called', {searchBar: searchBar});
            }

        }
    };


    var $searchBar = $searchBarResult.searchBar({});



})(jQuery);