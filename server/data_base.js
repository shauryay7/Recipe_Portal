const mysql = require('mysql2');
const dotenv = require('dotenv'); 
dotenv.config();
const mysql_connection = mysql.createConnection({
	host:process.env.DB_HOST,
	user:process.env.DB_USER,
	password:process.env.DB_PASSWORD,
	database:process.env.DB,
	multipleStatements:true

});

// Make the connection with the database
mysql_connection.connect((err)=>{
	if(!err){
		console.log("database connected");
	}else{
		console.log(err);
	}
});

module.exports = mysql_connection;
