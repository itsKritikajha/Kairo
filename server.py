import http.server
import socketserver
import os
import sys
import json
import uuid
import hashlib
from urllib.parse import urlparse, parse_qs

# Force UTF-8 stdout encoding on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Import Database & AI Engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.db import init_db, get_db
from backend.ai_engine import KairoAIEngine

# Ensure DB initialized
init_db()

PORT = 8000
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')

class KairoAPIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/'):
            conn = get_db()
            cursor = conn.cursor()
            user_id = "user_demo_kritika"  # Default active demo session

            if path == '/api/auth/me':
                cursor.execute("SELECT id, name, email, college_year, goal, skill_level, hours_per_day FROM users WHERE id = ?", (user_id,))
                row = cursor.fetchone()
                conn.close()
                if row:
                    return self._send_json(dict(row))
                return self._send_json({"error": "User not found"}, 404)

            elif path == '/api/chats':
                cursor.execute("SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
                rows = cursor.fetchall()
                conn.close()
                return self._send_json([dict(r) for r in rows])

            elif path.startswith('/api/chats/'):
                chat_id = path.split('/api/chats/')[1]
                cursor.execute("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC", (chat_id,))
                rows = cursor.fetchall()
                conn.close()
                return self._send_json([dict(r) for r in rows])

            elif path == '/api/roadmap':
                cursor.execute("SELECT * FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", (user_id,))
                roadmap = cursor.fetchone()
                if not roadmap:
                    conn.close()
                    return self._send_json({"roadmap": None, "nodes": []})
                
                cursor.execute("SELECT * FROM roadmap_nodes WHERE roadmap_id = ? ORDER BY week_num ASC, day_num ASC", (roadmap['id'],))
                nodes = cursor.fetchall()
                conn.close()
                return self._send_json({
                    "roadmap": dict(roadmap),
                    "nodes": [dict(n) for n in nodes]
                })

            elif path == '/api/planner':
                cursor.execute("SELECT * FROM planner_tasks WHERE user_id = ? ORDER BY order_index ASC", (user_id,))
                rows = cursor.fetchall()
                conn.close()
                return self._send_json([dict(r) for r in rows])

            elif path == '/api/dashboard':
                cursor.execute("SELECT * FROM progress_stats WHERE user_id = ?", (user_id,))
                stats = cursor.fetchone()
                conn.close()
                return self._send_json(dict(stats) if stats else {})

            elif path == '/api/notes':
                cursor.execute("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
                rows = cursor.fetchall()
                conn.close()
                return self._send_json([dict(r) for r in rows])

            conn.close()
            return self._send_json({"error": "API route not found"}, 404)

        # Fallback to static web server
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"
        body = json.loads(post_data) if post_data else {}

        if path.startswith('/api/'):
            conn = get_db()
            cursor = conn.cursor()
            user_id = "user_demo_kritika"

            # Auth Login / Register / Guest Demo
            if path == '/api/auth/login' or path == '/api/auth/guest':
                cursor.execute("SELECT id, name, email, college_year, goal, skill_level, hours_per_day FROM users WHERE id = ?", (user_id,))
                user = cursor.fetchone()
                conn.close()
                return self._send_json({
                    "token": "demo_jwt_token_2026",
                    "user": dict(user)
                })

            elif path == '/api/auth/register':
                new_id = f"user_{uuid.uuid4().hex[:8]}"
                name = body.get('name', 'Learner')
                email = body.get('email', f"user_{new_id}@kairo.ai")
                pwd_hash = hashlib.sha256(body.get('password', '123456').encode()).hexdigest()
                cursor.execute(
                    "INSERT INTO users (id, name, email, password_hash, college_year, goal, skill_level, hours_per_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (new_id, name, email, pwd_hash, body.get('college_year', '3rd Year'), body.get('goal', 'Software Engineer'), body.get('skill_level', 'Intermediate'), int(body.get('hours_per_day', 4)))
                )
                cursor.execute("INSERT INTO progress_stats (user_id) VALUES (?)", (new_id,))
                conn.commit()
                conn.close()
                return self._send_json({
                    "token": f"jwt_{new_id}",
                    "user": {"id": new_id, "name": name, "email": email}
                })

            # Create New Chat Session
            elif path == '/api/chats':
                title = body.get('title', 'New AI Chat Session')
                chat_id = f"chat_{uuid.uuid4().hex[:8]}"
                cursor.execute("INSERT INTO chats (id, user_id, title) VALUES (?, ?, ?)", (chat_id, user_id, title))
                cursor.execute(
                    "INSERT INTO messages (id, chat_id, sender, content) VALUES (?, ?, ?, ?)",
                    (str(uuid.uuid4()), chat_id, "bot", "Hello! How can I assist your learning goal today?")
                )
                conn.commit()
                conn.close()
                return self._send_json({"id": chat_id, "title": title})

            # Send Message in Chat (with attachment & depth)
            elif path.startswith('/api/chats/') and path.endswith('/messages'):
                parts = path.split('/')
                chat_id = parts[3]
                user_text = body.get('content', '')
                depth = body.get('depth', 'intermediate')
                attachment_name = body.get('attachment_name')
                attachment_type = body.get('attachment_type')
                attachment_text = body.get('attachment_text')

                # Save user message
                user_msg_id = str(uuid.uuid4())
                cursor.execute(
                    "INSERT INTO messages (id, chat_id, sender, content, attachment_name, attachment_type) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_msg_id, chat_id, "user", user_text, attachment_name, attachment_type)
                )

                # AI Reply Generation
                reply_text = KairoAIEngine.generate_mentor_reply(user_text, depth, attachment_text)
                bot_msg_id = str(uuid.uuid4())
                cursor.execute(
                    "INSERT INTO messages (id, chat_id, sender, content) VALUES (?, ?, ?, ?)",
                    (bot_msg_id, chat_id, "bot", reply_text)
                )

                # Update chat title if default
                if user_text:
                    new_title = user_text[:35] + ("..." if len(user_text) > 35 else "")
                    cursor.execute("UPDATE chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_title, chat_id))

                conn.commit()
                conn.close()
                return self._send_json({
                    "user_message": {"id": user_msg_id, "sender": "user", "content": user_text, "attachment_name": attachment_name},
                    "bot_message": {"id": bot_msg_id, "sender": "bot", "content": reply_text}
                })

            # Generate AI Roadmap
            elif path == '/api/roadmap/generate':
                goal = body.get('goal', 'Full-Stack Software Engineer')
                college_year = body.get('college_year', '3rd Year')
                skill_level = body.get('skill_level', 'Intermediate')
                hours_per_day = int(body.get('hours_per_day', 4))

                roadmap_id = f"roadmap_{uuid.uuid4().hex[:8]}"
                cursor.execute("INSERT INTO roadmaps (id, user_id, goal, college_year, skill_level, hours_per_day) VALUES (?, ?, ?, ?, ?, ?)",
                               (roadmap_id, user_id, goal, college_year, skill_level, hours_per_day))

                nodes = KairoAIEngine.generate_roadmap(goal, college_year, skill_level, hours_per_day)
                for n in nodes:
                    node_id = f"node_{uuid.uuid4().hex[:8]}"
                    cursor.execute(
                        "INSERT INTO roadmap_nodes (id, roadmap_id, week_num, day_num, title, description, category, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (node_id, roadmap_id, n['week_num'], n['day_num'], n['title'], n['description'], n['category'], 0)
                    )
                    n['id'] = node_id

                conn.commit()
                conn.close()
                return self._send_json({"roadmap_id": roadmap_id, "nodes": nodes})

            # Toggle Roadmap Node Completion
            elif path == '/api/roadmap/node/toggle':
                node_id = body.get('node_id')
                cursor.execute("SELECT completed, roadmap_id FROM roadmap_nodes WHERE id = ?", (node_id,))
                node = cursor.fetchone()
                if node:
                    new_val = 0 if node['completed'] else 1
                    cursor.execute("UPDATE roadmap_nodes SET completed = ? WHERE id = ?", (new_val, node_id))
                    
                    # Update problems/skills in dashboard
                    if new_val == 1:
                        cursor.execute("UPDATE progress_stats SET skills_completed = skills_completed + 1 WHERE user_id = ?", (user_id,))
                    
                    conn.commit()
                    conn.close()
                    return self._send_json({"success": True, "completed": new_val})
                conn.close()
                return self._send_json({"error": "Node not found"}, 404)

            # Generate Smart Planner Daily Schedule
            elif path == '/api/planner/generate':
                cursor.execute("DELETE FROM planner_tasks WHERE user_id = ?", (user_id,))
                tasks = KairoAIEngine.generate_daily_schedule()
                out_tasks = []
                for t in tasks:
                    tid = str(uuid.uuid4())
                    cursor.execute(
                        "INSERT INTO planner_tasks (id, user_id, time_slot, title, category, order_index, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (tid, user_id, t['time_slot'], t['title'], t['category'], t['order_index'], t['completed'])
                    )
                    t['id'] = tid
                    out_tasks.append(t)
                conn.commit()
                conn.close()
                return self._send_json(out_tasks)

            # Reorder Planner Tasks (Drag & Drop)
            elif path == '/api/planner/reorder':
                ordered_ids = body.get('ordered_ids', [])
                for idx, tid in enumerate(ordered_ids):
                    cursor.execute("UPDATE planner_tasks SET order_index = ? WHERE id = ? AND user_id = ?", (idx + 1, tid, user_id))
                conn.commit()
                conn.close()
                return self._send_json({"success": True})

            # Add Task in Planner
            elif path == '/api/planner/task':
                title = body.get('title', 'New Task')
                category = body.get('category', 'study')
                time_slot = body.get('time_slot', 'Custom Time')
                tid = str(uuid.uuid4())
                cursor.execute(
                    "INSERT INTO planner_tasks (id, user_id, time_slot, title, category, order_index, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (tid, user_id, time_slot, title, category, 99, 0)
                )
                conn.commit()
                conn.close()
                return self._send_json({"id": tid, "title": title, "category": category, "time_slot": time_slot, "completed": 0})

            # Toggle Task Done
            elif path == '/api/planner/task/toggle':
                tid = body.get('task_id')
                cursor.execute("SELECT completed FROM planner_tasks WHERE id = ?", (tid,))
                t = cursor.fetchone()
                if t:
                    new_val = 0 if t['completed'] else 1
                    cursor.execute("UPDATE planner_tasks SET completed = ? WHERE id = ?", (new_val, tid))
                    conn.commit()
                    conn.close()
                    return self._send_json({"success": True, "completed": new_val})
                conn.close()
                return self._send_json({"error": "Task not found"}, 404)

            # Save / Create Note
            elif path == '/api/notes':
                title = body.get('title', 'Untitled Note')
                content = body.get('content', '')
                folder = body.get('folder', 'General')
                note_id = body.get('id') or f"note_{uuid.uuid4().hex[:8]}"

                cursor.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
                exists = cursor.fetchone()
                if exists:
                    cursor.execute("UPDATE notes SET title = ?, content = ?, folder = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                                   (title, content, folder, note_id))
                else:
                    cursor.execute("INSERT INTO notes (id, user_id, title, content, folder) VALUES (?, ?, ?, ?, ?)",
                                   (note_id, user_id, title, content, folder))

                conn.commit()
                conn.close()
                return self._send_json({"id": note_id, "title": title, "content": content, "folder": folder})

            # Generate Note Flashcards
            elif path.startswith('/api/notes/') and path.endswith('/flashcards'):
                note_id = path.split('/')[3]
                cursor.execute("SELECT title, content FROM notes WHERE id = ?", (note_id,))
                note = cursor.fetchone()
                if note:
                    cards = KairoAIEngine.generate_flashcards(note['title'], note['content'])
                    out_cards = []
                    for c in cards:
                        cid = str(uuid.uuid4())
                        cursor.execute(
                            "INSERT INTO flashcards (id, note_id, front, back, mastered) VALUES (?, ?, ?, ?, 0)",
                            (cid, note_id, c['front'], c['back'])
                        )
                        c['id'] = cid
                        c['mastered'] = 0
                        out_cards.append(c)
                    conn.commit()
                    conn.close()
                    return self._send_json(out_cards)
                conn.close()
                return self._send_json({"error": "Note not found"}, 404)

            conn.close()
            return self._send_json({"error": "API route not found"}, 404)

if __name__ == "__main__":
    print(f"KAIRO Production REST API Server starting at http://localhost:{PORT}")
    print(f"Serving frontend from: {WEB_DIR}")
    print("Press Ctrl+C to stop the server.")
    
    with socketserver.TCPServer(("", PORT), KairoAPIHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            sys.exit(0)
