var NeptrTooltip = (function(){
  var counter = 0;

  function bind(config){
    var obj = config.obj;
    var class_prefix = config.class_prefix || 'error';
    var class_alignment = '';
    var alignment = config.alignment || 'north';
    alignment = alignment.split(' ');

    var hidden = true;


    if(!obj.attr("data-neptr-tooltip") || obj.attr("data-neptr-tooltip") == ""){
      counter++;
      obj.attr("data-neptr-tooltip", counter);
    }
    else{
      return false;
    }



    var message = $('<div></div>').addClass('neptr-tooltip').addClass(getClass()).hide();

    obj.after(message);

    function getClass(){
      return class_prefix + ' ' + class_alignment;
    }

    function update_position(){
      if(hidden) return true;

      var W = $(window).width();
      var H = $(window).height();
      var ST = $(window).scrollTop();
      var SL = $(window).scrollLeft();

      var topOffset = (W >= 768 ? 66 : 0);

      var position = {};

      var checkbox_fix = 0;

      var getPosition = {
        west: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left')) - parseInt(message.outerWidth()) - 5),
            top: (obj.position().top + parseInt(obj.css('margin-top')) + (obj.outerHeight() - message.outerHeight())/2)
          }
        },
        north: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left')) + (parseInt(obj.outerWidth()) - parseInt(message.outerWidth()))/2 ),
            top: (obj.position().top + parseInt(obj.css('margin-top')) - parseInt(message.outerHeight()) - 5)
          }
        },
        nw: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left')) + parseInt(obj.outerWidth()) - parseInt(message.outerWidth())),
            top: (obj.position().top + parseInt(obj.css('margin-top')) - parseInt(message.outerHeight()) - 5)
          }
        },
        ne: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left'))),
            top: (obj.position().top + parseInt(obj.css('margin-top')) - parseInt(message.outerHeight()) - 5)
          }
        },
        east: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left')) + parseInt(obj.outerWidth()) + 5),
            top: (obj.position().top + parseInt(obj.css('margin-top')) + (obj.outerHeight() - message.outerHeight())/2)
          }
        },
        south: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left')) + (parseInt(obj.outerWidth()) - parseInt(message.outerWidth()))/2 ),
            top: (obj.position().top + parseInt(obj.css('margin-top')) + parseInt(obj.outerHeight()) + 5)
          }
        },
        se: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left'))),
            top: (obj.position().top + parseInt(obj.css('margin-top')) + parseInt(obj.outerHeight()) + 5)
          }
        },
        sw: function(){
          return {
            left: (obj.position().left + parseInt(obj.css('margin-left')) + parseInt(obj.outerWidth()) - parseInt(message.outerWidth())),
            top: (obj.position().top + parseInt(obj.css('margin-top')) + parseInt(obj.outerHeight()) + 5)
          }
        }
      }

      function checkAlignmentAvailability(al){
        var result = false;
        var tmp = true;

        switch(al){
          case 'west':
          result = (obj.offset().left - SL > (message.outerWidth() + 10) && obj.offset().top + ((obj.outerHeight() - message.outerHeight())/2) > ST + topOffset);
          break;
          case 'east':
          result = ((W - obj.outerWidth() - obj.offset().left) > (message.outerWidth() + 10) && obj.offset().top > ST + topOffset);
          break;

          case 'nw':
          result =  (obj.offset().top > (ST + message.outerHeight() + 10) && (obj.offset().left + obj.width()  > (message.outerWidth() + 10)) && obj.offset().top > ST + topOffset );
          break;
          case 'ne':
          result =  (obj.offset().top > (ST + message.outerHeight() + 10) && (W - obj.offset().left > (message.outerWidth() + 10)) && obj.offset().top > ST + topOffset );
          break;
          case 'north':
          result = (obj.offset().top > (ST + message.outerHeight() + 10));
          break;

          case 'sw':
          result = (obj.offset().left - SL + obj.width()  > (message.outerWidth() + 10));
          break;
          case 'se':
          result = (W - obj.offset().left - SL > (message.outerWidth() + 10));
          break;
          case 'south':
          result = true;
        }
        switch(al){
          case 'nw':
          checkbox_fix = (obj.width() + 5) / 2;
          break;
          case 'ne':
          checkbox_fix = -((obj.width() + 5) / 2);
          break;
          case 'sw':
          checkbox_fix = (obj.width() + 5) / 2;
          break;
          case 'se':
          checkbox_fix = -((obj.width() + 5) / 2);
          break;

          default:
          checkbox_fix = 0;
          break;

        }

        return result;
      }

      var al = 'se';
      for(i in alignment){
        if(checkAlignmentAvailability(alignment[i])){
          al = alignment[i];
          break;
        }
      }

      position = getPosition[al]();

      if(obj.is(':checkbox'))
        position.left += checkbox_fix;

      message.css(position);
      message.removeClass(getClass());
      class_alignment = al;
      message.addClass(getClass());

      return true;
    }

    function update(text){
      message.html(text);
    }

    function show(){
      hidden = false;
      update_position();
      message.stop(true, true).fadeIn(300);
    }

    function hide(){
      hidden = true;
      message.stop(true, true).fadeOut(300);
    }

    function remove(){
      message.remove();
      obj.removeAttr('data-neptr-tooltip');
    }

    function force_update_position(){
      hidden = false;
      update_position();
    }





    update_position();

    $(window).resize(update_position);
    // $(window).scroll(update_position);

    message.click(hide);

    return {
      force_update_position: force_update_position,
      update_position: update_position,
      update: update,
      show: show,
      hide: hide,
      remove: remove
    }
  }

  return {
    bind: bind
  }
})();
