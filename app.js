const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

require("dotenv").config();

// this code is used to access the body properties of DOM
// to extract GET/POST requests

app.use(cors());

const port = 8080;

const options = {
	key: fs.readFileSync(
		"/etc/letsencrypt/live/covid19.philippos-makridis.dev/privkey.pem"
	),
	cert: fs.readFileSync(
		"/etc/letsencrypt/live/covid19.philippos-makridis.dev/fullchain.pem"
	),
};

const { Pool } = require("pg");

const connection = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	port: 5432,
	ssl: false,
});

// Function to run SQL query with parameterized input
function sqlQuery(date, callback) {
	const query = "SELECT iso2, cases FROM covid_data WHERE dates = $1"; // Correctly parameterized query
	connection.query(query, [date], function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results.rows); // Use `results.rows` for data
		}
	});
}

// Express route to handle API requests
app.get("/api/data/", (req, res) => {
	let date = req.query.date;

	if (!date) {
		return res.status(400).send("Date query parameter is required");
	}

	// Remove surrounding quotes if present
	date = date.replace(/^"(.*)"$/, "$1");

	// Validate date format (simple YYYY-MM-DD format check)
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return res.status(400).send("Invalid date format. Expected YYYY-MM-DD");
	}

	sqlQuery(date, function (error, results) {
		if (error) {
			console.error(error);
			res.status(500).send("Internal Server Error");
		} else {
			res.json(results); // Send JSON response
		}
	});
});

// Create HTTPS server
const server = https.createServer(options, app);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
