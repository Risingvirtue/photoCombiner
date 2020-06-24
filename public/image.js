function imageDiv(x,y, id) {
	var canvasRect = canvas.getBoundingClientRect();
	if (x > 749) {
		x= 749;
	}
	if (y > 749) {
		y = 749;
	}
	this.x = x;
	this.y = y;
	this.id = id;
	this.z = 1;
	this.init = function() {
		var div = "<div id='img" + this.id + "' class=\"canvas\" onmousedown=\"resize('" + this.id + "')\">" +
						"<div id='move" + this.id + "' onmousedown=\"moveDiv(event, '" + this.id + "')\" class=\"move-bar\"></div>" + 
						"<div class='image-name'>Image " + this.id + "</div>" + 
						"<div class='line-vertical left'></div>" + 
						"<div class='line-vertical right'></div>" +
						"<div id='height" + this.id + "' class='vertical-text'>250px</div>" + 
						"<div class='line-horizontal top'></div>" + 
						"<div class='line-horizontal bottom'></div>" +
						"<div id='width" + this.id + "' class='horizontal-text'>250px</div>" +
					"</div>";
					
		$('#canvas').append(div);
		$("#img" + this.id).css({top: this.y, left: this.x});
	}
	
	this.init();
	
	this.move = function(x, y) {
		$('#' + this.id).css({top: x + 'px', left: y + 'px'});
		
	}
	this.getParam = function(param) {
		var result = $("#img" + this.id).css(param);
		result = result.substring(0, result.length - 2);
		return parseInt(result);
	}
	
	this.contains = function(x,y) {
		x = parseInt(x);
		y = parseInt(y);
		var width = this.getParam('width');
		var height = this.getParam('height');
		
		var top = this.getParam('top');
		var left = this.getParam('left');

		return left < x && x < (left + width) && top < y && y < (top + height);
		
	}
}


