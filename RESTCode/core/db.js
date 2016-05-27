var pg = require("pg");
var settings=require("../settings");
   
exports.executeSql=function(sql,callback){
var client = new pg.Client(settings.dbConfig.conString);
  
   client.connect(function(err){
	     if(err) {
    console.log('could not connect to postgres', err);
	 callback(null,err);
		 }
	      var query=client.query(sql);
query.on("row", function (row, result) {
result.addRow(row);
});
query.on("end", function (result) {
console.log(JSON.stringify(result.rows, null, "    "));
callback(result);
});   
   });
   
}
