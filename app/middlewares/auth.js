//THIS IS THE MIDDLEWARE FILE. These functions are used in the routes file ie /routes/auth/auth.js
var encryptor  = require('../helpers/encryptor');

module.exports = function(User) {
	
	function login() {

		//check email and password match in db

		return function (req, res, next) {
			//retrieve the credentials passed by the user
			var email    = req.body.email;
			var password = req.body.password;
			 
			//using findOne here since emails are unique 
			User
				.findOne({email: email}, function(err, obj) {
					//if there is no error,
					//check if the obj returned is not null
					// if it's null, we pass that the user is not authenticated
					if(!err) {
						if (!obj) {
							console.log('User not found');
							res.locals.authenticated = false;
						}
						else {
							//if the user object is found using the email,
							//compare the passed password with the saved password
							var savedPassword = obj.password;
							var isCorrectPassword = encryptor.compare(password, savedPassword);
							//set res.locals.authenticated to true so the next middleware knows what to display
							//set the res.locals.authenticatedEmail to the email the user passed
							if(isCorrectPassword) {
								res.locals.authenticated = true;
								req.session.authenticatedEmail = email;
							} 
							else {
								//hash comparison of password failed
								//so user is not authenticated
								console.log('Incorrect password');
								res.locals.authenticated = false;
							}
						}
					}
					else {
						//we received an error object
						//so set the res.locals.err value to be used in the next middleware
						console.log("login error", err);
						res.locals.err = err;
					}
					
				}).then(function(){
					next();
				});
			
		}
	};

	function signup() {

		return function (req, res, next) {
			var email     = req.body.email;
			var password  = req.body.password;
			var confirm   = req.body.confirm;
			
			console.log(email, password);
			//compare password and confirm
			if(password !== confirm) {
					
			}
			
			//check if a user with this email
			//already exists
			User.findOne({email: email}, function(err,obj) { 
				//if the user does not exist
				//and there is no error
				//create the new user
				if(!obj && !err) {
					User.create({email: email, password: encryptor.encryptPass(password)}, function(err, obj) {
						//if a non-empty object is received,
						//then the user has been created
						if(obj) {
							console.log('User created', JSON.stringify(obj, null, 2));
						}
						//an error here indicates that the user could not be created
						if (err) {
							console.log('User was not found and was not created!')
							res.redirect('/auth/signup');
						}
					});
				}
				//a non-empty object here means a user with the email
				//already exists in the database
				else if (obj) {
					console.log("User already exists", JSON.stringify(obj));
					res.locals.userAlreadyExists = true;
				} 
				else {
					res.locals.err = err;
				}
			}).then(function(){
				next();
			});
			
		}
	}
	return {
		login: login,
		signup: signup
		
	}
}