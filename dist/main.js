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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
        const TagData = yield User_1.TagModel.create({ title: data.tags });
        yield User_1.ContentModel.create({ title: data.title, link: data.link, type: data.type, userId: userData, tags: TagData._id });
        return res.status(200).json({ msg: "Conetent created" });
    }
    catch (err) {
        return res.status(500).json({ msg: " Server error while cretaing content" });
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
