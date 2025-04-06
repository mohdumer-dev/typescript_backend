import express, { Request } from 'express'
import mongoose, { ObjectId } from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import z, { string } from 'zod'
import { UserModel, ContentModel, TagModel } from './models/User'
import { UserValidation, User } from './validation/user'
import cookieParser from 'cookie-parser'
import { Authorization } from './middlware'

const app = express()

app.use(express.json())
app.use(cookieParser())


interface UserRequest extends Request {
    user?: string
}

app.post('/signup', async (req, res) => {
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

app.post('/signin', async (req, res) => {
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

        res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24 * 7 }).status(200).json({ msg: "User Login" })

    } catch (err) {
        return res.status(500).json({ msg: " Server error while signin" })
    }
})

app.post('/create', Authorization, async (req: UserRequest, res) => {
    try {
        // zod validation
        const userData = req.user
        const data: { title: string, link: string, tags: string[], type: string } = req.body
        const TagData = await TagModel.create({ title: data.tags })
        await ContentModel.create({ title: data.title, link: data.link, type: data.type, userId: userData, tags: TagData._id })
        return res.status(200).json({ msg: "Conetent created" })

    } catch (err) {
        return res.status(500).json({ msg: " Server error while cretaing content" })
    }
})

app.get('/', (req, res) => {
    res.send('<h1>Madarchod chal raha hoon</h1>')
})




app.listen(500, () => {
    console.log("Server is working fine")
})

import Db from "./db"
Db()