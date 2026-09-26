"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueQuerySchema = exports.CreateCommentSchema = exports.AssignIssueSchema = exports.UpdateStatusSchema = exports.UpdateIssueSchema = exports.CreateIssueSchema = exports.UuidParamSchema = exports.RoleEnum = exports.StatusEnum = exports.PriorityEnum = exports.CategoryEnum = void 0;
const zod_1 = require("zod");
exports.CategoryEnum = zod_1.z.enum([
    'Computer',
    'Internet',
    'Electricity',
    'Classroom',
    'Cleaning',
    'Furniture',
    'Other',
]);
exports.PriorityEnum = zod_1.z.enum(['Low', 'Medium', 'High', 'Critical']);
exports.StatusEnum = zod_1.z.enum(['Pending', 'In Progress', 'Resolved', 'Closed']);
exports.RoleEnum = zod_1.z.enum(['Student', 'Staff', 'Admin']);
exports.UuidParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid ID format: must be a valid UUID' }),
});
exports.CreateIssueSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, { message: 'Title must be at least 3 characters long' })
        .max(150, { message: 'Title cannot exceed 150 characters' }),
    description: zod_1.z
        .string()
        .min(3, { message: 'Description must be at least 3 characters long' })
        .max(3000, { message: 'Description cannot exceed 3000 characters' }),
    category: exports.CategoryEnum,
    priority: exports.PriorityEnum.default('Medium'),
    location: zod_1.z
        .string()
        .min(2, { message: 'Location must be at least 2 characters long' })
        .max(150, { message: 'Location cannot exceed 150 characters' }),
});
exports.UpdateIssueSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, { message: 'Title must be at least 3 characters long' })
        .max(150, { message: 'Title cannot exceed 150 characters' })
        .optional(),
    description: zod_1.z
        .string()
        .min(3, { message: 'Description must be at least 3 characters long' })
        .max(3000, { message: 'Description cannot exceed 3000 characters' })
        .optional(),
    category: exports.CategoryEnum.optional(),
    priority: exports.PriorityEnum.optional(),
    status: exports.StatusEnum.optional(),
    location: zod_1.z
        .string()
        .min(2, { message: 'Location must be at least 2 characters long' })
        .max(150, { message: 'Location cannot exceed 150 characters' })
        .optional(),
});
exports.UpdateStatusSchema = zod_1.z.object({
    status: exports.StatusEnum,
});
exports.AssignIssueSchema = zod_1.z.object({
    assigned_to: zod_1.z.string().nullable().optional(),
    staff_id: zod_1.z.string().nullable().optional(),
});
exports.CreateCommentSchema = zod_1.z.object({
    comment: zod_1.z
        .string()
        .min(1, { message: 'Comment cannot be empty' })
        .max(1000, { message: 'Comment cannot exceed 1000 characters' }),
});
exports.IssueQuerySchema = zod_1.z.object({
    status: exports.StatusEnum.optional(),
    priority: exports.PriorityEnum.optional(),
    category: exports.CategoryEnum.optional(),
    search: zod_1.z.string().optional(),
    scope: zod_1.z.enum(['assigned', 'all']).optional(),
});
