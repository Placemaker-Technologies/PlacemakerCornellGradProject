var uuid = require('node-uuid');
var db=require("../core/db");
var self=require("./images");
var AWS=require("../core/S3-upload");


exports.getUserProfile=function(req,resp){
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	var query="SELECT * from ImagePost i where i.user_id="+UserID+" order by currTime desc;";
	console.log(query);
	db.executeSql(query,function(data,err){
		if(err){
			console.log(err);
		}
		else {
		resp.writeHead(200,{"Content-Type":"application/json"});
		resp.write(JSON.stringify(data.rows) + "\n");			
		resp.end();
		}
		
	});
};
exports.getUserFeed=function(req,resp){
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
		db.executeSql("select * from ImagePost i where i.user_id="+UserID+" or exists( select 1 from Relationship r where r.follower="+UserID +" and r.follows=i.user_id) order by currTime desc;",function(data,err){
		if(err){
			console.log(err);
		}
		else {
		resp.writeHead(200,{"Content-Type":"application/json"});
		resp.write(JSON.stringify(data.rows) + "\n");			
		resp.end();
		}
		
	});
};
exports.getOtherUserProfile=function(req,resp){
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	var OtherID= (req.body.OtherId).replace(/"/g,'');
	db.executeSql("select * from ImagePost i where i.user_id="+OtherID+" and exists( select 1 from Relationship r where r.follower="+UserID +" and r.follows=i.user_id) order by currTime desc;",function(data,err){
		if(err){
			console.log(err);
		}
		else {
		resp.writeHead(200,{"Content-Type":"application/json"});
		resp.write(JSON.stringify(data.rows) + "\n");			
		resp.end();
		}
		
	})
};
	
	exports.likePost=function(req,resp){
	var UserID= (req.body.user_id).replace(/"/g,'');
		var UserID= "'"+UserID.replace(/'/g,'')+"'";
	console.log(UserID);
	var imgID= (req.body.post_id).replace(/"/g,'');
	console.log(imgID);
	var query="UPDATE ImagePost SET favorite_UserID = ltrim(favorite_UserID||':'||"+UserID+", ':'),favorite_count=favorite_count+1 where id="+Number(imgID);
	console.log(query);
	
	db.executeSql(query, function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row updated  ' + req.body.user_id);
						resp.writeHead(200,{"Content-Type":"application/json"});			
						resp.end(JSON.stringify({"status":"Done"}));
					
 }});

	};

	exports.unlikePost=function(req,resp){
		
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	console.log(UserID);
	var imgID= (req.body.post_id).replace(/"/g,'');
	console.log("UPDATE ImagePost SET favorite_UserID=trim(both ':' from replace((':'||favorite_UserID||':'),':'||"+UserID+"||':',':')),favorite_count=favorite_count-1 where id="+Number(imgID)+" and (':'||favorite_UserID||':') LIKE '%'||"+UserID+"||'%'");	
	db.executeSql("UPDATE ImagePost SET favorite_UserID=trim(both ':' from replace((':'||favorite_UserID||':'),':'||"+UserID+"||':',':')),favorite_count=favorite_count-1 where id="+Number(imgID)+" and (':'||favorite_UserID||':') LIKE '%'||"+UserID+"||'%'",
 function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row updated  ' + req.body.user_id);
					 resp.writeHead(200,{"Content-Type":"application/json"});			
					 resp.end(JSON.stringify({"status":"Done"}));
 }});

	};
	
	
exports.uploadImage=function(myPath,req,resp){
	var url=new AWS.AWSUpload(myPath, function(url,err){
		if (err) {
                    console.log(err);
                }
		else {
		
	console.log(url);
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	console.log(UserID);
	var lat=req.body.latitude.replace(/"/g,'');
	var lon=req.body.longitude.replace(/"/g,'');
	var description=(req.body.caption).replace(/"/g,'')
	var location="ST_GeomFromText('POINT("+lon+" "+lat+")',4326)";
	var storyname=req.body.location.replace(/"/g,'');
	var query="INSERT INTO ImagePost(user_id,description,favorite_UserID,favorite_count,share_UserID,share_count,geoMapLocation,storyname,currTime,image) values ("+UserID+",'"+description+"','',0,'',0,"+location+",'"+storyname+"',CURRENT_TIMESTAMP,'"+url+"')";
	console.log(query);
	db.executeSql(query, function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row inserted  ' + req.body.user_id); 
					resp.writeHead(200,{"Content-Type":"application/json"});			
					resp.end(JSON.stringify({"status":"Done"}));
					
 }});

		}});
	};	
		
exports.searchByLocation=function(req,resp){
		
	var radius=req.body.radius?req.body.radius:50;//in metres
	console.log(radius);
	var lat=req.body.latitude;
	var lon=req.body.longitude;
	var currGeom="ST_GeomFromText('POINT("+lon+" "+lat+")',4326)";
	db.executeSql("select * from ImagePost i where ST_Distance("+currGeom+",geoMapLocation,true)<="+radius+" order by currTime desc;",function(data,err){
		if(err){
			console.log(err);
		}
		else {
		resp.writeHead(200,{"Content-Type":"application/json"});
		resp.write(JSON.stringify(data.rows) + "\n");			
		resp.end();
		}
		
	})
};

exports.followUser=function(req,resp){		
	var followerID= (req.body.user_id).replace(/"/g,'');
	var followerID= "'"+followerID.replace(/'/g,'')+"'";
	var followsID= (req.body.OtherId).replace(/"/g,'');
	var followsID= "'"+followsID.replace(/'/g,'')+"'";
	var query="WITH upsert AS(UPDATE Relationship SET friends='t' WHERE follower="+followsID+" AND follows="+followerID+" RETURNING friends) INSERT INTO Relationship (follower, follows, friends) SELECT "+followerID+","+followsID+",COALESCE(upsert.friends,foo.friends) from upsert RIGHT JOIN (select 'f'::boolean as friends) AS foo on true;"
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row updated  ' + req.body.user_id);
					resp.writeHead(200,{"Content-Type":"application/json"});			
					resp.end(JSON.stringify({"status":"Done"}));
 }});

	};
	
exports.unfollowUser=function(req,resp){		
	var followerID= (req.body.user_id).replace(/"/g,'');
	var followerID= "'"+followerID.replace(/'/g,'')+"'";
	var followsID= (req.body.OtherId).replace(/"/g,'');
	var followsID= "'"+followsID.replace(/'/g,'')+"'";
	var query="WITH upsert AS(delete from Relationship WHERE follower="+followerID+" AND follows="+followsID+" RETURNING *) UPDATE Relationship r SET friends='f' from upsert where upsert.friends='t'and r.follower=upsert.follows and r.follows=upsert.follower;"
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row updated  ' + req.body.user_id);
					resp.writeHead(200,{"Content-Type":"application/json"});			
					resp.end(JSON.stringify({"status":"Done"}));
 }});

	};
	
	
 exports.sharePost=function(req,resp){
		
	var UserID= (req.body.user_id).replace(/"/g,'');
	//var UserID= "'"+UserID.replace(/'/g,'')+"'";
	var imgID= (req.body.post_id).replace(/"/g,'');
	var query="WITH upsert AS(UPDATE ImagePost SET share_UserID = ltrim(share_UserID||':'||'"+UserID+"', ':'),share_count=share_count+1 WHERE id="+imgID+" RETURNING *) INSERT INTO ImagePost (user_id,image,currTime,description,favorite_UserID,favorite_count,share_UserID,share_count,geoMapLocation) SELECT '"+UserID+"',image,CURRENT_TIMESTAMP,description,'',0,'',0,geoMapLocation from upsert;"
	console.log(query);
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row updated  ' + req.body.user_id);
					resp.writeHead(200,{"Content-Type":"application/json"});			
					resp.end(JSON.stringify({"status":"Done"}));
 }});

	};
	
exports.deletePost=function(req,resp){
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	var imgID= (req.body.post_id).replace(/"/g,'');
	var query="delete from ImagePost where id="+imgID+" and user_id='"+UserID+"'";
	console.log(query);
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row updated  ' + req.body.user_id);
					resp.writeHead(200,{"Content-Type":"application/json"});			
					resp.end(JSON.stringify({"status":"Done"}));
 }});

	};
	
	exports.blockPost=function(req,resp){
	var UserID= (req.body.user_id).replace(/"/g,'');
	var imgID= (req.body.post_id).replace(/"/g,'');
	 
	var query="UPDATE Users SET blockedPosts=ltrim(blockedPosts||':'||"+imgID+", ':') WHERE user_id='"+UserID+"'";
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row inserted  ' + req.body.user_id); 
					self.getUserFeed(req,resp);
					
 }});

	};
	
	
	exports.collectedFeed=function(req,resp){
			
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	var radius=req.body.radius?req.body.radius:50;//in metres
	var lat=req.body.latitude;
	var lon=req.body.longitude;
	var lastImgID=req.body.lastImgId?req.body.lastImgId:"";
	console.log("last"+lastImgID);
	var currGeom="ST_GeomFromText('POINT("+lon+" "+lat+")',4326)";
			
			
	var query=	
"select B.id post_id,user_id,COALESCE(title,B.firstname||' '||lastname) title,COALESCE(storytype,'single') storytype,COALESCE(D.icon_url,B.icon_url) icon_url,COALESCE(ST_X(geomaplocation),location_long) location_long,COALESCE(ST_Y(geomaplocation),location_lat) location_lat,"+
"COALESCE(image_url,ARRAY[image]) image_url,favorite_count,share_count,(':'||favorite_UserID||':') LIKE '%'||"+UserID+"||'%' liked,description,title location_name,B.currTime "+
"from (SELECT storyname as title,avg(ST_X(geomaplocation)) AS location_long, avg(ST_Y(geomaplocation)) AS location_lat,(array_agg(image))[1] icon_url,array_agg(image) image_url, 'collected'::text storytype FROM "+
 "(SELECT ROW_NUMBER() OVER (PARTITION BY storyname ORDER BY favorite_count desc) AS r,"+
    "geomaplocation,image, storyname  FROM "+
    "ImagePost t where storyname IS NOT NULL and ST_Distance("+currGeom+",geoMapLocation,true)<="+radius+" ) x "+
"WHERE  x.r <= 10 group by storyname) AS D FULL OUTER JOIN "+
"(select x.*,y.firstname,y.lastname,y.icon_url from ImagePost x,users y where x.user_id=y.user_id and storyname IS NULL and ST_Distance("+currGeom+",geoMapLocation,true)<="+radius;
	
	if(lastImgID.length>0)
	query=query+" and B.id<"+lastImgID;
	query=query+" order by currTime desc ) AS B ON D.title=B.storyname limit 10;";
	console.log("query"+query);
	
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    resp.writeHead(200,{"Content-Type":"application/json"});
		resp.write(JSON.stringify(result.rows) + "\n");			
		resp.end();
 }});

	};
	
	exports.collectedFeed1=function(req,resp){
			
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	var radius=req.body.radius?req.body.radius:1000000000;
	var lat=req.body.latitude;
	var lon=req.body.longitude;
	var latestTime=req.body.latestTime?req.body.latestTime.replace(/"/g,''):"";
	var currGeom="ST_GeomFromText('POINT("+lon+" "+lat+")',4326)";
			
			
	var query=	
	"select (S.combo).* from (SELECT CASE array_length((array_agg(image)),1) "+
"WHEN 1 THEN ((array_agg(id))[1],(array_agg(user_id))[1],(array_agg(firstname))[1]||' '||(array_agg(lastname))[1],'single',(array_agg(icon_url))[1],"+
"ST_X((array_agg(geomaplocation))[1]),ST_Y((array_agg(geomaplocation))[1]),"+
"(array_agg(image))[1],(array_agg(favorite_count))[1],(array_agg(share_count))[1],(':'||(array_agg(favorite_UserID))[1]||':') LIKE '%'||"+UserID+"||'%',"+
"(array_agg(description))[1],(array_agg(storyname))[1],(array_agg(currTime))[1])::feedType "+
"ELSE (null,null,storyname,'collected',(array_agg(image))[1],avg(ST_X(geomaplocation)),avg(ST_Y(geomaplocation)),"+
"array_agg(image),null,null,null,null,storyname,max(currTime))::feedType END AS combo FROM (SELECT ROW_NUMBER() OVER (PARTITION BY storyname ORDER BY favorite_count desc) AS r,"+
"id,u.user_id, currTime,description, favorite_userid, favorite_count, share_count,geomaplocation,image, storyname,firstname,lastname,icon_url "+
"FROM ImagePost t,Users u where t.user_id= u.user_id and ST_Distance("+currGeom+",geoMapLocation,true)<="+radius+" ) x "+
"WHERE  x.r <= 10 group by storyname) S"

	if(latestTime.length>0)
	query=query+" where (S.combo).currTime::timestamp<'"+latestTime+"'::timestamp";
	query=query+" order by(S.combo).currTime desc limit 10;";
	console.log("query"+query);
	
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    resp.writeHead(200,{"Content-Type":"application/json"});
		resp.write(JSON.stringify(result.rows) + "\n");			
		resp.end();
 }});

	};
	
	exports.getStory=function(req,resp){
			
	var UserID= (req.body.user_id).replace(/"/g,'');
	var UserID= "'"+UserID.replace(/'/g,'')+"'";
	var radius=req.body.radius?req.body.radius:1000000000;//in metres
	var lat=req.body.latitude;
	var lon=req.body.longitude;
	var lastImgID=req.body.lastImgId?req.body.lastImgId:"";
	var story=(req.body.title).replace(/"/g,'');
	var currGeom="ST_GeomFromText('POINT("+lon+" "+lat+")',4326)";
			
			
	var query=	
"select id post_id,x.user_id,firstname||' '||lastname title,'single' storytype,icon_url,ST_X(geomaplocation) location_long,ST_Y(geomaplocation) location_lat,"+
"array[image] image_url,favorite_count,share_count,(':'||favorite_UserID||':') LIKE '%'||"+UserID+"||'%' liked,description,storyname location_name,currTime::text "+
"from ImagePost x,users y where x.user_id=y.user_id and ST_Distance("+currGeom+",geoMapLocation,true)<="+radius+" and storyname='"+story+"'";
	
	if(lastImgID.length>0)
	query=query+" and id<"+lastImgID;
	query=query+" order by currTime desc limit 10;";
	console.log("query"+query);
	
	db.executeSql(query,function(result,err) {
                if (err) {
                    console.log(err);
                } else {
                    resp.writeHead(200,{"Content-Type":"application/json"});
		resp.write(JSON.stringify(result.rows) + "\n");			
		resp.end();
 }});

	};