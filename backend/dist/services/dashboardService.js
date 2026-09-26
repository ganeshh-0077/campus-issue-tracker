"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const supabaseClient_1 = require("../utils/supabaseClient");
const issueService_1 = require("./issueService");
class DashboardService {
    /**
     * Computes dashboard statistics based on the authenticated user's role scope.
     */
    static async getStatistics(profile) {
        let issues = [];
        if (!supabaseClient_1.hasServiceRoleKey) {
            issues = this.getMemoryStatsIssues(profile);
        }
        else {
            try {
                let query = supabaseClient_1.supabaseAdmin.from('issues').select('status, priority, category');
                if (profile.role === 'Student') {
                    query = query.eq('created_by', profile.id);
                }
                else if (profile.role === 'Staff') {
                    query = query.eq('assigned_to', profile.id);
                }
                const { data, error } = await query;
                if (error) {
                    issues = this.getMemoryStatsIssues(profile);
                }
                else {
                    issues = data || [];
                }
            }
            catch (err) {
                issues = this.getMemoryStatsIssues(profile);
            }
        }
        const stats = {
            total: issues.length,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            critical: 0,
            byCategory: {
                Computer: 0,
                Internet: 0,
                Electricity: 0,
                Classroom: 0,
                Cleaning: 0,
                Furniture: 0,
                Other: 0,
            },
            byPriority: {
                Low: 0,
                Medium: 0,
                High: 0,
                Critical: 0,
            },
        };
        for (const item of issues) {
            if (item.status === 'Pending')
                stats.pending++;
            else if (item.status === 'In Progress')
                stats.inProgress++;
            else if (item.status === 'Resolved' || item.status === 'Closed')
                stats.resolved++;
            if (item.priority === 'Critical')
                stats.critical++;
            if (stats.byPriority[item.priority] !== undefined) {
                stats.byPriority[item.priority]++;
            }
            if (stats.byCategory[item.category] !== undefined) {
                stats.byCategory[item.category]++;
            }
        }
        return stats;
    }
    static getMemoryStatsIssues(profile) {
        let list = [...issueService_1.memoryIssues];
        if (profile.role === 'Student') {
            list = list.filter((i) => i.created_by === profile.id);
        }
        else if (profile.role === 'Staff') {
            list = list.filter((i) => i.assigned_to === profile.id);
        }
        return list;
    }
}
exports.DashboardService = DashboardService;
