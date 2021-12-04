var http = require('http');
var fs = require('fs');
var path = require('path');

var folder = process.argv[2];
if (folder == null) {
	console.log('no folder specified');
	return;
}

var port = process.argv[3];
if (port == null) {
	console.log('no port specified');
	return;
}

var contentTypes = { 
	js: 'text/javascript',
	css: 'text/css',
	woff2: 'font/woff2',
	json: 'application/json',
	png: 'image/png',
	jpg: 'image/jpg',
	ttf: 'font/ttf',
	map: 'text/plain',
	svg: 'image/svg+xml'
};

var defaultFile = 'index.html';

http.createServer(function (request, response) {
    var filePath = folder + request.url;
	filePath = filePath.split("?")[0]; //remove some ?xxx at the end of the requested file
	
    var extname = path.extname(filePath).substring(1);
	var contentType = contentTypes[extname] == undefined ? 'text/html' : contentTypes[extname];
	
	if (filePath.indexOf("@icons") >= 0) {
		filePath = filePath.substring(filePath.lastIndexOf("/"));
		console.log(filePath);
		fs.readFile("icons/"+filePath, function(error, content) {
			console.log("[200] "+filePath);
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');
		});
		return;
	}
	
	fs.stat(filePath, function(error, stats) {
        if (error) {
			fs.readFile('./'+error.code+'.html', function(error2, content) {
				if (error2) {
					console.log("[500] " + filePath);
					response.writeHead(500);
					response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
					response.end();

				} else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});

		} else if (stats.isDirectory()) {
			fs.readdir(filePath, { withFileTypes: true }, (err, files) => {
				if (err) {
					console.log(err);
				} else {
					console.log("filePath");
					let path = filePath.length == 1 ? "": filePath.substring(folder.length) + "";
					let toLi = function(f) {
						let img = f.isFile() ? "/@icons/152.png": "/@icons/4.png";
						return `<li><img src="${img}" width="16" height="16" style="padding-right: 12px; "/><a href="${path}/${f.name}">${f.name}</a></li>`;
					};
					let resultFolders = files.filter(f => !f.isFile()).map(f => toLi(f)).join("");
					let resultFiles = files.filter(f => f.isFile()).map(f => toLi(f)).join("");
					res = `<html><body><h1>${path}</h1><ul>${resultFolders}</ul><ul>${resultFiles}</ul></html>`; 
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(res, 'utf-8');
				}
			  });

		} else {

			fs.readFile(filePath, function(error, content) {
				console.log("[200] "+filePath);
				response.writeHead(200, { 'Content-Type': contentType });
				response.end(content, 'utf-8');
			});
		}
	});

}).listen(port);
console.log('Server running at http://127.0.0.1:'+port+'/');