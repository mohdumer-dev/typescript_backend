"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("./models/User");
const user_1 = require("./validation/user");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const middlware_1 = require("./middlware");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { success, error } = user_1.UserValidation.safeParse(req.body);
        if (!success) {
            return res.status(411).json({ msg: error === null || error === void 0 ? void 0 : error.message });
        }
        const data = req.body;
        const hashedPassword = bcrypt_1.default.hashSync(data.password, 8);
        yield User_1.UserModel.create({ email: data.email, password: hashedPassword });
        return res.status(200).json({ msg: "User has been created succesfully" });
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error" });
    }
}));
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { success, error } = user_1.UserValidation.safeParse(req.body);
        if (!success) {
            return res.status(411).json({ msg: error === null || error === void 0 ? void 0 : error.message });
        }
        const User = req.body;
        const UserData = yield User_1.UserModel.findOne({ email: User.email });
        if (!UserData || !UserData.password) {
            return res.status(411).json({ msg: "Wrong email or password" });
        }
        const hashedPassword = bcrypt_1.default.compareSync(User.password, UserData === null || UserData === void 0 ? void 0 : UserData.password);
        if (!hashedPassword) {
            return res.status(411).json({ msg: " Wrong email password" });
        }
        const token = jsonwebtoken_1.default.sign({ _id: UserData._id }, "MAA", { expiresIn: '7d' });
        res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24 * 7 }).status(200).json({ msg: "User Login" });
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error while signin" });
    }
}));
app.post('/create', middlware_1.Authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // zod validation
        const userData = req.user;
        const data = req.body;
        if (!data.title || !data.link || !data.type || !data.tags) {
            return res.status(404).json({ sucess: false, msg: "All fields should be filled" });
        }
        const TagData = yield User_1.TagModel.create({ title: data.tags });
        yield User_1.ContentModel.create({ title: data.title, link: data.link, type: data.type, userId: userData, tags: TagData._id });
        return res.status(200).json({ msg: "Conetent created" });
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error while cretaing content" });
    }
}));
app.get('/content', middlware_1.Authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const AllContent = yield User_1.ContentModel.find({ userId: userId }).populate([{ path: 'userId', model: 'User', select: 'email' }, { path: 'tags', model: 'Tag', select: 'title' }]);
        return res.status(200).json({ content: AllContent });
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error while getting content" });
    }
}));
app.delete('/content/:contentId', middlware_1.Authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const contentId = req.params.contentId;
        yield User_1.ContentModel.findOneAndDelete({ userId: userId, _id: contentId });
        return res.status(200).json({ msg: "Deleted Sucessfully" });
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error while getting content" });
    }
}));
app.post('/share', middlware_1.Authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const context = req.body;
        const ContentData = yield User_1.ContentModel.find({ userId });
        if (!ContentData) {
            return res.status(400).json({ msg: "Cannot share" });
        }
        const User = yield User_1.UserModel.findOne({ _id: userId });
        if (!User) {
            return res.status(404).json({ msg: "No User Found" });
        }
        if (context.share) {
            if (User.link) {
                return res.status(200).json({ msg: `http://localhost:500/${User === null || User === void 0 ? void 0 : User.link}` });
            }
            User.share = true;
            const id = crypto.randomUUID().replace(/-/g, '');
            User.link = id;
            yield User.save();
            return res.status(200).json({ msg: `http://localhost:500/${id}` });
        }
        else {
            User.share = false;
            User.link = undefined;
            yield User.save();
            return res.status(200).json({ msg: "Post Disabled" });
        }
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error while gettin sharing" });
    }
}));
app.get('/:slug/:sharelink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = req.params.sharelink;
        if (!data) {
            return res.status(400).json("No Brain found");
        }
        const Data = yield User_1.ContentModel.findOne({ link: data }).populate([{ path: 'userId', select: 'email' }, { path: 'tags', select: 'title' }]);
        if (!Data) {
            return res.status(400).json("No Data found");
        }
        return res.status(200).json({
            username: (_a = Data.userId) === null || _a === void 0 ? void 0 : _a.email, content: {
                title: Data.title,
                link: Data.link,
                type: Data.type,
                tags: (_b = Data.tags) === null || _b === void 0 ? void 0 : _b.title
            }
        });
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error while getting sharing" });
    }
}));
app.get('/', (req, res) => {
    res.send('<h1>Madarchod chal raha hoon</h1>');
});
app.listen(500, () => {
    console.log("Server is working fine");
});
const db_1 = __importDefault(require("./db"));
(0, db_1.default)();
