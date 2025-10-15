const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const userRoutes = require('./routes/userRoutes')
const { errorHandler } = require('./middelware/errorHandler');
const morgan = require("morgan");
const helmet = require("helmet");


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

app.use('/api/users', userRoutes);
app.use(errorHandler);


// Test route
app.get("/", (req, res) => {
  res.send("Vendora Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
