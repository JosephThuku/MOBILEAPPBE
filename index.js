const express = require("express");
const bodyParser = require("body-parser");
const dbConnect = require("./config/dbConnect");
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./config/docsConfig');
const swaggerJsDoc = require('swagger-jsdoc');
const YAML = require('yamljs');
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require('./routes/authRoute');


//seeders

const TestAgent = require("supertest/lib/agent");

// Database connection
dbConnect().then(() =>{
  // seedParks();
  // seedSpecies();
});
// Middleware
const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//allow all cors
app.use(cors());

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Routes
app.get("/", (req, res) => {
  res.send("Hello and welcome to LexResumeAi backend to get started visit swagger docs at /api-docs");
});
app.use("/api/v1/auth", authRoutes);




// Start the server
app.listen(PORT, () => {
  console.log(`The server is now accessible at: http://localhost:${PORT}`);
  console.log(`http://localhost:${PORT}`);
  // print the routes
  
});