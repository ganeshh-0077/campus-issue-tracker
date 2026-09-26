"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
/**
 * @route   GET /dashboard/statistics
 * @desc    Get counts and metrics aggregated by status, priority, and category
 * @access  Authenticated
 */
router.get('/statistics', dashboardController_1.DashboardController.getStatistics);
exports.default = router;
