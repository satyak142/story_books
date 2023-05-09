const express = require('express') ;
const router = express.Router() ;
const {ensureAuth} = require('../middleware/auth')

const Story = require('../models/story')

// get show add page(/stories/add)
router.get('/add', ensureAuth,(req,res) => {
    res.render('stories/add')
})

// post process add form (/stories)
router.post('/', ensureAuth, async (req,res)=>{
    try {
        req.body.user = req.user.id;
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        return res.render('error/500')
    }
})

//get show all stories(/stories)
router.get('/', ensureAuth,async (req, res) => {
    try {
        const stories = await Story.find({status:'public'})
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();

        res.render('stories/index',{
            stories,
        })
        
    } catch (error) {
        console.log(error)
        return res.render('error/500')
    }
})


//get show single stories(/stories/:id)
router.get('/:id', ensureAuth,async (req, res) => {
    try {
        const story = await Story.findOne({ _id : req.params.id})
            .populate('user')
            .lean();
        if(!story){
            return res.render('error/404')
        }
        res.render('stories/show',{story})
        
    } catch (error) {
        console.log(error)
        return res.render('error/404')
    }
})

//get edit stories(/stories/edit/:id)
router.get('/edit/:id', ensureAuth,async (req, res) => {
    try {
        const story = await Story.findOne({ _id : req.params.id }).lean();
        if (!story) {
            return res.render('error/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit',{story})
        }
    } catch (error) {
        console.log(error)
        return res.render('error/500')
    }
})

// put update story(/stories/:id)
router.put('/:id', ensureAuth, async (req,res) => {
    try {
        let story = await Story.findById(req.params.id).lean();
        if(!story){
            return res.render('error/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else{
            story = await Story.findByIdAndUpdate({_id: req.params.id}, req.body, {
                new:true,
                runValidators:true
            })
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.log(error);
        return res.render('error/500')
    }
})


//DELETE  delete a story(/stories/:id)
router.delete('/:id', ensureAuth, async (req,res) => {
    try {
        await Story.deleteOne({ _id : req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        return res.render('error/500')
    }
})

//get user stories(/stories/user/:userid)
router.get('/user/:userId', ensureAuth,async (req, res) => {
    try {
        const stories = await Story.find({ 
            user : req.params.userId,  
            status : 'public'  })
            .populate()
            .lean();
        
        res.render('stories/index',{stories})
        
    } catch (error) {
        console.log(error)
        return res.render('error/500')
    }
})

module.exports = router ;