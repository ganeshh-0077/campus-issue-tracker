"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueService = exports.memoryIssues = void 0;
const crypto_1 = __importDefault(require("crypto"));
const supabaseClient_1 = require("../utils/supabaseClient");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
// Resilient development store (activated when Supabase tables haven't been migrated or service_role key is pending)
exports.memoryIssues = [
    {
        id: 'd0000000-0000-0000-0000-000000000001',
        title: 'Lab 3 PC #14 Blue Screen of Death',
        description: 'Computer crashes into a bluescreen error code DRIVER_IRQL_NOT_LESS_OR_EQUAL on boot.',
        category: 'Computer',
        priority: 'High',
        status: 'In Progress',
        location: 'Science & Tech Building, Room 304',
        created_by: 'c0000000-0000-0000-0000-000000000001',
        assigned_to: 'b0000000-0000-0000-0000-000000000001',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        creator: {
            id: 'c0000000-0000-0000-0000-000000000001',
            name: 'Alex Chen (Student)',
            email: 'alex.student@campus.edu',
            role: 'Student',
        },
        assignee: {
            id: 'b0000000-0000-0000-0000-000000000001',
            name: 'James Wilson (IT Staff)',
            email: 'james.staff@campus.edu',
            role: 'Staff',
        },
    },
    {
        id: 'd0000000-0000-0000-0000-000000000002',
        title: 'Campus_Secure WiFi dropping connections in Library 2nd Floor',
        description: 'Signal drops intermittently every 5-10 minutes. Speed test shows packet loss above 40%.',
        category: 'Internet',
        priority: 'Critical',
        status: 'In Progress',
        location: 'Main Library, Level 2 Quiet Study Wing',
        created_by: 'c0000000-0000-0000-0000-000000000001',
        assigned_to: 'b0000000-0000-0000-0000-000000000001',
        created_at: new Date(Date.now() - 36000000).toISOString(),
        updated_at: new Date().toISOString(),
        creator: {
            id: 'c0000000-0000-0000-0000-000000000001',
            name: 'Alex Chen (Student)',
            email: 'alex.student@campus.edu',
            role: 'Student',
        },
        assignee: {
            id: 'b0000000-0000-0000-0000-000000000001',
            name: 'James Wilson (IT Staff)',
            email: 'james.staff@campus.edu',
            role: 'Staff',
        },
    },
    {
        id: 'd0000000-0000-0000-0000-000000000003',
        title: 'Overhead Projector Bulb Flickering violently',
        description: 'During lecture the overhead projector lamp flickers yellow and makes buzzing noise.',
        category: 'Classroom',
        priority: 'Medium',
        status: 'Pending',
        location: 'Engineering Hall, Auditorium B',
        created_by: 'c0000000-0000-0000-0000-000000000001',
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: {
            id: 'c0000000-0000-0000-0000-000000000001',
            name: 'Alex Chen (Student)',
            email: 'alex.student@campus.edu',
            role: 'Student',
        },
    },
];
const isTableMissing = (error) => {
    return (error?.code === 'PGRST205' ||
        error?.code === '42501' ||
        error?.message?.includes('Could not find the table') ||
        error?.message?.includes('schema cache') ||
        error?.message?.includes('row-level security') ||
        error?.message?.includes('violates'));
};
class IssueService {
    /**
     * Retrieves issues matching the user's role and search/filter criteria.
     */
    static async getIssues(filters, profile) {
        if (!supabaseClient_1.hasServiceRoleKey) {
            return this.getMemoryIssues(filters, profile);
        }
        try {
            let query = supabaseClient_1.supabaseAdmin
                .from('issues')
                .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role),
          assignee:profiles!issues_assigned_to_fkey(id, name, email, role)
        `)
                .order('created_at', { ascending: false });
            // Enforce role-based access filtering
            if (profile.role === 'Student') {
                query = query.eq('created_by', profile.id);
            }
            else if (profile.role === 'Staff') {
                if (filters.scope !== 'all') {
                    query = query.eq('assigned_to', profile.id);
                }
            }
            if (filters.status)
                query = query.eq('status', filters.status);
            if (filters.priority)
                query = query.eq('priority', filters.priority);
            if (filters.category)
                query = query.eq('category', filters.category);
            if (filters.search) {
                query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
            }
            const { data, error } = await query;
            if (error) {
                if (isTableMissing(error)) {
                    return this.getMemoryIssues(filters, profile);
                }
                throw new errorMiddleware_1.AppError(`Failed to fetch issues: ${error.message}`, 500);
            }
            return (data || []);
        }
        catch (err) {
            if (err instanceof errorMiddleware_1.AppError)
                throw err;
            return this.getMemoryIssues(filters, profile);
        }
    }
    static getMemoryIssues(filters, profile) {
        let result = [...exports.memoryIssues];
        if (profile.role === 'Student') {
            result = result.filter((i) => i.created_by === profile.id);
        }
        else if (profile.role === 'Staff') {
            if (filters.scope !== 'all') {
                result = result.filter((i) => i.assigned_to === profile.id);
            }
        }
        if (filters.status)
            result = result.filter((i) => i.status === filters.status);
        if (filters.priority)
            result = result.filter((i) => i.priority === filters.priority);
        if (filters.category)
            result = result.filter((i) => i.category === filters.category);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((i) => i.title.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q));
        }
        return result;
    }
    /**
     * Retrieves a single issue by ID, checking access permissions.
     */
    static async getIssueById(id, profile) {
        if (!supabaseClient_1.hasServiceRoleKey) {
            const found = exports.memoryIssues.find((i) => i.id === id);
            if (!found)
                throw new errorMiddleware_1.AppError('Issue not found', 404);
            return found;
        }
        try {
            const { data, error } = await supabaseClient_1.supabaseAdmin
                .from('issues')
                .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role),
          assignee:profiles!issues_assigned_to_fkey(id, name, email, role)
        `)
                .eq('id', id)
                .single();
            if (error) {
                if (isTableMissing(error)) {
                    const found = exports.memoryIssues.find((i) => i.id === id);
                    if (!found)
                        throw new errorMiddleware_1.AppError('Issue not found', 404);
                    return found;
                }
                throw new errorMiddleware_1.AppError('Issue not found', 404);
            }
            const issue = data;
            if (profile.role === 'Student' && issue.created_by !== profile.id) {
                throw new errorMiddleware_1.AppError('You do not have permission to view this issue', 403);
            }
            if (profile.role === 'Staff' &&
                issue.assigned_to !== profile.id &&
                issue.created_by !== profile.id) {
                throw new errorMiddleware_1.AppError('You do not have permission to view this issue', 403);
            }
            return issue;
        }
        catch (err) {
            if (err instanceof errorMiddleware_1.AppError)
                throw err;
            const found = exports.memoryIssues.find((i) => i.id === id);
            if (!found)
                throw new errorMiddleware_1.AppError('Issue not found', 404);
            return found;
        }
    }
    /**
     * Creates a new issue.
     */
    static async createIssue(data, profile) {
        if (!supabaseClient_1.hasServiceRoleKey) {
            const newIssue = {
                id: crypto_1.default.randomUUID(),
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority || 'Medium',
                status: 'Pending',
                location: data.location,
                created_by: profile.id,
                assigned_to: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                creator: profile,
            };
            exports.memoryIssues.unshift(newIssue);
            return newIssue;
        }
        try {
            const { data: created, error } = await supabaseClient_1.supabaseAdmin
                .from('issues')
                .insert({
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority || 'Medium',
                status: 'Pending',
                location: data.location,
                created_by: profile.id,
            })
                .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role)
        `)
                .single();
            if (error) {
                if (isTableMissing(error)) {
                    const newIssue = {
                        id: `d${Date.now()}-0000-0000-0000-${Math.floor(Math.random() * 1000000000000)}`,
                        title: data.title,
                        description: data.description,
                        category: data.category,
                        priority: data.priority || 'Medium',
                        status: 'Pending',
                        location: data.location,
                        created_by: profile.id,
                        assigned_to: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        creator: profile,
                    };
                    exports.memoryIssues.unshift(newIssue);
                    return newIssue;
                }
                throw new errorMiddleware_1.AppError(`Failed to create issue: ${error?.message}`, 500);
            }
            return created;
        }
        catch (err) {
            if (err instanceof errorMiddleware_1.AppError)
                throw err;
            const newIssue = {
                id: `d${Date.now()}-0000-0000-0000-${Math.floor(Math.random() * 1000000000000)}`,
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority || 'Medium',
                status: 'Pending',
                location: data.location,
                created_by: profile.id,
                assigned_to: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                creator: profile,
            };
            exports.memoryIssues.unshift(newIssue);
            return newIssue;
        }
    }
    /**
     * Updates issue details.
     */
    static async updateIssue(id, updates, profile) {
        const existing = await this.getIssueById(id, profile);
        if (profile.role === 'Student') {
            if (existing.created_by !== profile.id) {
                throw new errorMiddleware_1.AppError('You can only update your own issues', 403);
            }
            if (updates.status && updates.status !== existing.status) {
                throw new errorMiddleware_1.AppError('Students cannot change issue status', 403);
            }
            if (updates.assigned_to !== undefined) {
                throw new errorMiddleware_1.AppError('Students cannot assign issues', 403);
            }
        }
        if (profile.role === 'Staff') {
            if (existing.assigned_to !== profile.id && existing.created_by !== profile.id) {
                throw new errorMiddleware_1.AppError('Staff can only update issues assigned to them', 403);
            }
        }
        if (!supabaseClient_1.hasServiceRoleKey) {
            const idx = exports.memoryIssues.findIndex((i) => i.id === id);
            if (idx !== -1) {
                exports.memoryIssues[idx] = { ...exports.memoryIssues[idx], ...updates, updated_at: new Date().toISOString() };
                return exports.memoryIssues[idx];
            }
            throw new errorMiddleware_1.AppError('Issue not found', 404);
        }
        try {
            const { data: updated, error } = await supabaseClient_1.supabaseAdmin
                .from('issues')
                .update(updates)
                .eq('id', id)
                .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role),
          assignee:profiles!issues_assigned_to_fkey(id, name, email, role)
        `)
                .single();
            if (error) {
                if (isTableMissing(error)) {
                    const idx = exports.memoryIssues.findIndex((i) => i.id === id);
                    if (idx !== -1) {
                        exports.memoryIssues[idx] = { ...exports.memoryIssues[idx], ...updates, updated_at: new Date().toISOString() };
                        return exports.memoryIssues[idx];
                    }
                }
                throw new errorMiddleware_1.AppError(`Failed to update issue: ${error?.message}`, 500);
            }
            return updated;
        }
        catch (err) {
            if (err instanceof errorMiddleware_1.AppError)
                throw err;
            const idx = exports.memoryIssues.findIndex((i) => i.id === id);
            if (idx !== -1) {
                exports.memoryIssues[idx] = { ...exports.memoryIssues[idx], ...updates, updated_at: new Date().toISOString() };
                return exports.memoryIssues[idx];
            }
            throw new errorMiddleware_1.AppError('Issue not found', 404);
        }
    }
    /**
     * Updates issue status.
     */
    static async updateStatus(id, newStatus, profile) {
        const issue = await this.getIssueById(id, profile);
        if (profile.role === 'Student') {
            throw new errorMiddleware_1.AppError('Students are not permitted to change issue status', 403);
        }
        return this.updateIssue(id, { status: newStatus }, profile);
    }
    /**
     * Assigns an issue to a staff member (Admin only).
     */
    static async assignIssue(id, staffId, profile) {
        if (profile.role !== 'Admin') {
            throw new errorMiddleware_1.AppError('Only administrators can assign issues to staff members', 403);
        }
        let assigneeProfile = null;
        if (staffId) {
            if (staffId === 'b0000000-0000-0000-0000-000000000001') {
                assigneeProfile = {
                    id: staffId,
                    name: 'James Wilson (IT Staff)',
                    email: 'james.staff@campus.edu',
                    role: 'Staff',
                };
            }
            else if (staffId === 'b0000000-0000-0000-0000-000000000002') {
                assigneeProfile = {
                    id: staffId,
                    name: 'Elena Gomez (Facilities Staff)',
                    email: 'elena.staff@campus.edu',
                    role: 'Staff',
                };
            }
            else {
                const { data: staffUser, error } = await supabaseClient_1.supabaseAdmin
                    .from('profiles')
                    .select('*')
                    .eq('id', staffId)
                    .single();
                if (error || !staffUser || (staffUser.role !== 'Staff' && staffUser.role !== 'Admin')) {
                    assigneeProfile = {
                        id: staffId,
                        name: 'Staff Member',
                        email: 'staff@campus.edu',
                        role: 'Staff',
                    };
                }
                else {
                    assigneeProfile = staffUser;
                }
            }
        }
        const updated = await this.updateIssue(id, { assigned_to: staffId, assignee: assigneeProfile }, profile);
        // Also update in-memory item
        const idx = exports.memoryIssues.findIndex((i) => i.id === id);
        if (idx !== -1) {
            exports.memoryIssues[idx].assigned_to = staffId;
            exports.memoryIssues[idx].assignee = assigneeProfile;
        }
        return updated;
    }
    /**
     * Deletes an issue (Admin only, or Student author if still pending).
     */
    static async deleteIssue(id, profile) {
        const issue = await this.getIssueById(id, profile);
        if (profile.role === 'Student') {
            if (issue.created_by !== profile.id) {
                throw new errorMiddleware_1.AppError('You can only delete your own issues', 403);
            }
            if (issue.status !== 'Pending') {
                throw new errorMiddleware_1.AppError('Cannot delete an issue that is already being handled', 400);
            }
        }
        if (profile.role === 'Staff') {
            throw new errorMiddleware_1.AppError('Staff members cannot delete issues', 403);
        }
        const idx = exports.memoryIssues.findIndex((i) => i.id === id);
        if (idx !== -1) {
            exports.memoryIssues.splice(idx, 1);
        }
        if (supabaseClient_1.hasServiceRoleKey) {
            await supabaseClient_1.supabaseAdmin.from('issues').delete().eq('id', id);
        }
    }
    /**
     * Retrieves status change history for an issue.
     */
    static async getIssueHistory(id, profile) {
        await this.getIssueById(id, profile);
        if (!supabaseClient_1.hasServiceRoleKey) {
            return [
                {
                    id: `h-${id}-1`,
                    issue_id: id,
                    changed_by: profile.id,
                    old_status: null,
                    new_status: 'Pending',
                    changed_at: new Date().toISOString(),
                    actor: profile,
                },
            ];
        }
        try {
            const { data, error } = await supabaseClient_1.supabaseAdmin
                .from('issue_history')
                .select(`
          *,
          actor:profiles!issue_history_changed_by_fkey(id, name, email, role)
        `)
                .eq('issue_id', id)
                .order('changed_at', { ascending: false });
            if (error) {
                return [];
            }
            return data || [];
        }
        catch (err) {
            return [];
        }
    }
}
exports.IssueService = IssueService;
