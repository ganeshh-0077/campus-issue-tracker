"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const commentService_1 = require("../services/commentService");
class CommentController {
    static async getComments(req, res, next) {
        try {
            const issueId = req.params.id;
            const comments = await commentService_1.CommentService.getComments(issueId, req.profile);
            res.json({
                success: true,
                count: comments.length,
                data: comments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addComment(req, res, next) {
        try {
            const issueId = req.params.id;
            const { comment } = req.body;
            const created = await commentService_1.CommentService.addComment(issueId, comment, req.profile);
            res.status(201).json({
                success: true,
                message: 'Comment posted successfully',
                data: created,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CommentController = CommentController;
