"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
/**
 * Validates request data against a Zod schema.
 * Returns 400 with granular field error messages if validation fails.
 */
const validate = (schema, part = 'body') => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req[part]);
            req[part] = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
