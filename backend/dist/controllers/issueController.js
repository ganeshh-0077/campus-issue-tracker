"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueController = void 0;
const issueService_1 = require("../services/issueService");
class IssueController {
    static async getIssues(req, res, next) {
        try {
            const filters = req.query;
            const issues = await issueService_1.IssueService.getIssues(filters, req.profile);
            res.json({
                success: true,
                count: issues.length,
                data: issues,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getIssueById(req, res, next) {
        try {
            const id = req.params.id;
            const issue = await issueService_1.IssueService.getIssueById(id, req.profile);
            res.json({
                success: true,
                data: issue,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createIssue(req, res, next) {
        try {
            const issue = await issueService_1.IssueService.createIssue(req.body, req.profile);
            res.status(201).json({
                success: true,
                message: 'Issue created successfully',
                data: issue,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateIssue(req, res, next) {
        try {
            const id = req.params.id;
            const updated = await issueService_1.IssueService.updateIssue(id, req.body, req.profile);
            res.json({
                success: true,
                message: 'Issue updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const id = req.params.id;
            const { status } = req.body;
            const updated = await issueService_1.IssueService.updateStatus(id, status, req.profile);
            res.json({
                success: true,
                message: `Issue status updated to ${status}`,
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async assignIssue(req, res, next) {
        try {
            const id = req.params.id;
            const rawAssignee = req.body.assigned_to !== undefined ? req.body.assigned_to : req.body.staff_id;
            const assigned_to = rawAssignee && rawAssignee.trim() !== '' ? rawAssignee : null;
            const updated = await issueService_1.IssueService.assignIssue(id, assigned_to, req.profile);
            res.json({
                success: true,
                message: assigned_to ? 'Issue assigned successfully' : 'Issue unassigned',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteIssue(req, res, next) {
        try {
            const id = req.params.id;
            await issueService_1.IssueService.deleteIssue(id, req.profile);
            res.json({
                success: true,
                message: 'Issue deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getIssueHistory(req, res, next) {
        try {
            const id = req.params.id;
            const history = await issueService_1.IssueService.getIssueHistory(id, req.profile);
            res.json({
                success: true,
                data: history,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.IssueController = IssueController;
