const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Database connected: ${conn.connection.host}`);
    } catch(error) {
        throw new Error(error);
    }
};
module.exports = dbConnect;

