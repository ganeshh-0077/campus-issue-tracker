-- ==============================================================================
-- Campus Issue Tracker: seed.sql
-- Description: Realistic development seed data for users, issues, comments, and history.
-- Development Password for all seeded accounts: Password123!
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. SEED AUTH USERS & PROFILES
-- Creates sample accounts for: 1 Admin, 2 Staff, 3 Students
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    pwd_hash TEXT := crypt('Password123!', gen_salt('bf'));
    admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
    staff1_id UUID := 'b0000000-0000-0000-0000-000000000001';
    staff2_id UUID := 'b0000000-0000-0000-0000-000000000002';
    student1_id UUID := 'c0000000-0000-0000-0000-000000000001';
    student2_id UUID := 'c0000000-0000-0000-0000-000000000002';
    student3_id UUID := 'c0000000-0000-0000-0000-000000000003';
BEGIN
    -- Insert into auth.users (Supabase Auth internal table)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES
    (
        admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin@campus.edu', pwd_hash, now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Sarah Connor (Admin)","role":"Admin"}',
        now(), now()
    ),
    (
        staff1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'james.staff@campus.edu', pwd_hash, now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"James Wilson (IT Staff)","role":"Staff"}',
        now(), now()
    ),
    (
        staff2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'elena.staff@campus.edu', pwd_hash, now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Elena Gomez (Facilities Staff)","role":"Staff"}',
        now(), now()
    ),
    (
        student1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'alex.student@campus.edu', pwd_hash, now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Alex Chen","role":"Student"}',
        now(), now()
    ),
    (
        student2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'priya.student@campus.edu', pwd_hash, now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Priya Sharma","role":"Student"}',
        now(), now()
    ),
    (
        student3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'liam.student@campus.edu', pwd_hash, now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Liam Miller","role":"Student"}',
        now(), now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Ensure profiles are populated
    INSERT INTO public.profiles (id, name, email, role, created_at) VALUES
    (admin_id, 'Sarah Connor (Admin)', 'admin@campus.edu', 'Admin', now()),
    (staff1_id, 'James Wilson (IT Staff)', 'james.staff@campus.edu', 'Staff', now()),
    (staff2_id, 'Elena Gomez (Facilities Staff)', 'elena.staff@campus.edu', 'Staff', now()),
    (student1_id, 'Alex Chen', 'alex.student@campus.edu', 'Student', now()),
    (student2_id, 'Priya Sharma', 'priya.student@campus.edu', 'Student', now()),
    (student3_id, 'Liam Miller', 'liam.student@campus.edu', 'Student', now())
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;
END $$;

-- -----------------------------------------------------------------------------
-- 2. SEED ISSUES
-- Covers different categories, locations, priorities, and lifecycles
-- -----------------------------------------------------------------------------
INSERT INTO public.issues (
    id, title, description, category, priority, status, location, created_by, assigned_to, created_at, updated_at
) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'Lab 3 PC #14 Blue Screen of Death',
    'Computer crashes into a bluescreen error code DRIVER_IRQL_NOT_LESS_OR_EQUAL on boot. Several students need this workstation for graphics class.',
    'Computer',
    'High',
    'In Progress',
    'Science & Tech Building, Room 304',
    'c0000000-0000-0000-0000-000000000001', -- Alex Chen
    'b0000000-0000-0000-0000-000000000001', -- James Wilson
    now() - interval '2 days',
    now() - interval '1 day'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'Campus_Secure WiFi dropping connections in Library 2nd Floor',
    'Signal drops intermittently every 5-10 minutes. Speed test shows packet loss above 40%.',
    'Internet',
    'Critical',
    'In Progress',
    'Main Library, Level 2 Quiet Study Wing',
    'c0000000-0000-0000-0000-000000000002', -- Priya Sharma
    'b0000000-0000-0000-0000-000000000001', -- James Wilson
    now() - interval '3 days',
    now() - interval '4 hours'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'Overhead Projector Bulb Flickering violently',
    'During lecture the overhead projector lamp flickers yellow and makes buzzing noise.',
    'Classroom',
    'Medium',
    'Pending',
    'Engineering Hall, Auditorium B',
    'c0000000-0000-0000-0000-000000000003', -- Liam Miller
    NULL,
    now() - interval '5 hours',
    now() - interval '5 hours'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'Spilled beverage and slippery tiles near cafeteria entrance',
    'Coffee or sweet beverage spilled across the corridor floor creating slip hazard.',
    'Cleaning',
    'High',
    'Resolved',
    'Student Union, Ground Floor East Corridor',
    'c0000000-0000-0000-0000-000000000001', -- Alex Chen
    'b0000000-0000-0000-0000-000000000002', -- Elena Gomez
    now() - interval '1 day',
    now() - interval '2 hours'
),
(
    'd0000000-0000-0000-0000-000000000005',
    'AC Power socket loose and sparking in seminar room',
    'Wall electrical outlet on the north wall is wobbly. Sparking was observed when plugging a laptop charger.',
    'Electricity',
    'Critical',
    'Pending',
    'Business School, Seminar Room 102',
    'c0000000-0000-0000-0000-000000000002', -- Priya Sharma
    NULL,
    now() - interval '1 hour',
    now() - interval '1 hour'
),
(
    'd0000000-0000-0000-0000-000000000006',
    'Broken desk hinge and splintered wood',
    'Desk unit row 4 has broken hinge making it impossible to take notes safely.',
    'Furniture',
    'Low',
    'Closed',
    'Arts Complex, Room 205',
    'c0000000-0000-0000-0000-000000000003', -- Liam Miller
    'b0000000-0000-0000-0000-000000000002', -- Elena Gomez
    now() - interval '5 days',
    now() - interval '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. SEED COMMENTS
-- -----------------------------------------------------------------------------
INSERT INTO public.comments (
    id, issue_id, user_id, comment, created_at
) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001', -- James Wilson
    'I ran a hardware diagnostic remotely. Replacing the GPU driver today at 2 PM.',
    now() - interval '1 day'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001', -- Alex Chen
    'Thanks James! Please let me know once it is back up, we have our term project demo tomorrow.',
    now() - interval '20 hours'
),
(
    'e0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001', -- James Wilson
    'Network engineering restarted AP-204 and configured channel roaming. Monitoring telemetry.',
    now() - interval '4 hours'
),
(
    'e0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002', -- Elena Gomez
    'Custodial team mopped the floor and placed wet floor caution signs. All clean!',
    now() - interval '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. SEED ISSUE HISTORY
-- -----------------------------------------------------------------------------
INSERT INTO public.issue_history (
    id, issue_id, changed_by, old_status, new_status, created_at
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Pending',
    'In Progress',
    now() - interval '1 day'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Pending',
    'In Progress',
    now() - interval '1 day'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'Pending',
    'In Progress',
    now() - interval '12 hours'
),
(
    'f0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'In Progress',
    'Resolved',
    now() - interval '2 hours'
),
(
    'f0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'Pending',
    'In Progress',
    now() - interval '4 days'
),
(
    'f0000000-0000-0000-0000-000000000006',
    'd0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'In Progress',
    'Resolved',
    now() - interval '3 days'
),
(
    'f0000000-0000-0000-0000-000000000007',
    'd0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'Resolved',
    'Closed',
    now() - interval '3 days'
)
ON CONFLICT (id) DO NOTHING;
