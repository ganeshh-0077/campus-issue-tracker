"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issueController_1 = require("../controllers/issueController");
const commentController_1 = require("../controllers/commentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const validationSchemas_1 = require("../utils/validationSchemas");
const router = (0, express_1.Router)();
// All issue endpoints require authentication
router.use(authMiddleware_1.authenticateUser);
/**
 * @route   GET /issues
 * @desc    Get all accessible issues with optional filtering & search
 * @access  Authenticated (Student: own, Staff: assigned, Admin: all)
 */
router.get('/', (0, validateMiddleware_1.validate)(validationSchemas_1.IssueQuerySchema, 'query'), issueController_1.IssueController.getIssues);
/**
 * @route   POST /issues
 * @desc    Report a new campus issue
 * @access  Authenticated (Student, Staff, Admin)
 */
router.post('/', (0, validateMiddleware_1.validate)(validationSchemas_1.CreateIssueSchema, 'body'), issueController_1.IssueController.createIssue);
/**
 * @route   GET /issues/:id
 * @desc    Get single issue details
 * @access  Authenticated (Creator, Assignee, Admin)
 */
router.get('/:id', (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), issueController_1.IssueController.getIssueById);
/**
 * @route   PUT /issues/:id
 * @desc    Update issue details
 * @access  Admin, Assignee (Staff), Creator (Student - if Pending)
 */
router.put('/:id', (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), (0, validateMiddleware_1.validate)(validationSchemas_1.UpdateIssueSchema, 'body'), issueController_1.IssueController.updateIssue);
/**
 * @route   DELETE /issues/:id
 * @desc    Delete an issue
 * @access  Admin, Creator (Student - if Pending)
 */
router.delete('/:id', (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), issueController_1.IssueController.deleteIssue);
/**
 * @route   PUT /issues/:id/status
 * @desc    Update status of an issue (Pending -> In Progress -> Resolved -> Closed)
 * @access  Admin, Assigned Staff
 */
router.put('/:id/status', (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), (0, validateMiddleware_1.validate)(validationSchemas_1.UpdateStatusSchema, 'body'), issueController_1.IssueController.updateStatus);
/**
 * @route   PUT /issues/:id/assign
 * @desc    Assign an issue to a staff member
 * @access  Admin only
 */
router.put('/:id/assign', (0, authMiddleware_1.requireRole)(['Admin']), (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), (0, validateMiddleware_1.validate)(validationSchemas_1.AssignIssueSchema, 'body'), issueController_1.IssueController.assignIssue);
/**
 * @route   GET /issues/:id/history
 * @desc    Get status audit history for an issue
 * @access  Authenticated with issue access
 */
router.get('/:id/history', (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), issueController_1.IssueController.getIssueHistory);
/**
 * @route   GET /issues/:id/comments
 * @desc    Get all comments for an issue
 * @access  Authenticated with issue access
 */
router.get('/:id/comments', (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), commentController_1.CommentController.getComments);
/**
 * @route   POST /issues/:id/comments
 * @desc    Post a comment to an issue
 * @access  Authenticated with issue access
 */
router.post('/:id/comments', (0, validateMiddleware_1.validate)(validationSchemas_1.UuidParamSchema, 'params'), (0, validateMiddleware_1.validate)(validationSchemas_1.CreateCommentSchema, 'body'), commentController_1.CommentController.addComment);
exports.default = router;
