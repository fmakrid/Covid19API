const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");

require("dotenv").config();

// this code is used to access the body properties of DOM
// to extract GET/POST requests

app.use(cors());

const port = 8080;

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	ssl: { rejectUnauthorized: true },
	dateStrings: true,
});

// This runs an sql query, cleans the results
// and outputs them in the specified file as needed
function sqlQuery(date, callback) {
	const query = `SELECT iso2,cases FROM covid19 WHERE dates=${date}`;
	connection.query(query, function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results);
		}
	});
}

app.get("/api/data/", (req, res) => {
	const date = req.query.date;
	sqlQuery(date, function (error, results) {
		if (error) {
			console.error(error);
		} else {
			res.send(results);
		}
	});
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
