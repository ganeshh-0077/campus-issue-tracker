"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const supabaseClient_1 = require("../utils/supabaseClient");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const issueService_1 = require("./issueService");
let memoryComments = [
    {
        id: 'e0000000-0000-0000-0000-000000000001',
        issue_id: 'd0000000-0000-0000-0000-000000000001',
        user_id: 'b0000000-0000-0000-0000-000000000001',
        comment: 'I ran a hardware diagnostic remotely. Replacing the GPU driver today at 2 PM.',
        created_at: new Date(Date.now() - 40000000).toISOString(),
        user: {
            id: 'b0000000-0000-0000-0000-000000000001',
            name: 'James Wilson',
            email: 'james.staff@campus.edu',
            role: 'Staff',
        },
    },
];
class CommentService {
    /**
     * Retrieves all comments for an issue, verifying user has access.
     */
    static async getComments(issueId, profile) {
        await issueService_1.IssueService.getIssueById(issueId, profile);
        try {
            const { data, error } = await supabaseClient_1.supabaseAdmin
                .from('comments')
                .select(`
          *,
          user:profiles!comments_user_id_fkey(id, name, email, role)
        `)
                .eq('issue_id', issueId)
                .order('created_at', { ascending: true });
            if (error) {
                return memoryComments.filter((c) => c.issue_id === issueId);
            }
            return (data || []);
        }
        catch (err) {
            return memoryComments.filter((c) => c.issue_id === issueId);
        }
    }
    /**
     * Adds a new comment to an issue.
     */
    static async addComment(issueId, commentText, profile) {
        await issueService_1.IssueService.getIssueById(issueId, profile);
        try {
            const { data, error } = await supabaseClient_1.supabaseAdmin
                .from('comments')
                .insert({
                issue_id: issueId,
                user_id: profile.id,
                comment: commentText,
            })
                .select(`
          *,
          user:profiles!comments_user_id_fkey(id, name, email, role)
        `)
                .single();
            if (error) {
                const newC = {
                    id: crypto_1.default.randomUUID(),
                    issue_id: issueId,
                    user_id: profile.id,
                    comment: commentText,
                    created_at: new Date().toISOString(),
                    user: profile,
                };
                memoryComments.push(newC);
                return newC;
            }
            return data;
        }
        catch (err) {
            if (err instanceof errorMiddleware_1.AppError)
                throw err;
            const newC = {
                id: crypto_1.default.randomUUID(),
                issue_id: issueId,
                user_id: profile.id,
                comment: commentText,
                created_at: new Date().toISOString(),
                user: profile,
            };
            memoryComments.push(newC);
            return newC;
        }
    }
}
exports.CommentService = CommentService;
