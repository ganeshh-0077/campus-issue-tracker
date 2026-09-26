"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseUserClient = exports.supabaseAdmin = exports.hasServiceRoleKey = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const rawUrl = process.env.SUPABASE_URL || '';
// Cleanly strip trailing /rest/v1 or trailing slashes if present
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[WARN] Supabase URL or Anon Key is missing. Ensure .env is populated with real credentials.');
}
exports.hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim().length > 10);
/**
 * Service-role Supabase client.
 * Bypasses RLS - used strictly on the backend for administrative operations,
 * user role verification, and system tasks. Never expose this key to clients!
 */
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
/**
 * Creates a scoped Supabase client with the caller's JWT token.
 * Every query executed via this client will automatically enforce Row Level Security (RLS)
 * inside PostgreSQL based on the authenticated user's identity.
 */
const getSupabaseUserClient = (jwtToken) => {
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
};
exports.getSupabaseUserClient = getSupabaseUserClient;
