var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// INDEX - show all campgrounds
router.get("/", function(req, res) {

    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {

            /*
            console.log(Object.keys(allcampgrounds[0]));
            console.log(getKeys(allcampgrounds[0]));
            console.log(allcampgrounds[0]);     //doubt: _id, name, image, descriptoin etc are not immediate properties of this object. Then why are they being printed?
            */

            res.render("campgrounds/index", { campgrounds: allCampgrounds });
        }
    });

});


// CREATE - add new campground to Database
router.post("/", middleware.isLoggedIn, function(req, res) {
    // get data from form and add to campground array
    // redirect back to campgrounds page

    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, image: image, description: desc, author: author };

    // Create a new Campground and save to database
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            res.redirect("/campgrounds");
        }
    });

});


// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//  SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    //render show template with that campground
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(error);
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            //now inside of foundCampgrounds we also have comments.
            res.render("campgrounds/show", { campground: foundCampground });
        }

    });

});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground successfully edited");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect somewhere (show page)
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground successfully deleted");
            res.redirect("/campgrounds");
        }
    });
});



module.exports = router;