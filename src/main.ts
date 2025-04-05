import express from 'express'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import z from 'zod'
import { UserModel } from './models/User'
import { UserValidation } from './validation/user'

const app = express()

app.use(express.json())



type User = z.infer<typeof UserValidation>

app.post('/sigup', async (req, res) => {
    try {
        const { success, error } = UserValidation.safeParse(req.body)
        if (!success) {
            return res.status(411).json({ msg: error?.message })
        }
        const data: User = req.body

        const hashedPassword = bcrypt.hashSync(data.password, 8)

      await UserModel.create({ email: data.email, password: hashedPassword })

        return res.status(200).json({ msg: "User has been created succesfully" })
    } catch (err) {
        return res.status(500).json({ msg: " Server error" })
    }
})

app.post('signin', async (req, res) => {
    try {
        const { success, error } = UserValidation.safeParse(req.body)
        if (!success) {
            return res.status(411).json({ msg: error?.message })
        }
        const User: User = req.body

        const UserData = await UserModel.findOne({ email: User.email })

        if (!UserData || !UserData.password) {
            return res.status(411).json({ msg: "Wrong email or password" });
        }

        const hashedPassword: boolean = bcrypt.compareSync(User.password, UserData?.password)
        if (!hashedPassword) {
            return res.status(411).json({ msg: " Wrong email password" })
        }

        const token = jwt.sign({ _id: UserData._id }, "MAA", { expiresIn: '7d' })

        res.cookie('token', token, { maxAge: 1000 * 60 * 60*2 }).status(200).json({msg:"User Login"})

    } catch (err) {
        return res.status(500).json({ msg: " Server error while signin" })
    }
})


app.listen(500, () => {
    console.log("Server is working fine")
})
const Db = async () => {
    await mongoose.connect('mongodb+srv://umer:7JeFHoBqTX4PbdIp@amazon.eitro.mongodb.net/second-brain').then(() => {
        console.log("Database COnnected")
    }).catch((err) => { console.log(err) })
}
Db()