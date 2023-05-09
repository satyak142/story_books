const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db')

const app = express();


// load config
dotenv.config({path:'./config/config.env'})

// passport config
require('./config/passport')(passport)

//mongodb
connectDB()

// body parser
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

// handlebars helpers
const{ formatDate, truncate, striptags, editIcon, select } = require('./helpers/hbs')

// handlebars
app.engine('.hbs', exphbs.engine({
    helpers:{formatDate, truncate, striptags, editIcon, select},
    defaultLayout:'main',
    extname:'.hbs'
})
);
app.set('view engine', '.hbs');

//express-session middleware
app.use(
    session({
        secret:'keyboard cat',
        resave: false,
        saveUninitialized:false,
        store: MongoStore.create({
            mongoUrl : process.env.MONGO_URI
        })
    })
)

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set global variable
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

// static
app.use(express.static(path.join(__dirname,'public')));

// routes
app.use('/',require('./routes/index'));
app.use('/auth',require('./routes/auth'));
app.use('/stories',require('./routes/stories'));



if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


const PORT = process.env.PORT ;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})



