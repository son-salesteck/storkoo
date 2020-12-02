//Validation
jQuery(document).ready(function () {
    var form = $('.form-validate');
    form.each(function () {
        var elem = $(this);
        elem.validate({
            errorClass: 'is-invalid',
            validClass: 'is-valid',
            errorElement: "div",
            focusInvalid: false,
            rules: {
                email: {
                    required: true,
                    email: true
                },
                name: {
                    required: true,
                    minlength: 5,
                    maxlength: 15
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
                    tel : true,
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
                creditcard: {
                    required: true,
                    creditcard: true
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
            invalidHandler: function (elem, validator) {
                $('html, body').stop(true, false).animate({
                    scrollTop: $(validator.errorList[0].element).offset().top - 200
                }, 1500, 'easeInOutExpo');
            },
            submitHandler: function(form) {

            }
        });
    });
});