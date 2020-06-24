var express = require('express')
var app = express();
var server = app.listen(3000);
var fs = require('fs');
var path = require('path');
var csv = require('csv');
var directory = path.dirname(process.argv[1]);

var csvFolder = directory + "/items";
var csvFile = fs.readdirSync(csvFolder);
for (var i = 0; i < csvFile.length; i++) {
	var currFile = csvFile[i];
	if (currFile.slice(currFile.length - 3) == "csv") {
		csvFile = currFile;
		break;
	}
}
var itemPath = csvFolder + '/' + csvFile;
var previewPath = directory + '/combo.csv';
var saveFolder = directory + '/results';

var i2b = require("imageurl-base64");
var randomColor = require('randomcolor');

app.use(express.static('public'));

var socket = require('socket.io');

var io = socket(server);

//listens to localhost
io.sockets.on('connection', newConnection);
var totalRows = 0;
var counter = 0;
function newConnection(socket) {
	console.log('New Connection: ' + socket.id);
	
	socket.on('preview', preview);
	
	function preview() {
		console.log('preview');
		var items = [];
		var finishedItems = 0;
		
		var data = fs.readFileSync(previewPath, 'utf8');
		csv.parse(data, function(err, data){
			socket.emit('preview', data[1]);
		})
	}
	
	
	socket.on('generate', generate);
	
	function generate() {

		console.log("generating");

		

		var items = [];
		var itemCount = [];
		var finishedItems = 0;
		var data = fs.readFileSync(itemPath, 'utf8');
			csv.parse(data, function(err, data){
				//var numRows = data.length;
				var numItems = data[0].length;
				
				counter = 0;

				var numRows = data.length;

				totalRows = numRows;
				socket.emit('numRows', numRows);
				for (var i = 0; i < numRows; i++) {
					itemCount.push(0);
					items.push([]);
				}
				
				for (var row = 1; row < numRows; row++){
					for (var column = 0; column < data[row].length - 1; column++) {
						(function(row, column) {
							var name = data[row][data[row].length - 1];
							var files = fs.readdirSync(directory + '/results');
							var newName = name + '_01.jpg';
							if (files.indexOf(newName) != -1) {
								counter++;
								return;
							}
							generateBase64(row, column);
						})(row, column);
						
					}
				}
				
				//var failedRows = {};
				function generateBase64(row, column) {
					var item = items[row];
					i2b(data[row][column], function(err, base64) {
						if (err) {
							if (err.code) {
								generateBase64(row, column);
								
							} else {
								console.log("bad URL: " + data[row][column]);
								/*
								if (!(row in failedRows)) {
									counter++;
									failedRows[row] = true;
								} 
								*/
							}
							return;
							
						}
						/*
						var linkArr = data[row][column].split('/');
						linkArr = linkArr[linkArr.length - 1];
						var name = linkArr.substring(0, linkArr.length - 4);
						name = name.slice(0,name.length -2);

						*/

						finishedItems++;
						var name = data[row][data[row].length - 1];
						
						item[column] = {base64: base64.base64, name: name, row: row};
						//item[column] = name;
						
						itemCount[row] += 1;
						
						if (itemCount[row] == data[row].length - 1) {
							//console.log('saved');
							
							socket.emit('imageURL', item);
						}
					})
				}
		
			})
	}
	
	socket.on('saveNewImg', saveNewImg);
	
	function saveNewImg(data) {
		fs.writeFile(saveFolder + '/' + data.newName + '.jpg', data.newImgData, 'base64', function(err){
			counter++;
			if (err) {
				console.log(err);
				return;
			}
			var percent = Math.round(counter * 100 / totalRows);
			console.log('File ' + data.newName + ' saved. ' + percent + "% done.");
			if (percent == 100) {
				console.log("Done rendering " + counter + " images!");
			}
			
		})
	}
	
	socket.on("color", getColors);
	
	function getColors() {
		
		socket.emit("color", randomColor({luminosity: 'light', count: 5}));
	}
	
	socket.on("save", saveTemplate);
	
	function saveTemplate(data) {
		console.log(data.name);
		fs.writeFile(directory + '/templates/' + data.name + '.txt', JSON.stringify(data), 'utf8', function(err){
			if (err) throw err
			console.log('File ' + data.name + ' saved.');
		})
	}
	
	socket.on('loadChoice', loadChoice);
	
	function loadChoice() {
		var templates = fs.readdirSync(directory + '/templates');
		socket.emit('showTemplates', templates);
	}
	
	socket.on('loadTemplate', loadTemplate);
	
	function loadTemplate(data) {
		var templatePath = directory + '/templates/' + data;
		var info = fs.readFileSync(templatePath, 'utf8');
		info = JSON.parse(info);
		console.log(info);
		socket.emit('renderTemplate', info);
	}
}
