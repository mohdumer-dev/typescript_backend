import mongoose from "mongoose"

const Db = async () => {
    await mongoose.connect('mongodb+srv://umer:7JeFHoBqTX4PbdIp@amazon.eitro.mongodb.net/second-brain').then(() => {
        console.log("Database COnnected")
    }).catch((err) => { console.log(err) })
}
export default Db