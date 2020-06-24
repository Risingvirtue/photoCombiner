function saveTemplate() {
	$("#myModal").css({display: 'block'});
}

function saveFile() {
	var name = $("#filename").val();
	console.log(name);
	if (name == "") {
		alert('Please Enter a file name');
	} else {
		imageDivs.forEach(function(img) {
			var dimInfo = getDim(img.id);
			img.height = dimInfo.height;
			img.width = dimInfo.width;
			img.x = $("#img" + img.id).css('left');
			img.y = $("#img" + img.id).css('top');
		})
		var plus = {};
		var plusDim = getDim("Plus");
		plus.height = plusDim.height;
		plus.width = plusDim.width;
		plus.length = $("#plus-length").val();
		plus.width2 = $("#plus-width").val();
		plus.y = $("#imgPlus").css('top');
		plus.x = $("#imgPlus").css('left');
		plus.display =  $("#plus").html();
		socket.emit('save', {imageDivs: imageDivs, maxZ: maxZ, plus: plus, name: name});
		$("#myModal").css({display: 'none'});
		alert('saved');
	}
}

$(document).keyup(function(e) {
     if (e.keyCode == 27) { // escape key maps to keycode `27`
        $("#myModal").css('display', 'none');
		$("#templates").css('display', 'none');
    }
});

function getTemplates() {
	socket.emit('loadChoice', {});
	
}

function showTemplates(data) {
	$("#templates").css('display', 'block');
	document.getElementById('template-select').innerHTML= "";
	var contents = "";
	for (var i = 0; i < data.length; i++) {
		contents += "<option value='" + data[i] + "'>" + data[i] + "</option>";
	}
	$("#template-select").html(contents);
	
}

function loadTemplate() {
	$("#templates").css('display', 'none');
	var fileName = $("#template-select").val();
	socket.emit('loadTemplate', fileName);
}

function renderTemplate(data) {
	imageDivs = [];
	var list = document.getElementById("canvas");
	var length = list.childNodes.length;
	for (var i = 15; i < length; i++) {
		list.removeChild(list.childNodes[15]);
	}
	var maxIndex = 1;
	
	for (var i = 0; i < data.imageDivs.length; i++) {
		
		var currImageDiv = data.imageDivs[i];
		maxIndex = Math.max(currImageDiv.id + 1, maxIndex);
		imageDivs.push(new imageDiv(currImageDiv.x, currImageDiv.y, currImageDiv.id));
		$("#img" + currImageDiv.id).css({"z-index": currImageDiv.z, height: currImageDiv.height, width: currImageDiv.width});
		$("#height" + currImageDiv.id).html(currImageDiv.height + 'px');
		$("#width" + currImageDiv.id).html(currImageDiv.width + 'px');
		maxZ = data.maxZ;
	}
	imageIndex = maxIndex;
	
	
	$("#imgPlus").css({height: data.plus.height, width: data.plus.width, top: data.plus.y, left: data.plus.x});
	$("#plus-length").val(data.plus.length);
	$("#plus-width").val(data.plus.width2);
	plusDimension();
	
	var text = $("#plus").html();
	if (text != data.plus.display) {
		createPlus();
	}
	
} 