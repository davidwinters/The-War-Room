$(document).ready(function() {


    w = new WOAR();

    var canoffset = $('canvas').offset();

 // TANKS

      //make tanks draggable
      $('.parent').draggable({
        helper: "clone"
       });

      //make a copy of the dragged tank on the div behind the canvas
      $("#wrapper").droppable({
        accept: ".parent",
        drop: function (event, ui){
          var offset = ui.offset;
          
          ui.draggable.clone().removeClass('parent').addClass('pawn').appendTo($(this)).css({'position': 'absolute', 'left': offset.left - canoffset.left, 'top': offset.top - canoffset.top }).draggable();
        }
      });

      //remove tanks
      $('#deleteall').click(function() {
        $('.pawn').remove();
       });
      

//UI Elements

      //make all the buttons
      $('button').button();

      //change map based on button in toolbar
      var map_name;
      $('#map ul a').click(function() {
        var map = 'url(img/maps/' + $(this).attr("title") + ')';
        $('#wrapper').css('background-image', map );
        map_name = $(this).attr("title")
       // $('#map a')
       });

      


      //drawing
        var draw= false;
        
        var canvas = document.getElementById("can");
        var ctx = canvas.getContext("2d");
        var color = $(".input_example").css('background-color');
        ctx.strokeStyle = color;
        
       

        //set it true on mousedown
        $("canvas").mousedown(function(e){draw=true;
            draw=true;
              ctx.save();
              var offset = $('canvas').offset();

              x = e.pageX-offset.left;
              y = e.pageY-offset.top; 

              
         
        });

        //reset it on mouseup
        $("canvas").mouseup(function(){draw=false;});

        $("canvas").mousemove(function(e) {
            
            if(draw){
              var offset = $('canvas').offset();
              
              if ($('.brushsize').val()){
                var brushSize = $('.brushsize').val();
              }else { var brushSize = 5;}
                    ctx.lineWidth = brushSize;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(e.pageX-offset.left,e.pageY-offset.top);
                    ctx.lineTo(x,y);
                    ctx.stroke();
                    ctx.closePath();
                    x = e.pageX-offset.left;
                    y = e.pageY-offset.top;  

            }    
       });

      //eraser
        $('button.eraser').click(function() {
           //check if eraser button is toggled
        if($("button.eraser").hasClass('active')){
               ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = color;
                

        }else{
               ctx.globalCompositeOperation = "destination-out";
               ctx.strokeStyle = "rgba(255,255,255,255)";
                
              }
          
         });

      //delete drawings
        $("#deletedrawings").click(function(){
                 // Store the current transformation matrix

                  ctx.save();

                  // Use the identity matrix while clearing the canvas
                  ctx.setTransform(1, 0, 0, 1, 0, 0);
                  ctx.clearRect(0, 0, canvas.width, canvas.height);

                  // Restore the transform
                  ctx.restore();
        });

        
      //colorwheel stuff
        
        Raphael.colorwheel($(".colorwheel")[0], 150).color("#F00").onchange(function(c){$(".input_example").css("background-color",c.hex);ctx.strokeStyle = c.hex;ctx.globalCompositeOperation = "source-over";});

            $( "#slider-vertical" ).slider({
                orientation: "horizontal",
                range: "min",
                min: 0,
                max: 20,
                value: 5,
                  slide: function( event, ui ) {
                    $( ".brushsize" ).val( ui.value );
                  }
            });
            $( ".brushsize" ).val( $( "#slider-vertical" ).slider( "value" ) );




      //save canvas

        //function helps convert CSS properties to Canvas properties
        function removepx(mystring){
          var newstring = new String(mystring);
          var pxstart = newstring.search('p');
            if (newstring.search('-') > -1){
              var start = 1;
            }else { var start = 0;}

          var cleanstring = newstring.slice(start, pxstart);
          return cleanstring;
        }

        $('#save').click(function() {
            var can2 = document.getElementById('canvasbuffer');
            var ctx2 = can2.getContext('2d');
            ctx2.font = "13px Arial";
            ctx2.fillStyle ="#ffffff";


                  //first clear the canvas
                  ctx2.save();
                  ctx2.setTransform(1, 0, 0, 1, 0, 0);
                  ctx2.clearRect(0, 0, canvas.width, canvas.height);
                  ctx2.restore();
              
              bg_img_loc = $('#wrapper').css('background-image');
              img_split_str = bg_img_loc.split('"');
              
              var img_bg = new Image();
              img_bg.src = img_split_str[1]
                
              
              ctx2.drawImage(img_bg, 0, 0, 850, 850);

              //goes through each of the pawns on the map and draws them on the buffer canvas
              $('.pawn div').each(function(index) {
                  var offset2 = $(this).offset();
                  var canvasoffset = $("#can").offset();

                  posx =  offset2.left - canvasoffset.left;
                  posy = offset2.top -canvasoffset.top;

                  var imgstring = new String($(this).css('background-image'));
                  
                    var imgh = removepx($(this).css('height'));
                    var imgw = removepx($(this).css('width'));

                    var crop = new String($(this).css('background-position'));
                    var crop_split;
                    
                    crop_split = crop.split(' ');
                     
                    var cropx = removepx(crop_split[0]);
                    var cropy = removepx(crop_split[1]);

                    var split_str, new_str;
                    split_str = imgstring.split('"');
                  

                    var img_loc = new Image();
                    img_loc.src = split_str[1]
 
                  ctx2.drawImage(img_loc, cropx, cropy, imgw, imgh, posx, posy, imgw, imgh);
                  var texty = parseInt(posy) + parseInt(imgh) + 10; 
                  var content = $(this).parent().text();
                  ctx2.fillText(content,posx,texty);
                  

                });
              

            // imgur stuff
            ctx2.drawImage(canvas, 0, 0);
            try {
                var img = can2.toDataURL('image/jpeg', 0.9).split(',')[1];
            } catch(e) {
                var img = can2.toDataURL().split(',')[1];
            }
            // open the popup in the click handler so it will not be blocked
            var w = window.open();
            w.document.write('Uploading...');
            // upload to imgur using jquery/CORS
            // https://developer.mozilla.org/En/HTTP_access_control
            $.ajax({
                url: 'http://api.imgur.com/2/upload.json',
                type: 'POST',
                data: {
                    type: 'base64',
                    // get your key here, quick and fast http://imgur.com/register/api_anon
                    key: '5d329282c17e4e1a1a7d32663fd55cf9',
                    name: map_name,
                    title: map_name,
                    caption: map_name,
                    image: img
                },
                dataType: 'json'
            }).success(function(data) {
                w.location.href = data['upload']['links']['imgur_page'];
            }).error(function() {
                alert('Could not reach api.imgur.com. Sorry :(');
                w.close();
            });


            
        });

     });