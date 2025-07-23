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
exports.resetPassword = exports.verifyCode = exports.forgetPassword = void 0;
exports.login = login;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/auth");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const sendEmails_1 = require("../../utils/sendEmails");
const BadRequest_1 = require("../../Errors/BadRequest");
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        const [user] = yield db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, data.email));
        if (!user) {
            throw new Errors_1.UnauthorizedError("Invalid email or password");
        }
        const match = yield bcrypt_1.default.compare(data.password, user.password);
        if (!match) {
            throw new Errors_1.UnauthorizedError("Invalid email or password");
        }
        const token = (0, auth_1.generateToken)({
            id: user.id,
            roles: ["user"],
        });
        (0, response_1.SuccessResponse)(res, { message: "login Successful", token: token }, 200);
    });
}
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const [user] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    if (!user)
        throw new Errors_1.NotFound("User Not Found");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    yield db_1.db
        .delete(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    yield db_1.db.insert(schema_1.emailVerifications).values({ code, userId: user.id });
    yield (0, sendEmails_1.sendEmail)(email, "Password Reset Code", `Your reset code is: ${code}\nIt will expire in 2 hours.`);
    (0, response_1.SuccessResponse)(res, { message: "code sent succefully" }, 200);
});
exports.forgetPassword = forgetPassword;
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = req.body;
    const [user] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const [rowCode] = yield db_1.db
        .select()
        .from(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    if (!rowCode || rowCode.code !== code)
        throw new BadRequest_1.BadRequest("Invalid email or reset code");
    yield db_1.db
        .delete(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    (0, response_1.SuccessResponse)(res, { message: "Code verified successfully" }, 200);
});
exports.verifyCode = verifyCode;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password } = req.body;
    password = yield bcrypt_1.default.hash(password, 10);
    yield db_1.db.update(schema_1.users).set({ password }).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    (0, response_1.SuccessResponse)(res, { message: "Password Updated Successfully" });
});
exports.resetPassword = resetPassword;
