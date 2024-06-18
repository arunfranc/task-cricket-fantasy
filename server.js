const express = require("express");
const mongoose = require("mongoose");
const mainRoutes = require('./app/routes/main.routes');
const cors = require('cors'); 

const app = express();

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});



app.use(cors());
app.use(express.json());
app.use('/api', mainRoutes);
// require("./app/routes/main.routes")(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}.`);
});