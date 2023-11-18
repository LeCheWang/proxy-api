const express = require("express")
const cors = require("cors");
const app = express()

const connectDB = require("./configs/database")
const router = require("./routers")

app.set('trust proxy', true);
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

connectDB();
router(app)

app.listen(8080, ()=>{
    console.log("server run at port 5000");
})
