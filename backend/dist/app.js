"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow cross-origin only in development (when frontend is on a different port).
// In production the frontend is served from the same Express server so CORS
// isn't needed, but we still add it for flexibility.
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
            callback(null, true);
        }
        else {
            callback(null, true); // permissive in dev
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// HTTP request logger (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// ── API ROUTES ─────────────────────────────────────────────────────────────────
// All REST endpoints are mounted under /api
app.use('/api', routes_1.default);
// ── SERVE REACT FRONTEND ──────────────────────────────────────────────────────
// The built React app lives in ../frontend/dist relative to this file.
// In development (tsx watch) __dirname is src/, so we go up one level to backend/
// then up another to the project root and into frontend/dist.
const frontendDistPath = path_1.default.resolve(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDistPath)) {
    // Serve static assets (JS, CSS, images, etc.)
    app.use(express_1.default.static(frontendDistPath));
    // Catch-all: any route that is NOT an /api call should return index.html
    // This enables React Router client-side navigation to work correctly.
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            // Should never reach here, but guard just in case
            res.status(404).json({ success: false, message: 'API route not found' });
            return;
        }
        res.sendFile(path_1.default.join(frontendDistPath, 'index.html'));
    });
    console.log(`[INFO] Serving frontend from: ${frontendDistPath}`);
}
else {
    console.warn(`[WARN] Frontend build not found at ${frontendDistPath}.\n` +
        `       Run 'npm run build' inside the frontend/ folder first.`);
    // Friendly fallback for /
    app.get('/', (_req, res) => {
        res.send('<h2>Campus Issue Tracker API is running.</h2>' +
            '<p>Frontend not built yet. Run <code>npm run build</code> inside <code>frontend/</code>.</p>' +
            '<p>API health: <a href="/api/health">/api/health</a></p>');
    });
}
// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
