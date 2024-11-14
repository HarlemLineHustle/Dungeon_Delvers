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
const passport_1 = __importDefault(require("passport"));
const user_1 = require("../../models/user");
const validation_1 = require("../../models/validation");
exports.default = (router) => {
    router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, user_1.userFromUsername)(req.body.username);
        if (result) {
            req.login(Object.assign(Object.assign({}, result), { username: req.body.username, password: req.body.password }), (err) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    console.log(err);
                    next(err);
                }
                else {
                    try {
                        passport_1.default.authenticate('LocalStrategy')(req, res, function () {
                            delete result.passwordHash;
                            res.status(200).json(result);
                        });
                    }
                    catch (error) {
                        res.status(400).json({
                            message: err.message,
                        });
                    }
                }
            }));
        }
        else {
            res.status(400).json({ message: 'User not found' });
        }
    }));
    router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { error } = (0, validation_1.validateUser)(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        else {
            const { email, username, password } = req.body;
            const passwordHash = yield (0, user_1.generatePasswordHash)(password);
            const result = yield (0, user_1.createUser)(email, passwordHash, username);
            if (result) {
                res.status(201).json({ message: 'User created' });
            }
            else {
                res.status(400).json({ message: 'User not created' });
            }
        }
    }));
};
