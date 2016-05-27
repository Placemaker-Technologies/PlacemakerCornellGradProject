var fs=require('fs');
var fPath="../ImageStore/";


exports.insertImage=function(image,name){
	fPath+=""+name+".jpeg";
	var f=fs.createWriteStream(fPath);
	f.write(image);
	f.end();
	return fPath;
};