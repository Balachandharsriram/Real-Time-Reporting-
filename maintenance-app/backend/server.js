const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Socket
io.on("connection", (socket) => {
  console.log("User connected");
});

// Test Route
app.get("/", (req, res) => {
  res.send("API Running");
});
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
