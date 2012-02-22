function WOAR() {

	this.db = "http://search.mpcinternet.com:7379";
	var _self = this;

	$(window).bind( 'hashchange', function(e) { 
		
		id = location.hash;
		id = id.replace("#","");
		_self.load(id);
		_self.id = id;

	});

	id = location.hash;

	if ( id ) {
		id = id.replace("#","");
		this.load(id);
		this.id = id;
	}


	

	$("#save-new").click( function() {
		_self.save();
	} );

	
}

function generateId () {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4)
}

WOAR.prototype.save = function() {

	var _self = this;
	mapname = $("#wrapper").css('background-image').replace(/^.*\/|\.[^.]*$/g, '');
	canvas = document.getElementById("can");
	png = canvas.toDataURL("image/png");

	if (!this.id) {
		this.id = generateId();	
	}
	


	map = {
		id : _self.id,
		pawns : [],
		map : mapname
	}

	$('.pawn div').each(function(index) {

		var off = $(this).offset();
		var canoffset2 = $('canvas').offset();

		var imgstring = $(this).attr('class');

		map.pawns.push({x:off.left - canoffset2.left,y:off.top - canoffset2.top,tank:imgstring});


	});

	key = "woar_game_" + map.id;
	pawns = JSON.stringify(map.pawns);

	data = "HMSET/" + key + "/map/" + encodeURIComponent(mapname) + "/pawns/" + encodeURIComponent(pawns) + "/canvas/" + encodeURIComponent(png)

    $.ajax({
        url: "http://search.mpcinternet.com:7379/",
        type: 'POST',
        data: data,
        dataType: 'json'
    }).success(function(data) {
        
        location.href = "#" + _self.id;

    }).error(function(xhr) {
        console.log( xhr );
    });

	return false;	
}



WOAR.prototype.load = function(id) {
	
	$.getJSON("http://search.mpcinternet.com:7379/HGETALL/woar_game_" + id,function(r) {
		
		map = r.HGETALL;
		$("#wrapper").css({'background-image':'url("img/maps/' + map.map + '.jpg")'})


		pawns = JSON.parse( map.pawns );

		$.each(pawns,function(i,value){
			
			tank = $(".tab-content").find("." + value.tank).parent().clone().removeClass("parent").addClass("pawn");
			var canoffset = $('canvas').offset();
			$("#wrapper").prepend(tank);
			$(tank).css({position:"absolute",top:value.y + "px",left:value.x + "px"})
			$(tank).draggable();

		});


		var canvas = document.getElementById("can");
		var ctx = canvas.getContext("2d");
		var image = new Image();
		str = map.canvas.replace(/@/gi,"/");
		image.onload = function() {
			ctx.drawImage(image, 0, 0, 850, 850);			
		}
		image.src = str;		

	});


}