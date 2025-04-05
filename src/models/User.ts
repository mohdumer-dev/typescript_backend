import mongoose from "mongoose";
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.ObjectId

const UserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
})

export const UserModel = mongoose.model('User', UserSchema)

const ContentSchema = new Schema({
    userId: { type: ObjectId, ref: 'User' },
    link: { type: String },
    type: { type: String, enum: ["image", "video", "audio", "article"] },
    tags: [{ ref: 'Tag', type: ObjectId }]
})


export const ContentModel = mongoose.model('Content', ContentSchema)


const TagSchema = new Schema({
    title: { type: String }
})

export const TagModel=mongoose.model('Tag',TagSchema)


const LinkSchema = new Schema({
    userId: { type: ObjectId ,ref:'User',required:true},
    hash:{type:String,required:true},
})

export const LinkModel=mongoose.model('Link',LinkSchema)