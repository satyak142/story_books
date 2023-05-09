const express = require('express') ;
const passport = require('passport');
const router = express.Router() ;

// get Auth with Google(/auth/google)
router.get('/google', passport.authenticate('google',{scope:['profile']}))
//get  google auth callback(/auth/google/callback)
router.get('/google/callback', passport.authenticate('google',{failureRedirect:'/'}),(req,res) => {
    res.redirect('/dashboard')
})
//get logout user(/auth/logout)
router.get('/logout',(req,res) => {
    req.logout(function(err){
        if(err) return next(err);
        res.redirect('/');
    })
})

module.exports = router ;