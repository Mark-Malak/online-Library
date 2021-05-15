
var express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
var path = require('path');
var app = express();
var fs = require('fs');
const { strict } = require('assert');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
  extended : true 
})) 

// reference to sessions : https://www.youtube.com/watch?v=OH6Z0dJ_Huk&feature=youtu.be
app.use(session({
  name : 'sid' ,
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  secret : ['key1' , 'key2' , 'key3'],
  cookie: { 
    path: '/' ,
    sameSite : 'strict' ,
    
  
  }
}))


//session handling 
function redirectLogin( req , res , next ){
  if(!req.session.userId){
    res.redirect('/')
  }else{
    next()
  }
}
function redirectHome( req , res , next ){
  if(req.session.userId){
    res.redirect('/home') // may need to render 
  }else{
    next()
  }
}


// 1) make a get for evry path 
app.get('/', redirectHome , function (req, res) {
    const {userId} = req.session ;

    res.render('login', { loginMsg: "" });
}
);
//currently logged in user 


app.post('/', redirectHome ,function (req, res) {
  const users = require("./users");
  var found;
  if (req.body.username == "" || req.body.password == "") {
    res.render('login', { loginMsg: "please enter a valid username and password they can't be empty" });
  } else {
    for (var i = 0; i < users.length; i++) {

      if (users[i].username == req.body.username && users[i].password == req.body.password) {
        req.session.userId = users[i].username 
        res.redirect('/home')
        found = true;
        break;
      }
    }
    if (!found) {

      res.render('login', { loginMsg: "this username doesn't appear to exist or you entered a wrong password , please try again" });
    }
  }
  //console.log(req.session.userId);

});

app.get('/dune',  redirectLogin , function (req, res) {
  res.render('dune' ,{err : ""} );
}
);
app.post('/dune', function (req, res) {
  var msg = addToList(req.session.userId ,"Dune", '/dune');
  res.render('dune', { err: msg });
}
);
app.get('/fiction',redirectLogin ,  function (req, res) {
  res.render('fiction');
}
);
app.get('/flies', redirectLogin , function (req, res) {
  res.render('flies' , {err : ""});
}
);
//function to check if book exist 
function isBookExist(arr, book) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].name == book.name) {
      return true;
    }
  }
  return false;
}
// add to list button function 
function addToList(session , bookName, bookRef) {
  book = { name: bookName, ref: bookRef }
  const users = require("./users");
  for (var i = 0; i < users.length; i++) {
    if (users[i].username == getCurrentUser(session).username) {
      if (!(isBookExist(users[i].wishlist, book))) {
        users[i].wishlist.push(book);
        fs.writeFile("users.json", JSON.stringify(users), err => {
          // Checking for errors 
          if (err) throw err;
        });
        return "Book added successfully";
      } else {
        return "This book already exists in your wishlist ! ";
      }
      break;
    }
  }
  //console.log(session);
}

app.post('/flies', function (req, res) {
  var msg = addToList(req.session.userId ,"Lord of the Flies", '/flies');
  res.render('flies', { err: msg });
}
);


app.get('/grapes', redirectLogin , function (req, res) {
  res.render('grapes' ,{err : ""} );
}
);
app.post('/grapes', function (req, res) {
  var msg = addToList(req.session.userId ,"The Grapes of Wrath", '/grapes');
  res.render('grapes', { err: msg });
}
);
app.get('/home', redirectLogin ,  function (req, res) {
  res.render('home');
}
);

app.get('/leaves',redirectLogin ,  function (req, res) {
  res.render('leaves' ,{err : ""} );
}
);
app.post('/leaves', function (req, res) {
  var msg = addToList(req.session.userId ,"Leaves of Grass", '/leaves');
  res.render('leaves', { err: msg });
}
);
app.get('/mockingbird', redirectLogin , function (req, res) {
  res.render('mockingbird' ,{err : ""} );
}
);
app.post('/mockingbird', function (req, res) {
  var msg = addToList(req.session.userId ,"To Kill a Mockingbird", '/mockingbird');
  res.render('mockingbird', { err: msg });
}
);
app.get('/novel', redirectLogin , function (req, res) {
  res.render('novel');
}
);
app.get('/poetry', redirectLogin , function (req, res) {
  res.render('poetry');
}
);

app.get('/readlist', redirectLogin , function (req, res) {
  app.locals.books = getCurrentUser(req.session.userId).wishlist;
  res.render('readlist')

}
);



//for registeration 
app.get('/registration', redirectHome, function (req, res) {
  res.render('registration', { errorMsg: "" });
}
);



app.post('/register', redirectHome ,function (req, res) {

  // var userString = JSON.stringify(userObject);
  //fs.writeFileSync("users.json" , userString );


  //reading the users file reference : https://www.geeksforgeeks.org/how-to-read-and-write-json-file-using-node-js/
  const users = require("./users");
  var userObject = { username: req.body.username, password: req.body.password, wishlist: [] };
  var found = false;

  if (req.body.username == "" || req.body.password == "") {
    res.render('registration', { errorMsg: "please enter a valid username and password they can't be empty" });
  }
  else {
    for (var i = 0; i < users.length; i++) {
      if (users[i].username == req.body.username) {
        res.render('registration', { errorMsg: "This username is already taken! please choose another one " });
        found = true;
        break;
      }
    }

    if (!found) {
      users.push(userObject);
      fs.writeFile("users.json", JSON.stringify(users), err => {

        // Checking for errors 
        if (err) throw err;


      });
      //reference : https://expressjs.com/en/4x/api.html#res.redirect
      res.redirect('/');
    }
  }

}
);




app.get('/searchresults', redirectLogin, function (req, res) {
  res.render('searchresults');
}
);
app.get('/sun', redirectLogin ,function (req, res) {
  res.render('sun' ,{err : ""});
}
);
app.post('/sun', function (req, res) {
  var msg = addToList(req.session.userId ,"The Sun and Her Flowers", '/sun');
  res.render('sun', { err: msg });
}
);

// a list of all book objects 
allBooks = [
  { "name": "Lord of the Flies", "ref": "/flies" },
  { "name": "The Grapes of Wrath", "ref": "/grapes" },
  { "name": "To Kill a Mockingbird", "ref": "/mockingbird" },
  { "name": "Dune", "ref": "/dune" },
  { "name": "Leaves of Grass", "ref": "/leaves" },
  { "name": "The Sun and Her Flowers", "ref": "/sun" }
];


app.post('/search', function (req, res) {
  var result = [];
  var keyword = req.body.Search;

  for (var i = 0; i < allBooks.length; i++) {
    if (((allBooks[i].name).toLowerCase()).includes(keyword.toLowerCase())) {
      result.push(allBooks[i])
    }
  }
  app.locals.result = result;
  res.render('searchresults');
}
);

function getCurrentUser(name){
  const users = require("./users");
  for(var i = 0 ; i < users.length;i++){
    if(users[i].username == name ){
      //console.log(name);
      return users[i];
      
    }
  }
}


// app.listen(process.env.PORT || 3000, function () {
//   console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// }); 

if (process.env.PORT) {
  app.listen(process.env.PORT, function () { console.log('Server started') });
} else {
  app.listen(3000, function () { console.log('Server started on port 3000') })
}




//   Git add .
//   Git commit -m "second trial"
//   heroku git:remote -a blooming-thicket-32407
//   Git push heroku master
//   heroku open 
