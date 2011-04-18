require.paths.unshift('/usr/local/lib/node');

var sys = require('sys'), 
	request = require('request'), 
	h = {accept:'application/json', 'content-type':'application/json'},
	_up = 'polius.cloudant.com/', _user = "", _pass = "", _db = "";

var failed = [];

process.argv.forEach(function (val, index, array) {
	if(index==2)
		_user = val;
	else if(index==3)
		_pass = val;
	else if(index==4)
		_db = val;
});
if (_user == "") {
	console.error("first arg _user is missing");
	return;
}
if (_pass == "") {
	console.error("2nd arg _pass is missing");
	return;
}
if(_db == "") {
	console.error("3rd arg _db is missing");
	return;
}

var u = 'https://' + _user + ":" + _pass + "@" + _up + '/' + _db + '/';
//console.log(u);
//return;

function Save(o, rt){
	if(!o) return;
	request({uri:u, method:'POST', body:JSON.stringify(o), headers:h}, function (err, resp, b) {
	  if (err) throw err;
	  if (resp.statusCode !== 201) {
	  	var msg = "Could not create document. " + b;
	  	console.error(msg);
		if (!rt) {
			console.error("can not create doc, retying: " + b);
			Save(o, true);
		}
		else {
			console.error("failed doc twice: " + b);
			failed[failed.length] = o;
		}
	  }
	  else 
	  	console.log("OK: " + b);
	});
}

var fs = require('fs');
fs.readFile('ContactingCongress.db.txt', 'utf-8', function (err, buffer) {
  if (err) {
    console.error(err.stack);
    return;
  }
  var o = {};
  var t = 0;
  var s = "";
  for(var i=0; i<buffer.length; i++) {
  	var c = buffer[i];
	switch(c) {
		case '\r':
			//ignores...
			break;
		case '\n':
			//insert o into db
			console.log(o.name);
			Save(o);
			
			t = 0;
			s = "";
			o = {};
			break;
		case '\t':
			switch(t) {
				case 0:
					o.district = s;
					break;
				case 1:
					o.name = s;
					break;
				case 2:
					o.party = s;
					break;
				case 3:
					o.officeDC = s;
					break;
				case 4:
					o.voiceDC = s;
					break;
				case 5:
					o.voice = s;
					break;
				case 6:
					//o.correspondence = s;
					o.crspdnt = s;
					break;
				case 7:
					o.web = s;
					break;
			}
			s = "";
			t++;
			break;
		default:
			s += c;
			break;
	}
  }
});

if(failed.length > 0) {
	console.log("retrying " + failed.length + " failed items");
	for(var i=0; i<failed.length; i++) {
		Save(failed[i]);
	}
}

