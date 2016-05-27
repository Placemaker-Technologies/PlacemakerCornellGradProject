var fs=require('fs');
var settings=require("../settings");
var AWS = require('aws-sdk');
var path=require('path');
//var AWS_ACCESS_KEY=settings.aws_settings.accessKey;
//var AWS_SECRET_KEY=settings.aws_settings.secretKey;

exports.AWSUpload=function(file,callback){
	var fileName = path.basename(file);
	//AWS.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
		var s3 = new AWS.S3();		
		fs.readFile(file, function(err, file_buffer){
            var params = {
                Bucket: settings.URL.bucketName,
                Key: fileName,
                Body: file_buffer,
				ACL:"public-read"
            };
		
	s3.putObject(params, function(err) {
        if (err) {
			console.log("S3 uploading error",err);
			callback(null,err);
		}
            console.log('File saved.'+fileName);
			var url="https://"+settings.URL.domain+"/"+settings.URL.bucketName+"/"+fileName;;
			callback(url);
			
        });
    });
	
};

