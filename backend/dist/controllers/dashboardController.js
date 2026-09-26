"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboardService_1 = require("../services/dashboardService");
class DashboardController {
    static async getStatistics(req, res, next) {
        try {
            const stats = await dashboardService_1.DashboardService.getStatistics(req.profile);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
