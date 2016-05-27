var express=require("express");
var multer = require('multer');
var images= require("./controllers/images");
var bodyParser=require('body-parser')
var uuid = require('node-uuid');
var port = 9000;
var host = '127.0.0.1';
 var app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:true}));
  
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
		console.log(file);
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
			var getFileExt = function(fileName){
                var fileExt = fileName.split(".");
                if( fileExt.length === 1 || ( fileExt[0] === "" && fileExt.length === 2 ) ) {
                    return "";
                }
                return fileExt.pop();
            }
        cb(null, uuid.v4()+'.'+getFileExt(file.originalname))
  }
});
    
var upload = multer({storage: storage});
  
app.post('/uploadPost', upload.single('photo'), function(req, res, next) {
	console.log(req);
    images.uploadImage(req.file.path,req,res);
});

app.post('/ownImageProfile',function(req, res) {
images.getUserProfile(req,res);});
 app.post('/imagesFeed',function(req, res) {
images.getUserFeed(req,res);});
app.post('/otherImageProfile',function(req, res) {
images.getOtherUserProfile(req,res);});
app.post('/likePosts',function(req, res) {
images.likePost(req,res);});
app.post('/unlikePosts',function(req, res) {
images.unlikePost(req,res);});
app.post('/sharePosts',function(req, res) {
images.sharePost(req,res);});
app.post('/deletePosts',function(req, res) {
images.deletePost(req,res);});
app.post('/blockPosts',function(req, res) {
images.blockPost(req,res);});
app.post('/searchLocation',function(req, res) {
images.searchByLocation(req,res);});
app.post('/followUser',function(req, res) {
images.followUser(req,res);});
app.post('/unfollowUser',function(req, res) {
images.unfollowUser(req,res);});
app.post('/getPosts',function(req, res) {
images.collectedFeed1(req,res);});
app.post('/getStory',function(req, res) {
images.getStory(req,res);});


app.post('/users',function(req, res) {
images.insert_records(req,res);});

  
  
  app.listen(port);
console.log("Connected to " + port);