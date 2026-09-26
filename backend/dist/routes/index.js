"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registeredUsers = exports.DEFAULT_STAFF_MEMBERS = exports.DEFAULT_USERS = void 0;
const express_1 = require("express");
const issueRoutes_1 = __importDefault(require("./issueRoutes"));
const dashboardRoutes_1 = __importDefault(require("./dashboardRoutes"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const supabaseClient_1 = require("../utils/supabaseClient");
const router = (0, express_1.Router)();
exports.DEFAULT_USERS = [
    {
        id: 'b0000000-0000-0000-0000-000000000001',
        name: 'James Wilson (IT Support Team)',
        email: 'james.staff@campus.edu',
        role: 'Staff',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
        id: 'b0000000-0000-0000-0000-000000000002',
        name: 'Sarah Jenkins (Facilities Maintenance)',
        email: 'facilities@campus.edu',
        role: 'Staff',
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
        id: 'b0000000-0000-0000-0000-000000000003',
        name: 'Robert Martinez (Electrical Systems)',
        email: 'robert.staff@campus.edu',
        role: 'Staff',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
        id: 'c0000000-0000-0000-0000-000000000001',
        name: 'Alex Chen (Computer Science)',
        email: 'alex.student@campus.edu',
        role: 'Student',
        created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
        id: 'c0000000-0000-0000-0000-000000000002',
        name: 'Emily Watson (Engineering)',
        email: 'emily.student@campus.edu',
        role: 'Student',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
        id: 'c0000000-0000-0000-0000-000000000003',
        name: 'David Kim (Architecture)',
        email: 'david.student@campus.edu',
        role: 'Student',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
        id: 'a0000000-0000-0000-0000-000000000001',
        name: 'Campus Operations Administrator',
        email: 'admin@campus.edu',
        role: 'Admin',
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
];
exports.DEFAULT_STAFF_MEMBERS = exports.DEFAULT_USERS.filter((u) => u.role === 'Staff');
// In-memory registry of users added during application runtime
exports.registeredUsers = [...exports.DEFAULT_USERS];
// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Campus Issue Tracker Backend',
    });
});
// Register / Sync user profile with backend
router.post('/users/sync', (req, res) => {
    const { id, name, email, role } = req.body;
    if (id && name && role) {
        const existingIndex = exports.registeredUsers.findIndex((u) => u.id === id || u.email.toLowerCase() === (email || '').toLowerCase());
        const newProfile = {
            id,
            name,
            email: email || '',
            role,
            created_at: new Date().toISOString(),
        };
        if (existingIndex >= 0) {
            exports.registeredUsers[existingIndex] = newProfile;
        }
        else {
            exports.registeredUsers.push(newProfile);
        }
    }
    res.json({ success: true, message: 'User synced successfully' });
});
// Issues endpoints
router.use('/issues', issueRoutes_1.default);
// Dashboard endpoints
router.use('/dashboard', dashboardRoutes_1.default);
// Helper route for Admins to view staff members for issue assignment
router.get('/users/staff', authMiddleware_1.authenticateUser, (0, authMiddleware_1.requireRole)(['Admin']), async (_req, res) => {
    try {
        if (supabaseClient_1.hasServiceRoleKey) {
            const { data, error } = await supabaseClient_1.supabaseAdmin
                .from('profiles')
                .select('id, name, email, role')
                .in('role', ['Staff', 'Admin'])
                .order('name');
            if (!error && data && data.length > 0) {
                return res.json({
                    success: true,
                    data: data,
                });
            }
        }
        // Return staff & admin users from the registry
        const staffMembers = exports.registeredUsers.filter((u) => u.role === 'Staff' || u.role === 'Admin');
        res.json({
            success: true,
            data: staffMembers.length > 0 ? staffMembers : exports.DEFAULT_STAFF_MEMBERS,
        });
    }
    catch (err) {
        const staffMembers = exports.registeredUsers.filter((u) => u.role === 'Staff' || u.role === 'Admin');
        res.json({
            success: true,
            data: staffMembers.length > 0 ? staffMembers : exports.DEFAULT_STAFF_MEMBERS,
        });
    }
});
// Route for Admins to view full Campus Directory (all Staff & Students)
router.get('/users/directory', authMiddleware_1.authenticateUser, (0, authMiddleware_1.requireRole)(['Admin']), async (_req, res) => {
    try {
        let dbUsers = [];
        if (supabaseClient_1.hasServiceRoleKey) {
            const { data, error } = await supabaseClient_1.supabaseAdmin
                .from('profiles')
                .select('id, name, email, role, created_at')
                .order('name');
            if (!error && data) {
                dbUsers = data;
            }
        }
        const map = new Map();
        exports.DEFAULT_USERS.forEach((u) => map.set(u.id, u));
        exports.registeredUsers.forEach((u) => map.set(u.id, u));
        dbUsers.forEach((u) => map.set(u.id, u));
        const merged = Array.from(map.values());
        const staff = merged.filter((u) => u.role === 'Staff');
        const students = merged.filter((u) => u.role === 'Student');
        const admins = merged.filter((u) => u.role === 'Admin');
        res.json({
            success: true,
            data: {
                staff,
                students,
                admins,
                total: merged.length,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch directory' });
    }
});
exports.default = router;
