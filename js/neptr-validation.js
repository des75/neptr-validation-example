var NeptrValidation = (function(){
  var console=console||{"log":function(){}};

               var validators = {
                 required: function (){
                   if(typeof this.val == 'boolean') return this.val;

                   return !(this.val == '');
                 },
                 number: function(){
                   return !isNaN(parseFloat(this.val)) && isFinite(this.val) || this.val == '';
                 },
                 is_email: function (){
                   var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                   return re.test(this.val);
                 },
                 length: function (len){
                   return this.val.length == len;
                 },
                 minlength: function (len){
                   return this.val.length >= len;
                 },
                 maxlength: function (len){
                   return this.val.length <= len;
                 },
                 equal: function (val){
                   return this.val == val;
                 },
                 greater: function (val){
                   return this.val > val;
                 },
                 smaller: function (val){
                   return this.val < val;
                 },
                 same_as: function (id){
                   var field = $(id, form);
                   var is_checkbox = field.is(':checkbox');

                   if(is_checkbox)
                     return this.val == field.is(':checked');
                   else
                     return this.val == field.val();
                 },
                 full_name: function(){
                   var re = /^[^0-9`!@#\\$%\\^&*+_=]+ [^0-9`!@#\\$%\\^&*+_=]+$/;
                   return re.test(this.val);
                 },
                 is_url: function(){
                   var re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                   return re.test(this.val);
                 }
               };

               // defaults
               var validation_messages = {
                 required: 'This field is required',
                 email: 'Email must be valid',
                 length: '',
                 equal: '',
                 same_as: ''
               };

               function getRules(rules){
                 var rules_array = [];
                 var i;

                 function prepareRule(rule){
                   if($.isFunction(rule)){
                     return function(){
                       rule.apply(this);
                     }
                   }

                   var parameter;

                   if(rule.indexOf(':') != -1){
                     var rule_splitted = rule.split(':');
                     rule = rule_splitted[0];
                     parameter = rule_splitted[1];
                   }

                   return function(){
                     return validators[rule].apply(this, [parameter]);
                   }
                 }
                 if($.isArray(rules)){
                   for(i in rules){
                      if($.isFunction(rules[i])){
                        rules_array[i] = rules[i];
                      }
                      else{
                        rules_array[i] = prepareRule(rules[i]);
                      }
                   }
                 }
                 else if($.isFunction(rules)){
                   rules_array[0] = rules;
                 }
                 else {
                   rules_array[0] = prepareRule(rules);
                 }

                 return function(val){
                   var valid = true;
                   var errors = '';
                   var messages = this.messages || [];
                   var i = 0;

                   for(i in rules_array){
                     if(!rules_array[i].apply({val : val})){
                       if($.isArray(messages) && messages[i] && messages[i] != 'default'){
                         errors = messages[i];
                       }
                       else if(messages && messages != 'default'){
                         errors = messages;
                       }
                       else {
                         errors = validation_messages[r];
                       }

                       valid = false;

                       break;
                     }
                   }
                   return {
                     valid: valid,
                     message: errors
                   };
                 }
               }

               function getMessages(id, container, alignment, class_prefix){
                 return NeptrTooltip.bind({
                   obj: $(id, container),
                   class_prefix: class_prefix,
                   alignment: alignment
                 });
               }

               function init(config){
                 var form = config.form || document;
                 var fields = config.fields || {};
                 var rules = {};
                 var messages = {};
                 var validation_methods = {};
                 var default_message_alignment = config.message_alignment || 'nw ne sw se';
                 var default_class_prefix = config.message_class_prefix || 'error-tooltip';

                 for(var i in fields){
                   var k = i;
                   if(typeof config.fields[i]['element_replacement'] != 'undefined' && config.fields[i]['element_replacement'].apply({val:i})){
                     k = config.fields[i]['element_replacement'].apply({val:i});
                   }

                   var field = fields[i];
                   var alignment = field.message_alignment || default_message_alignment;
                   var class_prefix = field.message_class_prefix || default_class_prefix;

                   $(i).attr('data-neptr-id', i);
                   rules[i] = getRules(field.rules);
                   messages[i] = getMessages(k, form, alignment, class_prefix);
                 }


                 function hasFormValidation() {
                   return (typeof document.createElement( 'input' ).checkValidity == 'function');
                 }

                 function setValidityMessage(field, message){
                   var field_id = $(field).attr('data-neptr-id');

                   if(message == ''){
                     messages[field_id].hide();
                     $(field).removeClass('error');
                   }
                   else{
                     $(field).addClass('error');
                     messages[field_id].update(message);
                     messages[field_id].show();
                     messages[field_id].update_position();
                   }
                 }
                 function validate(){
                   var form_valid = true;
                   var is_checkbox = false;
                   var is_select = false;

                   function getValidationMethod(field_id){
                     var id = field_id;
                     return function() {
                       var field = $(this);
                       var is_checkbox = field.is(":checkbox");
                       if(is_checkbox){
                         var value = field.is(":checked");
                       }
                       else{
                         var value = field.val();
                       }

                       var validp = rules[id];
                       var validation = validp.apply(fields[id], [value]);

                       if(validation.valid){
                         setValidityMessage(this, "");
                         return true;
                       }
                       else{
                         setValidityMessage(this, validation.message);
                         return false;
                       }
                     }
                   }

                   for(i in fields){
                     var id = i;
                     var field = $(id, form);

                     if(field.is(':disabled')) continue;

                     is_checkbox = field.is(":checkbox");
                     is_select = field.is("select");

                     if(!validation_methods[id]){
                       validation_methods[id] = getValidationMethod(id);
                     }

                     var F = validation_methods[id];

                     if(is_checkbox || is_select){
                       field.unbind('change', F);
                       field.change(F);
                     }
                     else{
                       field.unbind('keyup', F);
                       field.keyup(F);
                     }

                     var field_valid = F.apply(field[0]);

                     if(form_valid) form_valid = field_valid;
                   }

                   return form_valid;
                 }

                 function unbind(id){
                   var field = $(id, form);
                   var F = validation_methods[id];
                   var is_checkbox = field.is(":checkbox");

                   if(is_checkbox){
                     field.unbind('change', F);
                   }
                   else{
                     field.unbind('keyup', F);
                   }
                   setValidityMessage(field, "");
                   messages[id].remove();

                   delete fields[id];
                   delete rules[id];
                   delete messages[id];
                   delete validation_methods[id];
                 }

                 function unbind_all(){
                   var i;
                   for(i in fields){
                     unbind(i);
                   }
                 }

                 function update_message_position(key){
                  if(typeof key != 'undefined' && typeof messages[key] != 'undefined'){
                    messages[key].update_position();
                  }
                  else{
                    for(i in messages){
                      messages[i].update_position();
                    }
                  }
                 }

                 function send(callback_cfg){
                   var callback_config = callback_cfg || {};
                   if($(form).is('form')){
                     var this_form = $(form);
                     $.ajax({
                       url: this_form.attr('action'),
                       type: 'POST',
                       data: this_form.serialize(),
                       beforeSend: function(){
                         if($.isFunction(callback_config.beforeSend)){
                           callback_config.beforeSend.apply(this_form);
                         }
                       },
                       complete: function(){
                         if($.isFunction(callback_config.complete)){
                           callback_config.complete.apply(this_form);
                         }
                       },
                       error: function(error){
                         if($.isFunction(callback_config.error)){
                           // callback_config.error.apply(this_form, [error]);

                           // ---------- testing -------
                           callback_config.error.apply(this_form, [error]);
                           // ---------- /testing ------
                         }
                       },
                       success: function(data, status){
                         if(data.success){
                           if($.isFunction(callback_config.success)){
                             callback_config.success.apply(this_form, [data, status]);
                           }
                           else if(typeof data.url == 'string' && data.url != ''){
                             window.location = data.url;
                           }
                         }
                         else{
                           if($.isFunction(callback_config.error)){
                             callback_config.error.apply(this_form, [data, null]);
                           }
                           console.log('[Neptr] Request has failed');
                         }
                       }
                     });
                   }
                   else{
                     console.log('-----------------------------------');
                     console.log(form);
                     console.log('[Neptr] Can not send: ^this element is not a form');
                   }
                 }

                 if($(form).is('form') && $.isFunction(config.submit)){
                   $(form).submit(config.submit);
                 }

                 return {
                   validate: validate,
                   unbind: unbind,
                   send: send,
                   unbind_all: unbind_all,
                   update_message_position: update_message_position
                 }
               }

               return {
                 init: init
               }
             })();