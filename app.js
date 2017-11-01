var express    = require('express');
var app        = express();
var encryptor  = require('./app/helpers/encryptor');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var port       = process.env.PORT || 3000;
var db         = require('./app/db/db')();
var models     = require('./app/db/models/models')();
var auth       = require('./app/routes/auth')(models);
var session    = require('express-session');

if(process.argv[2] == "admin-init") {
    var adminInit  = require('./admin-init')(models, encryptor);    
}


app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));

app.get('/', function(req, res){
    res.render('index');
});

app.use('/auth', auth);

app.get('/myconferences', function(req, res, next) {
    if(req.session.authenticatedEmail) {
        next();
    } else {
        res.locals.type    = "danger";
        res.locals.message = "Session expired"; 
        res.render('/auth/login');
    }
},
function(req, res) {
    //we first read the privileges table asynchronously
	//and pass the resolved records to the the promise's then chain
	var _privileges = new Promise(function(resolve, reject) {
		models.Privilege.find({email: req.session.authenticatedEmail}, function(err, obj){
			if(!err)
				resolve(obj);
		});
	});
	
	//here, we are guaranteed to have read all the records for privileges
	_privileges.then(function(privileges){
		//now we wrap each IO request to the track and conferences table in a promise
		//so that we can avoid the situation whereby a piece of code that depends on the
		//IO result, is executed before the result is available for consumption
		var conferenceTrackInfo = privileges.map(function(privilege) {
			return new Promise(function(resolve, reject){
				var conferenceTrack = {};
				models.Track.findById(privilege.tid, function(err, track){
					if (!err)
						conferenceTrack.trackName = track.name;
						conferenceTrack.trackId   = track.id;
					//we chain the two IO calls using a promise so they are performed
					//one after the other
				}).then(function() {
					models.Conference.findById(privilege.cid, function(err, conf) {
						if(! err)
							conferenceTrack.conferenceName = conf.name;
							conferenceTrack.conferenceId   = conf.id;
							//since we chained the two IO calls, we are guaranteed to have
							//the conferenceTrack information copied correctly to the object
							resolve(conferenceTrack);
					})
				})	
			});
		});
		//here we resolve all the IO promises to obtain all the conference and track info
		Promise.all(conferenceTrackInfo).then(function(conferenceTracks){
			res.locals.conferences = conferenceTracks;
			res.render('myconferences', {conferences: res.locals.conferences});
		});
	})
});

app.post('/myconferences', function(req, res) {
    console.log(req.query);
    console.log(req.session);
    res.end();
});

app.listen(port, function(){
    console.log("Listening on port", port);
})


