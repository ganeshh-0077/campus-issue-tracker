"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = app_1.default.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Campus Issue Tracker - Backend API Server     `);
    console.log(` Status: Running at http://localhost:${PORT}   `);
    console.log(` Health Check: http://localhost:${PORT}/api/health `);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
    console.log(`===============================================`);
});
exports.default = server;
