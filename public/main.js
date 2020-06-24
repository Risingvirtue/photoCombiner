var myCanvas = document.getElementById("myCanvas");
var ctx = myCanvas.getContext('2d');
var canvas = document.getElementById('canvas');
var move = false;
var shift;
var activeImg;
var isResize;
var imageIndex = 1;
var imageDivs = [];
var rightClickPos;
var isPreview = false;
var maxZ = 1;

$(document).ready(function() {
	
	myCanvas.width = 1000;
	myCanvas.height = 1000;
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,myCanvas.width, myCanvas.height);
	socket = io.connect('http://localhost:3000');
	socket.on('imageURL', createImages);
	socket.on('preview', showPreview);
	socket.on('color', changeColorScheme);
	socket.on('showTemplates', showTemplates);
	socket.on('renderTemplate', renderTemplate);
	socket.on('numRows', numRows);
})


document.addEventListener('contextmenu', function(e) {
	
	var mousePos = getMousePos(canvas, e);
	if (mousePos.x >=0 && mousePos.x <= 1000 && mousePos.y >=0 && mousePos.y <=1000 && !isPreview) {
		
		if (e.target.id == "canvas" || e.target.id == "imgPlus") {
			$("#delete-image").css("display", "none");
		} else {
			$("#delete-image").css("display", "block");
		}
		var x = e.clientX;
		var y = e.clientY;
		rightClickPos = mousePos;
		$('#menu').css({display: 'block', top: y + 'px', left: x + 'px'});
		e.preventDefault();
	} else {
		$('#menu').css('display', 'none');
	}
	
}, false);

$(document).mousedown(function(e) {
	if (e.target.id != "new-image" && e.target.id != "delete-image") {
		//$('#menu').css('display', 'none');
	}
})


$(document).mouseup(function(e){
	if (e.which != 1) return false;
	move = false;
    isResize = false;
	$('#menu').css('display', 'none');
});

$(document).mousemove(function(e){
	if (move) {
		var mousePos = getMousePos(canvas, e);
		var coord = moveCoordinates(mousePos);
		var maxWidth = 999 - coord.newX;
		var maxHeight = 999 - coord.newY;
		
		$('#img' + activeImg).css({top: coord.newY + 'px', left: coord.newX + 'px'});
		
		$('#img' + activeImg).css({"max-width": maxWidth, "max-height": maxHeight});
	} else if (isResize) {
		var dimInfo = getDim(activeImg);
		$("#height").val(dimInfo.height);
		$("#width").val(dimInfo.width);
		if (activeImg != "Plus") {
			$('#height' + activeImg).html(dimInfo.height + 'px');
			$('#width' + activeImg).html(dimInfo.width + 'px');
		}		
	}
   
});



function newImage(e) {
	var mousePos = getMousePos(canvas, e);
	//border
	mousePos.x = mousePos.x - 15;
	mousePos.y = mousePos.y - 15;
	if (mousePos.x > 749) {
		mousePos.x = 749;
	}
	if (mousePos.y > 749)
		mousePos.y = 749;
	
	imageDivs.push(new imageDiv(mousePos.x,mousePos.y,imageIndex));
	var maxWidth = 999 - mousePos.x;
	var maxHeight = 999 - mousePos.y;
	$('#img' + imageIndex).css({"max-width": maxWidth, "max-height": maxHeight});
	
	makeActive(imageIndex);
	imageIndex++;
	changeCurrImage();
}

//search inbetween coordinate
function deleteImage(e) {
	var mousePos = rightClickPos;
	console.log(mousePos);
	console.log(imageDivs[0]);
	for (var i = imageDivs.length - 1; i >= 0; i--) {
		var imageDiv = imageDivs[i];
		if (imageDiv.contains(mousePos.x, mousePos.y)) {
			$("#img" + imageDiv.id).css('display', 'none');
			imageDivs = imageDivs.slice(0,i).concat(imageDivs.slice(i+1));
			break;
		}
	}

}



function createPlus() {

	var text = $("#plus").html();
	if (text == "<b>Create Plus</b>") {
		$("#imgPlus").css({'display': 'block', "z-index": maxZ + 1});
		$("#plus").html('<b>Remove Plus</b>');
		
		makeActive("Plus");
		changeCurrImage();
		
	} else {
		$("#plus").html('<b>Create Plus</b>');
		$("#imgPlus").css('display', 'none');
		console.log(activeImg);
		if (activeImg == "Plus") {
			$("#imgName").html("Current Image");
			$("#height").val(250);
			$("#width").val(250);
			activeImg = null;
		}
	
	}
}

function plusDimension() {
	var length = $("#plus-length").val();
	var width  = $("#plus-width").val();
	$(".plus-vertical").css("width", width);
	$(".plus-vertical").css("left", 'calc(50% - ' + width/ 2 + 'px)');
	$(".plus-horizontal").css("height", length);
	$(".plus-horizontal").css("top", 'calc(50% - ' + length /2 + 'px)');
}

function moveCoordinates(mousePos) {
	var width = $("#img" + activeImg).css('width');
	width = width.substring(0, width.length - 2);
	var height = $("#img" + activeImg).css('height');
	height = height.substring(0, height.length - 2);
	
	var newY = mousePos.y - shift.y - 15;
	newY = Math.max(0, newY);
	newY = Math.min(999 - height, newY);
	
	var newX = mousePos.x -shift.x - 15;
	newX = Math.max(0,newX);
	newX = Math.min(999 - width, newX);
	
	return {newX: newX, newY: newY}
}

function changeCurrImage() {
	if (activeImg) {
		var height = $('#img' + activeImg).css("height");
		height = height.substring(0, height.length - 2);
		height = Math.round(height);
		console.log(height);
		var width = $('#img' + activeImg).css("width");
		width = width.substring(0, width.length - 2);
		width = Math.round(width);
		$("#imgName").html("Image " + activeImg);
		$("#height").val(height);
		$("#width").val(width);
	}
}

function currDimension() {
	//display current image's dimension
	var height = $("#height").val();
	var width = $("#width").val();
	var imgPos = getImagePos(activeImg);
	
	if (height > 999 - imgPos.y || width > 999 - imgPos.x) {
		console.log(height, width);
		height = Math.min(999 - imgPos.y, height);
		width = Math.min(999 - imgPos.x, width);
		$("#height").val(height);
		$("#width").val(width);
	}
	
	$('#img' + activeImg).css("height", height + 'px');
	$('#img' + activeImg).css("width", width + 'px');
	var height = $('#img' + activeImg).css('height');
	var width = $('#img' + activeImg).css('width');
	$('#height' + activeImg).html(height);
	$('#width' + activeImg).html(width);
	/*
	$("#height").val(height.substring(0, height.length - 2));
	$("#width").val(width.substring(0, width.length -2));
	*/
	
}



function moveDiv(e, img) {
	makeActive(img);
	move = true;
	var imageDiv = document.getElementById('img' + img);
	shift = getMousePos(imageDiv, e);
	
	changeCurrImage();
}

function resize(img) {
	makeActive(img);
	isResize = true;
	changeCurrImage();
}

function getImagePos(img) {
	var top = $('#img' + img).css("top");
	top = top.substring(0, top.length - 2);
	var left = $('#img' + img).css("left");
	left = left.substring(0, left.length - 2);
	return {y: parseInt(top), x: parseInt(left)};
}

function makeActive(img) {
	if (activeImg) {
		$('#img' + activeImg).css({'border-color': 'black'});
	}
	activeImg = img;
	maxZ++;
	$('#img' + activeImg).css({'border-color': 'green', 'z-index': maxZ});
	$("#imgPlus").css({"z-index": maxZ + 1});
	if (img != "Plus") {
		var imageDiv = getImageDiv(activeImg);
		imageDiv.z = maxZ;
	}
	
}

function getImageDiv(id) {
	for (var i = 0; i < imageDivs.length; i++) {
		if (imageDivs[i].id == id) {
			return imageDivs[i];
		}
	}
	return null;
}

function getDim(img) {
	var width = $("#img" + img).css('width');
	width = width.substring(0, width.length - 2);
	width = Math.round(width);
	var height = $("#img" + img).css('height');
	height = height.substring(0, height.length - 2);
	height = Math.round(height);
	return {width: width, height: height};
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}