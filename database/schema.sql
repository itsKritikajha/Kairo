-- Project KAIRO — Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    college_year TEXT DEFAULT '3rd Year',
    goal TEXT DEFAULT 'Software Engineer',
    skill_level TEXT DEFAULT 'Intermediate',
    hours_per_day INTEGER DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender TEXT NOT NULL, -- 'user' or 'bot'
    content TEXT NOT NULL,
    attachment_name TEXT,
    attachment_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    goal TEXT NOT NULL,
    college_year TEXT,
    skill_level TEXT,
    hours_per_day INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmap_nodes (
    id TEXT PRIMARY KEY,
    roadmap_id TEXT NOT NULL,
    week_num INTEGER NOT NULL,
    day_num INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planner_tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'study', 'college', 'health', 'rest', 'interview'
    order_index INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    folder TEXT DEFAULT 'General',
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    mastered INTEGER DEFAULT 0,
    FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress_stats (
    user_id TEXT PRIMARY KEY,
    streak_days INTEGER DEFAULT 12,
    study_hours REAL DEFAULT 48.5,
    problems_solved INTEGER DEFAULT 42,
    skills_completed INTEGER DEFAULT 18,
    productivity_score INTEGER DEFAULT 88,
    ai_usage_tokens INTEGER DEFAULT 14200,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
