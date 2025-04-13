"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = exports.TagModel = exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ObjectId = mongoose_1.default.Schema.ObjectId;
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    link: { type: String },
    share: { type: Boolean, default: false }
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
const ContentSchema = new Schema({
    userId: { type: ObjectId, ref: 'User' },
    type: { type: String, enum: ["image", "video", "audio", "article", "youtube", "twitter"] },
    tags: { ref: 'Tag', type: ObjectId },
    title: { type: String, required: true },
    link: { type: String },
});
exports.ContentModel = mongoose_1.default.model('Content', ContentSchema);
const TagSchema = new Schema({
    title: { type: [String], default: [] }
});
exports.TagModel = mongoose_1.default.model('Tag', TagSchema);
const LinkSchema = new Schema({
    userId: { type: ObjectId, ref: 'User', required: true },
    hash: { type: String, required: true },
});
exports.LinkModel = mongoose_1.default.model('Link', LinkSchema);
