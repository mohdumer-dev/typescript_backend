"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UserValidation = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8).refine((val) => {
        return (/[A-Z]/.test(val) && // uppercase
            /[a-z]/.test(val) && // lowercase
            /[^a-zA-Z0-9]/.test(val) // special character
        );
    }, {
        message: "Password must contain at least one uppercase, one lowercase, and one special character.",
    })
});
