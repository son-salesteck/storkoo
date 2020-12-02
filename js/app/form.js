(function ($) {

    var lang = Fn._getLang();
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/;
    var phoneRegex = /^(0)/;
    var
        apiUrl = "/_api/",
        customerApiUrl = apiUrl+"_customer/",
        merchantApiUrl = apiUrl+"_merchant/"
    ;
    var Session = {
        Debug: false,
        url : "/_api/_cutomer/",
        intervalMilliSec : 10000,
        logoutButtonId : "#signout-submit"
    };

    Session._logoutListener = function ($btn, ajaxUrl, intervalMilliSec) {
        if($btn.length > 0){
            $btn
                .unbind('click')
                .bind('click',function () {
                    Animation._animateLoaderBtn($btn, true);
                    $.post( ajaxUrl, {_q : "logout"}).then(function( data ) {
                        var obj = JSON.parse(data);
                        var status = Fn._getObjByProp(obj, "status", false);
                        var message = Fn._getObjByProp(obj, "message", "");
                        if(status){
                            window.location.reload();
                        }else {
                            BootstrapNotify.info("", message);
                        }
                        Animation._animateLoaderBtn($btn, false);
                    });
                })
            ;

            setInterval(function () {
                $.post( ajaxUrl, {_q : "session"})
                    .then(function( data ) {
                        var obj = JSON.parse(data);
                        var status = Fn._getObjByProp(obj, "status", true);
                        var message = Fn._getObjByProp(obj, "message", "");
                        if(status === false){
                            if(Fn._isStringNotEmpty(message)){
                                BootstrapNotify.info("",message );
                            }
                            setTimeout(function () {
                                window.location.reload();
                            }, (intervalMilliSec/2));
                        }
                    })
                ;

            }, intervalMilliSec);
        }
    };

    $.fn.autoResize = function(options) {

        // Just some abstracted details,
        // to make plugin users happy:
        var settings = $.extend({
            onResize : function(){},
            animate : true,
            animateDuration : 150,
            animateCallback : function(){},
            extraSpace : 20,
            limit: 1000
        }, options);

        // Only textarea's auto-resize:
        this.filter('textarea').each(function(){

            // Get rid of scrollbars and disable WebKit resizing:
            var textarea = $(this).css({resize:'none','overflow-y':'hidden'}),

                // Cache original height, for use later:
                origHeight = textarea.height(),

                // Need clone of textarea, hidden off screen:
                clone = (function(){

                    // Properties which may effect space taken up by chracters:
                    var props = ['height','width','lineHeight','textDecoration','letterSpacing'],
                        propOb = {};

                    // Create object of styles to apply:
                    $.each(props, function(i, prop){
                        propOb[prop] = textarea.css(prop);
                    });

                    // Clone the actual textarea removing unique properties
                    // and insert before original textarea:
                    return textarea.clone().removeAttr('id').removeAttr('name').css({
                        position: 'absolute',
                        top: 0,
                        left: -9999
                    }).css(propOb).attr('tabIndex','-1').insertBefore(textarea);

                })(),
                lastScrollTop = null,
                updateSize = function() {

                    // Prepare the clone:
                    clone.height(0).val($(this).val()).scrollTop(10000);

                    // Find the height of text:
                    var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
                        toChange = $(this).add(clone);

                    // Don't do anything if scrollTip hasen't changed:
                    if (lastScrollTop === scrollTop) { return; }
                    lastScrollTop = scrollTop;

                    // Check for limit:
                    if ( scrollTop >= settings.limit ) {
                        $(this).css('overflow-y','');
                        return;
                    }
                    // Fire off callback:
                    settings.onResize.call(this);

                    // Either animate or directly apply height:
                    settings.animate && textarea.css('display') === 'block' ?
                        toChange.stop().animate({height:scrollTop}, settings.animateDuration, settings.animateCallback)
                        : toChange.height(scrollTop);
                };

            // Bind namespaced handlers to appropriate events:
            textarea
                .unbind('.dynSiz')
                .bind('keyup.dynSiz', updateSize)
                .bind('keydown.dynSiz', updateSize)
                .bind('change.dynSiz', updateSize);

        });

        // Chain:
        return this;

    };

    $.validator.addMethod(
        "regex",
        function(value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        "Verifiez votre mot de passe."
    );

    $.validator.addMethod(
        "length",
        function(value, element, length) {
            return value.length === length;
        },
        "Doit contenir {0} caractère(s)."
    );

    $.validator.addMethod(
        "phoneNumber",
        function(value, element) {
            var re = new RegExp(phoneRegex);
            return this.optional(element) || re.test(value);
        },
        "Le numero doit commencer par 0."
    );



    var rules = {
        required : {
            required : true
        },
        name : {
            required : true,
            minlength: 3
        },
        email : function (ajaxUrl, _q) {
            var obj = {
                required: true,
                email: true
            };
            if(Fn._isStringNotEmpty(ajaxUrl) && Fn._isStringNotEmpty(_q)){
                obj.remote = {
                    url: ajaxUrl,
                    type: "post",
                    data: {
                        _q: _q,
                        lang : lang
                    }
                };
            }
            return obj;
        },
        phoneMobile: {
            required: true,
            digits: true,
            phoneNumber : true,
            minlength: 9
        },
        phoneFix: {
            required: true,
            digits: true,
            phoneNumber : true,
            minlength: 8
        },
        phone: {
            required: true,
            digits: true,
            phoneNumber : true,
            minlength: 8,
            maxlength: 10
        },
        password : function (regex) {
            var obj = {
                required: true
            };
            if(regex !== false){
                obj.regex = passwordRegex;
            }
            return obj;
        },
        postCode : {
            required : true,
            digits : true,
            minlength: 3
        },
        address : {
            required : true,
            minlength: 10
        },
        passwordConfirm : function (passwordInputId) {
            return {
                required: true,
                equalTo: passwordInputId
            }
        },
        _errorPlacement : function (error, element) {
            element.parent().append(error);
        },
        validClass: 'is-valid',
        invalidClass: 'is-invalid'
    };


    var Form = {
        _reset : function ($form) {
            if($form.length){
                $form.trigger("reset");
            }
        }
    };




    Form.contact = {
        debug : false,
        _getModal : function () {
            return $('#modal-contact');
        },
        _getForm: function() {
            return $('#contact');
        },
        _getSubmitBtn: function() {
            return $("#contact-submit");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.contact._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }
    };
    Form.contact._functions = function () {
        var $form = Form.contact._getForm();
        if($form.length){
            var $btn = Form.contact._getSubmitBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $form.submit();
                })
            ;
            if(Form.contact.debug){console.log("Form.contact._functions()", {
                $form : $form,
                $btn : $btn
            })}

            $form.validate({
                errorClass: rules.invalidClass,
                validClass: rules.validClass,
                errorElement: "div",
                focusInvalid: false,
                rules: {
                    name : rules.name,
                    email: rules.email,
                    phone: rules.phone,
                    subject: rules.required,
                    message: rules.required
                },
                errorPlacement: rules._errorPlacement,
                invalidHandler: function (elem, validator) {
                    // $('html, body').stop(true, false).animate({
                    //     scrollTop: $(validator.errorList[0].element).offset().top - 200
                    // }, 1500, 'easeInOutExpo');
                },
                submitHandler: function(form) {
                    Form.contact._animateBtn(true);
                    var serialize = $(form).serializeArray();
                    var dataSend = {
                        _q : 'contact',
                        form : serialize,
                        lang : lang
                    };

                    if(Form.contact.debug){console.log("Form.contact.submitHandler()", dataSend)}

                    $.post(apiUrl, dataSend).done(function (data) {
                        if(Form.contact.debug){console.log("Form.contact.post.done()", {data : data})}
                        var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
                        var response = JSON.parse(data);
                        var success = Fn._getObjByProp(response, 'success', false);
                        message = Fn._getObjByProp(response, 'message', message);
                        if(success){
                            BootstrapNotify.success('', message);
                            var $modal = Form.contact._getModal();
                            Form._reset($form);
                            $('.'+rules.validClass, $form).removeClass(rules.validClass);
                            $('.'+rules.invalidClass, $form).removeClass(rules.invalidClass);
                            $modal.modal('hide');

                        }else {
                            BootstrapNotify.danger('', message);
                        }
                        Form.contact._animateBtn(false);
                    });
                }
            });
        }

    };


    Form.signin = {
        debug : false,
        _getModal : function () {
            return $('#modal-signin');
        },
        _getForm: function() {
            return $('#signin');
        },
        _getSubmitBtn: function() {
            return $("#signin-submit");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.signin._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }
    };
    Form.signin._functions = function () {
        var $form = Form.signin._getForm();
        if($form.length){
            var $btn = Form.signin._getSubmitBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $form.submit();
                })
            ;
            if (Form.signin.debug) {console.log("Form.signin._functions", {
                $form : $form,
                $btn : $btn
            })}
            $form.validate({
                errorClass: rules.invalidClass,
                validClass: rules.validClass,
                errorElement: "div",
                focusInvalid: false,
                rules: {
                    email : rules.email(customerApiUrl, "check-email-signin"),
                    password : rules.password(false)
                },
                errorPlacement: rules._errorPlacement,
                invalidHandler: function (elem, validator) {
                    // $('html, body').stop(true, false).animate({
                    //     scrollTop: $(validator.errorList[0].element).offset().top - 200
                    // }, 1500, 'easeInOutExpo');
                },
                submitHandler: function(form) {
                    Form.signin._animateBtn(true);
                    var serialize = $(form).serializeArray();
                    var dataSend = {
                        _q : 'signin',
                        form : serialize,
                        lang : lang
                    };
                    if (Form.signin.debug) {console.log("Form.signin.submitHandler", {
                        dataSend : dataSend
                    })}

                    $.post(customerApiUrl, dataSend).done(function (data) {
                        if (Form.signin.debug) {console.log("Form.signin.post", {
                            data : data
                        })}
                        var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
                        var response = JSON.parse(data);
                        var success = Fn._getObjByProp(response, 'status', false);
                        message = Fn._getObjByProp(response, 'message', message);
                        if(success){
                            location.reload();
                        }else {
                            BootstrapNotify.danger('', message);
                            Form.signin._animateBtn(false);
                            // $form.trigger("reset");
                        }
                        $('.'+rules.validClass, $form).removeClass(rules.validClass);
                        $('.'+rules.invalidClass, $form).removeClass(rules.invalidClass);
                    });
                }
            });
        }

    //TODO session timeout function


    };



    Form.signup = {
        debug : false,
        _getModal : function () {
            return $('#modal-signup');
        },
        _getForm: function() {
            return $('#signup');
        },
        _getSubmitBtn: function() {
            return $("#signup-submit");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.signup._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }
    };
    Form.signup._functions = function () {
        var $form = Form.signup._getForm();
        if($form.length) {
            var $btn = Form.signup._getSubmitBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $form.submit();
                })
            ;
            if (Form.signup.debug) {
                console.log("Form.signup._functions()", {
                    $form: $form,
                    $btn: $btn
                })
            }
            $form.validate({
                errorClass: rules.invalidClass,
                validClass: rules.validClass,
                errorElement: "div",
                focusInvalid: false,
                rules: {
                    name: rules.name,
                    phone: rules.phone,
                    lastName: rules.name,
                    email: rules.email(customerApiUrl, "check-email-signup"),
                    password: rules.password(true),
                    passwordConfirm: rules.passwordConfirm("#signupPassword")
                },
                errorPlacement: rules._errorPlacement,
                invalidHandler: function (elem, validator) {
                    // $('html, body').stop(true, false).animate({
                    //     scrollTop: $(validator.errorList[0].element).offset().top - 200
                    // }, 1500, 'easeInOutExpo');
                },
                submitHandler: function (form) {
                    Form.signup._animateBtn(true);
                    var serialize = $(form).serializeArray();

                    var dataSend = {
                        _q: 'signup',
                        form: serialize,
                        lang : lang
                    };
                    if (Form.signup.debug) {
                        console.log("Form.signup.submitHandler()", dataSend)
                    }

                    $.post(customerApiUrl, dataSend).done(function (data) {
                        var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
                        var response = JSON.parse(data);
                        var success = Fn._getObjByProp(response, 'success', false);
                        message = Fn._getObjByProp(response, 'message', message);
                        if (success) {
                            var $modal = Form.contact._getModal();
                            $modal.modal('hide');
                            BootstrapNotify.success('', message);

                        } else {
                            BootstrapNotify.danger('', message);
                        }
                        if (Form.signup.debug) {
                            console.log("Form.signup.post()", response)
                        }
                        Form.signup._animateBtn(false);
                        Form._reset($form);
                        $('.'+rules.validClass, $form).removeClass(rules.validClass);
                        $('.'+rules.invalidClass, $form).removeClass(rules.invalidClass);
                    });
                }
            });
        }
    };


    Form.signout = {
        debug : false,
        _getSubmitBtn: function() {
            return $("#signout-submit");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.signup._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }

    };
    Form.signout._functions = function () {
        var $btn = Form.signout._getSubmitBtn();
        Session._logoutListener($btn, customerApiUrl, Session.intervalMilliSec);
        // if($btn.length){
        //     $btn
        //         .unbind('click')
        //         .bind('click', function (event) {
        //             if (Form.signup.debug) {console.log("Form.signout._functions()")}
        //             event.preventDefault();
        //             event.stopPropagation();
        //             Form.signup._animateBtn(true);
        //             var dataSend = {
        //                 _q: 'signout',
        //                 lang : lang
        //             };
        //             $.post(customerApiUrl, dataSend).done(function (data) {
        //                 if (Form.signup.debug) {console.log("Form.signout.post()", {data : data})}
        //                 var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
        //
        //                 var response = JSON.parse(data);
        //                 var success = Fn._getObjByProp(response, 'success', false);
        //                 if (success) {
        //                     location.reload();
        //                 } else {
        //                     BootstrapNotify.danger('', message);
        //                 }
        //             });
        //         })
        //     ;
        // }
    };


    Form.passwordRecovery = {
        debug : false,
        _getModal : function () {
            return $('#modal-recovery');
        },
        _getForm: function() {
            return $('#password-recovery');
        },
        _getSubmitBtn: function() {
            return $("#recovery-submit");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.passwordRecovery._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }
    };
    Form.passwordRecovery._functions = function () {
        var $form = Form.passwordRecovery._getForm();
        if($form.length) {
            var $btn = Form.passwordRecovery._getSubmitBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $form.submit();
                })
            ;
            if (Form.passwordRecovery.debug) {
                console.log("Form.signup._functions()", {
                    $form: $form,
                    $btn: $btn
                })
            }
            $form.validate({
                errorClass: rules.invalidClass,
                validClass: rules.validClass,
                errorElement: "div",
                focusInvalid: false,
                rules: {
                    email: rules.email(customerApiUrl, "check-email-signin")
                },
                errorPlacement: rules._errorPlacement,
                submitHandler: function (form) {
                    Form.passwordRecovery._animateBtn(true);
                    var serialize = $(form).serializeArray();
                    var dataSend = {
                        _q: 'recovery',
                        form: serialize,
                        lang : lang,
                        _operation : 'recovery'
                    };
                    if (Form.passwordRecovery.debug) {
                        console.log("Form.passwordRecovery.submitHandler()", dataSend)
                    }

                    $.post(customerApiUrl, dataSend).done(function (data) {
                        var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
                        var response = JSON.parse(data);
                        var success = Fn._getObjByProp(response, 'status', false);
                        message = Fn._getObjByProp(response, 'message', message);
                        if (success) {
                            var $modal = Form.passwordRecovery._getModal();
                            $modal.modal('hide');
                            BootstrapNotify.success('', message);

                        } else {
                            BootstrapNotify.danger('', message);
                        }
                        if (Form.passwordRecovery.debug) {
                            console.log("Form.passwordRecovery.post()", response)
                        }
                        Form.passwordRecovery._animateBtn(false);
                        Form._reset($form);
                        $('.'+rules.validClass, $form).removeClass(rules.validClass);
                        $('.'+rules.invalidClass, $form).removeClass(rules.invalidClass);
                    });
                }
            });
        }
    };


    Form.customerEdit = {
        debug : false,
        _getForm: function() {
            return $('#edit-customer');
        },
        _getSubmitBtn: function() {
            return $("#edit-customer-submit");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.customerEdit._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }
    };
    Form.customerEdit._functions = function () {
        var $form = Form.customerEdit._getForm();
        if($form.length) {
            var $btn = Form.customerEdit._getSubmitBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $form.submit();
                })
            ;
            if (Form.customerEdit.debug) {
                console.log("Form.signup._functions()", {
                    $form: $form,
                    $btn: $btn
                })
            }
            $form.validate({
                // errorClass: rules.invalidClass,
                // validClass: rules.validClass,
                errorElement: "div",
                focusInvalid: false,
                rules: {
                },
                errorPlacement: rules._errorPlacement,
                submitHandler: function (form) {
                    Form.customerEdit._animateBtn(true);
                    var serialize = $(form).serializeArray();
                    var dataSend = {
                        _q: 'edit',
                        form: serialize,
                        lang : lang
                    };
                    if (Form.customerEdit.debug) {
                        console.log("Form.passwordRecovery.submitHandler()", dataSend)
                    }

                    $.post(customerApiUrl, dataSend).done(function (data) {
                        var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
                        var response = JSON.parse(data);
                        var status = Fn._getObjByProp(response, 'status', false);
                        message = Fn._getObjByProp(response, 'message', message);
                        if (status) {
                            BootstrapNotify.success('', message);
                            location.reload();
                        } else {
                            BootstrapNotify.danger('', message);
                        }
                        if (Form.customerEdit.debug) {
                            console.log("Form.customerEdit.post()", response)
                        }
                        Form.customerEdit._animateBtn(false);
                        $('.'+rules.validClass, $form).removeClass(rules.validClass);
                        $('.'+rules.invalidClass, $form).removeClass(rules.invalidClass);
                    });
                }
            });
        }
    };




    Form.customerChangePassword = {
        debug : false,
        _getEmail : function () {
            return $('#recoveryEmail');
        },
        _getForm: function() {
            return $('#password-change');
        },
        _getSubmitBtn: function() {
            return $("#password-change-submit");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.customerChangePassword._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }
    };
    Form.customerChangePassword._functions = function () {
        var $form = Form.customerChangePassword._getForm();
        if($form.length) {
            var $btn = Form.customerChangePassword._getSubmitBtn();
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $form.submit();
                })
            ;
            if (Form.customerChangePassword.debug) {
                console.log("Form.signup._functions()", {
                    $form: $form,
                    $btn: $btn
                })
            }
            $form.validate({
                errorClass: rules.invalidClass,
                validClass: rules.validClass,
                errorElement: "div",
                focusInvalid: false,
                rules: {
                    email : rules.email(customerApiUrl, "check-email-signin"),
                    password: rules.password(true),
                    passwordConfirm: rules.passwordConfirm("#recoveryPassword")
                },
                errorPlacement: rules._errorPlacement,
                submitHandler: function (form) {
                    Form.customerChangePassword._animateBtn(true);
                    var serialize = $(form).serializeArray();
                    var dataSend = {
                        _q: 'recovery',
                        form: serialize,
                        lang : lang,
                        _operation : 'change'
                    };
                    if (Form.customerChangePassword.debug) {
                        console.log("Form.passwordRecovery.submitHandler()", dataSend)
                    }

                    $.post(customerApiUrl, dataSend).done(function (data) {
                        var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
                        var response = JSON.parse(data);
                        var status = Fn._getObjByProp(response, 'status', false);
                        message = Fn._getObjByProp(response, 'message', message);
                        if (status) {
                            BootstrapNotify.success('', message);
                        } else {
                            BootstrapNotify.danger('', message);
                        }
                        if (Form.customerChangePassword.debug) {
                            console.log("Form.customerChangePassword.post()", response)
                        }
                        Form.customerChangePassword._animateBtn(false);
                        Form._reset($form);
                        $('.'+rules.validClass, $form).removeClass(rules.validClass);
                        $('.'+rules.invalidClass, $form).removeClass(rules.invalidClass);
                    });
                }
            });
        }
    };



    Form.merchant = {
        debug : true,
        _getFormWizard: function() {
            return $("#merchant-wizard");
        },
        _getSubmitBtn: function() {
            return $("a[href='#finish']");
        },
        _animateBtn: function(animate) {
            var $submitBtn = Form.merchant._getSubmitBtn();
            Animation._animateLoaderBtn($submitBtn, animate);
        }
    };
    Form.merchant._functions = function () {
        var $wizard = Form.merchant._getFormWizard();
        $wizard.steps({
            headerTag: "h3",
            bodyTag: '.wizard-content',
            autoFocus: true,
            enableAllSteps: true,
            titleTemplate: '<span class="number">#index#</span><span class="title">#title#</span>',
            onStepChanging: function (event, currentIndex, newIndex) {
                // Always allow previous action even if the current form is not valid!
                if (currentIndex > newIndex) {
                    return true;
                }
                return $wizard.valid();
            },
            onStepChanged: function (event, currentIndex, priorIndex) {},
            onFinishing: function (event, currentIndex) {
                return $wizard.valid();
            },
            onFinished: function (event, currentIndex) {

                // var $form = Form.merchant._getFormWizard();
                if (Form.merchant.debug || true) {console.log("Form.merchant.onFinished()", $wizard)}
                if($wizard.length){

                    var serialize = $wizard.serializeArray();
                    var dataSend = {
                        _q : 'signup',
                        form : serialize,
                        lang : lang
                    };
                    if (Form.merchant.debug) {console.log(dataSend)}
                    Form.merchant._animateBtn(true);
                    $.post(merchantApiUrl, dataSend).done(function (data) {
                        if (Form.signup.debug) {console.log("Form.signout.post()", {data : data})}
                        var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";

                        var response = JSON.parse(data);
                        var success = Fn._getObjByProp(response, 'success', false);
                        message = Fn._getObjByProp(response, 'message', message);
                        if (success) {
                            BootstrapNotify.success('', message);
                            Form._reset($wizard);
                            $('.'+rules.validClass, $wizard).removeClass(rules.validClass);
                            $('.'+rules.invalidClass, $wizard).removeClass(rules.invalidClass);
                            $("#merchant-wizard-t-0").get(0).click();
                            // location.reload();
                        } else {
                            BootstrapNotify.danger('', message);
                        }
                        Form.merchant._animateBtn(false);
                    });
                }

            },
            labels: {
                cancel: "Cancel",
                current: "current step:",
                pagination: "Pagination",
                finish: "Confirmer",
                next: "suivant",
                previous: "précédent",
                loading: "Loading ..."
            }
        });
        //Validation
        $wizard.validate({
            errorClass: rules.invalidClass,
            validClass: rules.validClass,
            errorElement: "div",
            rules: {
                // Step 1 - Account information
                contactName: rules.name,
                contactLastName: rules.name,
                contactEmail : rules.email(merchantApiUrl, "email-check"),
                contactGender : rules.required,
                contactPhone: rules.phone,
                contactPassword: rules.password(true),
                contactPasswordConfirm: rules.passwordConfirm("#contactPassword"),
                // Step 2 - Merchant information
                companyName : rules.name,
                storeName : rules.name,
                storePhone : rules.phone,
                storeTaxId : {
                    required : true,
                    digits : true,
                    length: 10
                },
                storePostCode : rules.postCode,
                storeAddress : rules.address,
                // Step 3 - Confirmation
                terms_conditions: rules.required
            },

            errorPlacement: function (error, element) {
                $(element).parents(".form-group").append(error);
            }
        });
        $('.wizard').find(".actions ul > li > a").addClass("btn");
        // INSPIRO.elements.forms();

    };


    Form.postCode = {
        debug : true,
        _getElement : function () {
            return $("#merchant-wizard");
        },
        _functions : function () {

        }
    };



    Form._functions = function () {
        Form.contact._functions();
        Form.signin._functions();
        Form.signup._functions();
        Form.signout._functions();
        Form.passwordRecovery._functions();
        Form.customerChangePassword._functions();
        Form.customerEdit._functions();
        Form.merchant._functions();
        $('textarea').autoResize();
    };



    Form._functions();




}(jQuery));