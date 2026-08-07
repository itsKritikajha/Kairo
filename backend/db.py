import sqlite3
import os
import uuid
import hashlib

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'kairo.db')
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'schema.sql')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    
    # Ensure demo user exists
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", ("kritika@kairo.ai",))
    demo_user = cursor.fetchone()
    if not demo_user:
        demo_id = "user_demo_kritika"
        pwd_hash = hashlib.sha256("kairo2026".encode()).hexdigest()
        cursor.execute(
            "INSERT INTO users (id, name, email, password_hash, college_year, goal, skill_level, hours_per_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (demo_id, "Kritika Jha", "kritika@kairo.ai", pwd_hash, "3rd Year", "Full-Stack AI Engineer", "Intermediate", 4)
        )
        cursor.execute(
            "INSERT INTO progress_stats (user_id, streak_days, study_hours, problems_solved, skills_completed, productivity_score, ai_usage_tokens) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (demo_id, 12, 48.5, 42, 18, 88, 14200)
        )
        
        # Initial Demo Chat
        chat_id = "chat_welcome"
        cursor.execute("INSERT INTO chats (id, user_id, title) VALUES (?, ?, ?)", (chat_id, demo_id, "Welcome to KAIRO AI"))
        cursor.execute(
            "INSERT INTO messages (id, chat_id, sender, content) VALUES (?, ?, ?, ?)",
            (str(uuid.uuid4()), chat_id, "bot", "Hello Kritika! 👋 I am your personal KAIRO AI Mentor. Ask me any concept, debug code, or request placement prep tips!")
        )

        # Initial Default Roadmap
        roadmap_id = "roadmap_default"
        cursor.execute("INSERT INTO roadmaps (id, user_id, goal, college_year, skill_level, hours_per_day) VALUES (?, ?, ?, ?, ?, ?)",
                       (roadmap_id, demo_id, "Full-Stack AI Engineer", "3rd Year", "Intermediate", 4))
        
        nodes = [
          ("n1", 1, 1, "Array & Sliding Window Operations", "Master Two-Pointers, Sliding Window, and HashMaps.", "DSA", 1),
          ("n2", 1, 2, "Git Branching & Rebase Workflow", "Branching, PRs, squashing commits, resolving conflicts.", "Tools", 1),
          ("n3", 1, 3, "Asynchronous JS & Event Loop", "Promises, async/await, microtask vs macrotask queues.", "JS", 0),
          ("n4", 1, 4, "Express Architecture & Middleware", "REST routing, error handling, CORS & JWT security.", "Backend", 0),
          ("n5", 1, 5, "PostgreSQL & Prisma ORM Modeling", "Tables, foreign keys, indexing, migrations.", "Database", 0),
          ("n6", 1, 6, "Next.js App Router & Server Components", "RSC streaming, layouts, server actions.", "Frontend", 0),
          ("n7", 1, 7, "LangChain RAG & Vector Embeddings", "ChromaDB, cosine similarity, document retrieval.", "AI", 0)
        ]
        for nid, w, d, t, desc, cat, comp in nodes:
            cursor.execute(
                "INSERT INTO roadmap_nodes (id, roadmap_id, week_num, day_num, title, description, category, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (f"node_{nid}", roadmap_id, w, d, t, desc, cat, comp)
            )

        # Initial Default Planner Tasks
        default_tasks = [
            ("7:00 AM - 8:00 AM", "Wake up & Mindful Morning", "rest", 1, 1),
            ("8:30 AM - 1:00 PM", "College Lectures & Labs", "college", 2, 0),
            ("2:00 PM - 4:00 PM", "Solve 2 LeetCode Medium Problems", "study", 3, 1),
            ("4:30 PM - 5:30 PM", "Full-Stack App Development (KAIRO)", "study", 4, 0),
            ("6:00 PM - 7:00 PM", "Evening Run & Fitness", "health", 5, 0),
            ("8:00 PM - 9:30 PM", "AI & LangChain Concepts Practice", "interview", 6, 0),
            ("10:30 PM", "Sleep & Night Recovery", "rest", 7, 0)
        ]
        for slot, title, cat, ord_idx, comp in default_tasks:
            cursor.execute(
                "INSERT INTO planner_tasks (id, user_id, time_slot, title, category, order_index, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), demo_id, slot, title, cat, ord_idx, comp)
            )

        # Initial Note
        note_id = "note_dsa_1"
        cursor.execute(
            "INSERT INTO notes (id, user_id, title, content, folder, ai_summary) VALUES (?, ?, ?, ?, ?, ?)",
            (note_id, demo_id, "System Design & Caching Patterns", 
             "Load balancers distribute traffic across multiple app instances using Round Robin or Least Connections.\n\nRedis is an in-memory key-value store used to cache database query results and reduce P99 latency.",
             "System Design", "• Key: Redis reduces DB latency\n• Algorithm: Round Robin / Least Connections")
        )
        cursor.execute(
            "INSERT INTO flashcards (id, note_id, front, back, mastered) VALUES (?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), note_id, "What algorithm does Redis use for in-memory caching?", "Redis uses in-memory key-value pairs with O(1) hash table lookup.", 1)
        )
        cursor.execute(
            "INSERT INTO flashcards (id, note_id, front, back, mastered) VALUES (?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), note_id, "Explain Load Balancing Round Robin vs Least Connections", "Round Robin distributes sequentially; Least Connections assigns to the server with fewest active connections.", 0)
        )

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
