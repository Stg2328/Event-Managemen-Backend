const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./Routes/authRoutes");
const eventRoutes = require("./Routes/eventRoutes");
const { connectdb } = require("./Connection/connection");
require("dotenv").config();

const app = express();

connectdb()
  .then(() => console.log("DB Connected"))
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit(1);
  });

app.use(cors())
app.use(helmet());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

exports.handler = serverless(app);