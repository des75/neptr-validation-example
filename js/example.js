$(function(){

    var example_form1 = NeptrValidation.init({
        form: $('#exampleForm'),
        message_alignment: 'east',
        fields: {
            '#name': {
                rules: ['required', 'full_name'],
                messages: ['Введите имя', 'Введите полное имя']
            },
            '#email': {
                rules: ['required', 'is_email'],
                messages: ['Введите email адрес', 'Введите корректный email адрес']
            },
            '#gender': {
                rules: ['required', function(){
                    return this.val == 'male';
                }],
                messages: ['Выберите пол', 'Укажите свой настоящий пол']
            },
            '#about': {
                rules: 'minlength:30',
                messages: 'Минимальная длина сообщения 30 символов'                
            },
            '#opt1': {
                rules: 'required',
                messages: 'Этот чекбокс должен быть включен',
                message_alignment: 'west south',                // кастомные настройки тултипа для именно этого поля
                message_class_prefix: 'simple-bold-tooltip'
            },
            '#opt2': {
                rules: 'required',
                messages: 'Этот чекбокс должен быть включен'
            }
        },
        submit: function(){
            if(example_form1.validate()){
                $('#exampleForm').css('border', '1px solid #0f0');
                setTimeout(function(){
                    $('#exampleForm').css('border', 'none');                    
                },500);
            }
            return false;
        }
    });


    $('.tooltip-helper').each(function(){
        var tooltip_text = $(this).attr('data-tooltip');
        
        var tooltip = NeptrTooltip.bind({
            obj: $(this),
            class_prefix: 'simple-tooltip', // класс для кастомизации внешнего вида, см tooltip.scss
            alignment: 'north south east'
        });
        tooltip.update(tooltip_text); // обновляет сообщение тултипа, можно html

        $(this).hover(function(){
            tooltip.show();
        },function(){
            tooltip.hide();
        });
    });




}); 
