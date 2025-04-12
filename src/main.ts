import express, { Request } from 'express'
import mongoose, { ObjectId } from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import z, { string } from 'zod'
import { UserModel, ContentModel, TagModel } from './models/User'
import { UserValidation, User } from './validation/user'
import cookieParser from 'cookie-parser'
import { Authorization } from './middlware'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))


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
        console.log(userData)
        const data: { title: string, link: string, tags: string[], type: string } = req.body
        if (!data.title || !data.link || !data.type || !data.tags) {
            return res.status(404).json({ sucess: false, msg: "All fields should be filled" })
        }
        const TagData = await TagModel.create({ title: data.tags })
        console.log(TagData)
        await ContentModel.create({ title: data.title, link: data.link, type: data.type, userId: userData, tags: TagData._id })
        return res.status(200).json({ msg: "Conetent created" })

    } catch (err) {
        return res.status(500).json({ msg: " Server error while cretaing content" })
    }
})

app.get('/content', Authorization, async (req: UserRequest, res) => {
    try {
        const userId = req.user
        const AllContent = await ContentModel.find({ userId: userId }).populate([{ path: 'userId', model: 'User', select: 'email' }, { path: 'tags', model: 'Tag', select: 'title' }])
        return res.status(200).json({ content: AllContent })



    } catch (err) {
        return res.status(500).json({ msg: " Server error while getting content" })
    }
})


app.delete('/content/:contentId', Authorization, async (req: UserRequest, res) => {
    try {
        const userId = req.user
        const contentId = req.params.contentId
        await ContentModel.findOneAndDelete({ userId: userId, _id: contentId })
        return res.status(200).json({ msg: "Deleted Sucessfully" })

    } catch (err) {
        return res.status(500).json({ msg: " Server error while getting content" })

    }
})

app.post('/share', Authorization, async (req: UserRequest, res) => {
    try {
        const userId = req.user
        const context: { share: boolean } = req.body
        const ContentData = await ContentModel.find({ userId })

        if (!ContentData) {
            return res.status(400).json({ msg: "Cannot share" })
        }
        const User = await UserModel.findOne({ _id: userId })

        if (!User) {
            return res.status(404).json({ msg: "No User Found" })
        }

        if (context.share) {
            if (User.link) {
                return res.status(200).json({ msg: `http://localhost:500/${User?.link}` })
            }
            User.share = true
            const id = crypto.randomUUID().replace(/-/g, '')
            User.link = id
            await User.save()
            return res.status(200).json({ msg: `http://localhost:500/${id}` })
        } else {
            User.share = false
            User.link = undefined
            await User.save()
            return res.status(200).json({ msg: "Post Disabled" })

        }



    } catch (err) {
        return res.status(500).json({ msg: " Server error while gettin sharing" })

    }
})


interface PopulatedUserEmail {
    email: string
}
interface Popultaedtag {
    title: [string]
}
interface PopulatedAray {
    userId: PopulatedUserEmail
    tags: Popultaedtag
    title: string
    link: string
    type: string

}


app.get('/:slug/:sharelink', async (req, res) => {
    try {
        const data = req.params.sharelink
        if (!data) {
            return res.status(400).json("No Brain found")
        }
        const Data = await ContentModel.findOne({ link: data }).populate([{ path: 'userId', select: 'email' }, { path: 'tags', select: 'title' }]) as unknown as PopulatedAray
        if (!Data) {
            return res.status(400).json("No Data found")
        }
        return res.status(200).json({
            username: Data.userId?.email, content: {
                title: Data.title,
                link: Data.link,
                type: Data.type,
                tags: Data.tags?.title
            }
        })

    } catch (err) {
        return res.status(500).json({ msg: " Server error while getting sharing" })
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