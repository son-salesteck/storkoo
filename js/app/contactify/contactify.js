
$(document).ready(function () {

    var $form = _getForm();
    var $btn = _getSubmitBtn();
    $btn
        .unbind('click')
        .bind('click', function (event) {

            event.preventDefault();
            event.stopPropagation();
            $form.submit();

        })
    ;
    $form.validate({
        errorClass: 'is-invalid',
        validClass: 'is-valid',
        errorElement: "div",
        focusInvalid: false,
        rules: {
            name : {
                required : true
            },
            email: {
                required: true,
                email: true
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
            message: {
                required: true,
                minlength: 5,
                maxlength: 1000
            },
            phone: {
                required: true,
                digits: true,
                minlength: 5,
                maxlength: 15
            }
        },
        errorPlacement: function (error, element) {
            element.parent().append(error);
        },
        invalidHandler: function (elem, validator) {
            $('html, body').stop(true, false).animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 200
            }, 1500, 'easeInOutExpo');
        },
        submitHandler: function(form) {
            _animateBtn(true);
            var serialize = $(form).serializeArray();
            var dataSend = {
                _q : 'contact',
                form : serialize
            };
            console.log(dataSend);

            $.post("/_api/", dataSend).done(function (data) {
                var message = "Une erreur est survenue, veuillez nous contacter par email ou téléphone!";
                var response = JSON.parse(data);
                var success = Fn._getObjByProp(response, 'success', false);
                message = Fn._getObjByProp(response, 'message', message);
                if(success){
                    BootstrapNotify.success('', message);

                }else {
                    BootstrapNotify.danger('', message);
                }
                console.log(response);
                _animateBtn(false);
                $form.trigger("reset");
            });
        }
    });

    function _getForm() {
        return $('#form-contact');
    }

    function _getSubmitBtn() {
        return $("#submit", _getForm());
    }

    function _animateBtn(animate) {
        var $submitBtn = _getSubmitBtn();
        Animation._animateLoaderBtn($submitBtn, animate);
    }
}) ;