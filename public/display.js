console.log('hi');
$(document).ready(function() {
	resizeWindow();
})


$(window).resize(function(){
	resizeWindow();
})

function resizeWindow() {
	var height = window.innerHeight;
	var width = window.innerWidth;
	var min = Math.min(height, width * 0.6);
	
	$("#canvas").css({height: 1000, width: 1000, top: (height - 1000) / 2, right: (height - 1000) / 2});
	$("#myCanvas").css({height: 1000, width: 1000, top: (height - 1000) / 2, right: (height - 1000) / 2});
	var leftWidth = width - min * 0.95;
	$(".left-container").css({width: leftWidth, height: height - min * 0.05});
	$(".title").css({'margin-top': min * 0.05});
	center("#title", leftWidth);
	
	$("#sign").css({width: Math.min(leftWidth * 0.6, height / 2), height: Math.min(leftWidth * 0.25, height / 4)});
	$("#create-plus").css({width: Math.min(leftWidth * 0.6, height / 2), height: Math.min(leftWidth * 0.25, height / 4)});
	center("#sign", leftWidth);
	center("#create-plus", leftWidth);
	var sign = document.getElementById('sign');
	var signRect = sign.getBoundingClientRect();
	$("#sign > .top-left").css({top: signRect.top + 5, left: signRect.left + 5});
	$("#sign > .top-right").css({top: signRect.top + 5, left: signRect.left  + signRect.width -  19});
	$("#sign > .bottom-left").css({top: signRect.top + signRect.height - 21, left: signRect.left + 5});
	$("#sign > .bottom-right").css({top: signRect.top + signRect.height - 21, left: signRect.left  + signRect.width -  19});
	
	$(".table").css({width: signRect.width - 6});
	$(".row").css({height: signRect.height / 4});
	$(".cell").css({width: (signRect.width - 6) / 2});
	
	var create = document.getElementById('create-plus');
	var createRect = create.getBoundingClientRect();
	$("#create-plus > .top-left").css({top: createRect.top + 5, left: createRect.left + 5});
	$("#create-plus > .top-right").css({top: createRect.top + 5, left: createRect.left  + createRect.width -  19});
	$("#create-plus > .bottom-left").css({top: createRect.top + createRect.height - 21, left: createRect.left + 5});
	$("#create-plus > .bottom-right").css({top: createRect.top + createRect.height - 21, left: createRect.left  + createRect.width -  19});
	
	resizeButton("#plus", height);
	resizeButton("#preview", height);
	resizeButton("#combo", height);
	
	center("#button-container", leftWidth + 6);
	
	$("#message-img").css({width: Math.min(leftWidth * 0.7, height / 2), height: Math.min(leftWidth * 0.3, height / 4)});
	
	center("#message-img", leftWidth + 6);
	
	var messageImg = document.getElementById('message-img');
	var messageRect = messageImg.getBoundingClientRect();
	$("#message").css({top: messageRect.top + 30, left: messageRect.left + messageRect.width / 4, width: messageRect.width / 2});

	$("#dice").css({width: height / 12, height: height / 12});
}

function center(id, containerWidth) {
	var idWidth = $(id).css('width');
	idWidth = pixelNum(idWidth);
	var left = (containerWidth - idWidth) / 2;
	
	$(id).css('margin-left', left);
}
function resizeButton(id, height) {
	var plusWidth = $(id).css('width');
	plusWidth = pixelNum(plusWidth);
	plusWidth = plusWidth * 5 / 12;
	plusWidth = Math.min(height / 12, plusWidth);
	$(id).css({'height': plusWidth});
}

function pixelNum(pix) {
	return pix.slice(0, pix.length - 2);
}

function diceClick() {
	
	
	var mix = {r:255, g:255, b:255};
	var colors = [];
	for (var i = 0; i < 5; i++) {
		var red = Math.floor(Math.random() * 126 + 125);
		var green = Math.floor(Math.random()* 126 + 125);
		var blue = Math.floor(Math.random() * 126 + 125);
		red = (red + mix.r) / 2;
		green = (green + mix.g) / 2;
		blue = (blue + mix.b) / 2;
		colors.push('rgb(' + red + "," + green + "," + blue + ")");
	}
	changeColorScheme(colors);
	
}

function changeColorScheme(data) {
	
	$("html").css('background-color', data[0]);
	$("body").css('background-color', data[0]);
	$("#sign").css('background-color', data[1]);
	$("#create-plus").css('background-color', data[1]);
	$(".button").css('background-color', data[2]);
	$(".dice").css('background-color', data[2]);
	$(".move-bar").css('background-color', data[3]);
	
	
}