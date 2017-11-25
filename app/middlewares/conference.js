module.exports = function (models) {
    return {
        getConferenceView: function() {
            
            return function (req, res) {
                var conferenceId = req.params.id;
                models.Conference.findById(conferenceId, function (err, conference) {
                    if (!err && conference) {
                        
                         models.Privilege.findOne({userid: req.session.userid, cid: conference._id}, function(err, privilege){
                            if(!err && privilege) {
                                 res.render("conference/index", {conference: conference, privilege: privilege.privilege});
                            }
                            else if(! privilege) {
                                res.render("conference/index", {conference: conference, privilege:"Ordinary"});
                            }
                            else {
                                //an error happened. probably flash something
                                res.render("conference/index", {conference: conference, privilege:""});
                            }
                        });
                    }
                    else {
                        //show some error
                    }
                })
            }
        },
        saveConference: function() {
            return function(req, res) {
                var conferenceId = req.params.id;
            
                models.Conference.findById(conferenceId, function(err, conference) {
                   conference.set('name', req.body.name);
                   conference.set('startDate', req.body.startDate);
                   conference.set('endDate', req.body.endDate);
                   conference.save(function(err,savedConference) {
                       if(!err && savedConference) {
                           res.json({
                               'status': "ok",
                               'target': "/"
                           })
                       }
                   });
                });
            }
        },
        getEditView: function() {
            
            return function(req, res) {
                var conferenceId = req.params.id;
                models.Conference.findById(conferenceId, function(err, conference){
                    if (!err && conference) {
                        
                         models.Privilege.findOne({userid: req.session.userid, cid: conference._id}, function(err, privilege){
                            if(!err && privilege) {
                                 res.render("edit/conference", {conference: conference, privilege: privilege.privilege});
                            }
                            else if(! privilege) {
                                res.render("edit/conference", {conference: conference, privilege:"Ordinary"});
                            }
                            else {
                                //an error happened. probably flash something
                                res.render("edit/conference", {conference: conference, privilege:""});
                            }
                        });
                    }
                    else {
                        //show some error
                    }
                })    
            }
        }
    }
}

