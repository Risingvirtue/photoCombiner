var previewURL;
var imgInfoLine;
var index;
var sortedDivs = [];
var rows = 1;
var counterRows = 0;
function numRows(data) {
	rows = data;
}
function sortImageDivs() {
	sortedDivs = [];
	for (var i = 0; i < imageDivs.length; i++) {
		sortedDivs.push({id: imageDivs[i].id, imageDiv: imageDivs[i], z: imageDivs[i].z, index: i});
	}
	sortedDivs = sortedDivs.sort(function(a,b) {
		if (a.z != b.z) {
			return a.z - b.z;
		} else {
			return a.id - b.id;
		}
	})
}

function preview() {
	sortImageDivs();
	if (isPreview) {
		$("#myCanvas").css('z-index', -1);
		$("#preview").html('Preview');
	} else if (!isPreview && imageDivs.length >= 2){
		$("#preview").html('Stop Preview');
		if (previewURL) {
			showPreview(previewURL);
		} else {
			socket.emit('preview');
		}
	}
	isPreview = !isPreview;
}

function showPreview(data) {
	previewURL = data;
	resetCanvas();
	createImage(0, data);
}

function createImage(i, data) {
	if (i < Math.min(imageDivs.length, data.length)) {
		var actualIndex = sortedDivs[i].index;
		var imageDiv = imageDivs[actualIndex];
		var img = new Image();
		img.src = data[actualIndex];
		img.onload = function() {
			var dim = getDimension(imageDiv, img.width, img.height);
			ctx.clearRect(dim.x, dim.y, dim.width, dim.height);
			ctx.drawImage(this, dim.x, dim.y, dim.width, dim.height);
			createImage(i + 1, data);
		}
	} else {
		if ($("#imgPlus").css('display') != "none") {
			drawPlus();
		}
		$("#myCanvas").css('z-index', maxZ + 2);
	}
}



function generate() {
	if (imageDivs.length >= 2) {
		counterRows = 0;
		socket.emit('generate');
	}
}

function createImages(data) {
	
	setTimeout(function() {
		createIndividualImage(data);
	}, 0);
	
}

function createIndividualImage(data) {
	sortImageDivs();
	var imgInfo = [];
	var numCol = 0;
	var maxCol = Math.min(data.length, imageDivs.length);
	
	for (var i = 0; i < maxCol; i++) {
		var actualIndex = sortedDivs[i].index;
		var currImg = new Image();
		currImg.name = data[i].name;
		currImg.col = i;
		currImg.imageDiv = imageDivs[actualIndex];
		currImg.onload = function() {
			var dim = getDimension(this.imageDiv, this.width, this.height);
			myCanvas.width = dim.width;
			myCanvas.height = dim.height;
			ctx.clearRect(0,0, dim.width, dim.height);
			ctx.drawImage(this, 0,0, dim.width, dim.height);
			var imgd = ctx.getImageData(0,0, dim.width, dim.height);
			imgd.x = dim.x;
			imgd.y = dim.y;
			imgd.name = this.name;
			imgInfo[this.col] = imgd;
			
			numCol++;
			console.log(imgInfo, numCol);
			if (numCol == maxCol) {
				renderAndSave(imgInfo, this.name);
			}
		};
		currImg.src = "data:image/jpeg;base64," + data[i].base64; //formatting
	}
	
}



function getDimension(imageDiv, containerWidth, containerHeight) {
	var x = imageDiv.getParam('left'); //account for borders
	var y = imageDiv.getParam('top');
	var width = imageDiv.getParam('width');
	var height = imageDiv.getParam('height');
	
	//preserve Ratio
	if (width / containerWidth < height / containerHeight) {
		var ratio = containerHeight / containerWidth;
		return {x: x, y: y,width: width, height: width * ratio};
	} else {
		var ratio = containerHeight / containerWidth;
		return {x: x, y: y, width: height / ratio, height: height};
	}
}


function renderAndSave(imgInfo, name) {
	resetCanvas();
	
	imgInfo.forEach(function(img) {
		//name.push(img.name);
		drawImage(img);
	})
	
	drawPlus();
	var percent = Math.floor(counterRows  *100 / rows);
	$("#message").html("Currently generating combos: "  + percent + "%");
	saveCanvas(name + "_01");
}
function drawPlus() {
	var pos = getImagePos("Plus");
	ctx.fillStyle="red";
	var width = $("#imgPlus").css('width');
	width = width.substring(0, width.length - 2);
	var height = $("#imgPlus").css('height');
	height = height.substring(0, height.length - 2);
	var innerLength = $("#plus-length").val();
	var innerWidth  = $("#plus-width").val();
	ctx.clearRect(pos.x + width / 2 - innerWidth / 2 + 1, pos.y, innerWidth, height);
	ctx.fillRect(pos.x + width / 2 - innerWidth / 2 + 1, pos.y, innerWidth, height);
	ctx.clearRect(pos.x, pos.y + height / 2 - innerLength / 2 + 1, width, innerLength);
	ctx.fillRect(pos.x, pos.y + height / 2 - innerLength / 2 + 1, width, innerLength);
}

function drawImage(data) {
	
	var col = 0;
	var row = 0;
	for (var i = 0; i < data.data.length; i = i + 4) {
		var imgPix = {r: data.data[i], g: data.data[i+1], b: data.data[i+2], a: data.data[i+3]};
		ctx.fillStyle = 'rgba(' + imgPix.r + ',' + imgPix.g + ',' + imgPix.b + ',' + imgPix.a + ')';
		ctx.clearRect(col + data.x, row + data.y, 1, 1);
		ctx.fillRect(col + data.x, row + data.y, 1, 1);
		col++;
		if (col >= data.width) {
			col = 0;
			row++;
		}
	}
}

function resetCanvas() {
	myCanvas.height = 1000;
	myCanvas.width = 1000;
	ctx.clearRect(0,0, myCanvas.width, myCanvas.height);
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0, myCanvas.width, myCanvas.height)
}

function saveCanvas(name) {
	//gets rid of header
	var newImgData = myCanvas.toDataURL('image/jpeg', 1.0).slice(23);
	socket.emit('saveNewImg', {newName: name, newImgData: newImgData});
}