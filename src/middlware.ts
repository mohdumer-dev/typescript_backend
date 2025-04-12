import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { UserModel } from './models/User'
import { any } from 'zod'
import mongoose, { ObjectId } from 'mongoose'

interface CustomRequest extends Request {

    user?:mongoose.Types.ObjectId; // or whatever type you're attaching
}


export const Authorization = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(400).json({ msg: "Log in Please" })
        }

        const JWT = jwt.verify(token, "MAA") as { _id: ObjectId }
        const User = await UserModel.findOne({ _id: JWT._id })
        if (!User) {
            return res.status(404).json({ msg: "User doesnot exist " })
        }
        req.user = User._id
        next()

    } catch (err) {
        return res.status(500).json({ msg: "Server down" })
    }
}