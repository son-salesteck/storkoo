(function ($) {

    var _apiSrc = '/_api/';

    var BookingApp = $.fn.bookingApp = function (settings) {
        
    };

    BookingApp.defaults = {
        debug: true,
        options: {},
        field: {},
        promotion : {}
    };

    BookingApp.defaults.options = {
        ajax: _apiSrc,
        dataSrc: 'booking'
    };

    BookingApp.event = {
        init: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('init(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        preInit: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('preInit(bookingApp) called', {bookingApp: bookingApp});
            }
        },
        onInit: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('onInit(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        postInit: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('postInit(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        initDraw: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('initDraw(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        preDraw: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('preDraw(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        onDraw: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('onDraw(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        postDraw: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('postDraw(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        initAddProduct: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('initAddProduct(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        preAddProduct: function (bookingApp, product) {
            if (BookingApp.defaults.debug) {
                console.log('preAddProduct(bookingApp, product) called', {bookingApp: bookingApp, product: product});
            }

        },
        onAddProduct: function (bookingApp, product) {
            if (BookingApp.defaults.debug) {
                console.log('onAddProduct(bookingApp, product) called', {bookingApp: bookingApp, product: product});
            }

        },
        postAddProduct: function (bookingApp, product) {
            if (BookingApp.defaults.debug) {
                console.log('postAddProduct(bookingApp, product) called', {bookingApp: bookingApp, product: product});
            }

        },
        initRemoveProduct: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('initRemoveProduct(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        preRemoveProduct: function (bookingApp, product) {
            if (BookingApp.defaults.debug) {
                console.log('preRemoveProduct(bookingApp, product) called', {bookingApp: bookingApp, product: product});
            }

        },
        onRemoveProduct: function (bookingApp, product) {
            if (BookingApp.defaults.debug) {
                console.log('onRemoveProduct(bookingApp, product) called', {bookingApp: bookingApp, product: product});
            }

        },
        postRemoveProduct: function (bookingApp, product) {
            if (BookingApp.defaults.debug) {
                console.log('postRemoveProduct(bookingApp, product) called', {bookingApp: bookingApp, product: product});
            }

        },
        onUpdateCart: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('onUpdateCart(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        postUpdateCart: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('postUpdateCart(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        initEmptyProduct: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('initEmptyProduct(bookingApp) called', {bookingApp: bookingApp});
            }

        },
        preEmptyProduct: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('preEmptyProduct(bookingApp, product) called', {bookingApp: bookingApp});
            }

        },
        onEmptyProduct: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('onEmptyProduct(bookingApp, product) called', {bookingApp: bookingApp});
            }

        },
        postEmptyProduct: function (bookingApp) {
            if (BookingApp.defaults.debug) {
                console.log('postEmptyProduct(bookingApp, product) called', {bookingApp: bookingApp});
            }

        }

    };
    
    
}(jQuery));