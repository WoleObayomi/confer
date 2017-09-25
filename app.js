var express    = require('express');
var app        = express();
var encyptor   = require('./app/helpers/encryptor');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var auth       = require('./app/routes/auth');

var port       = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

morgan(':method :url :status :res[content-length] - :response-time ms');

app.get('/', function(req, res){
    res.render('index');
});

app.use('/auth', auth);

app.listen(port, function() {
    console.log('listening on port', port);
});
