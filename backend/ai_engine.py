import json

class KairoAIEngine:
    @staticmethod
    def generate_mentor_reply(message_text, depth="intermediate", attachment_text=None):
        text_lower = message_text.lower()
        
        attachment_context = ""
        if attachment_text:
            attachment_context = f"\n\n📄 **Attached Document Context**:\n_{attachment_text[:300]}..._\n"

        # Code Debugging Detection
        if "debug" in text_lower or "fix" in text_lower or "error" in text_lower or "bug" in text_lower:
            return (
                f"🛠️ **KAIRO AI Code Debugger ({depth.upper()})**:{attachment_context}\n\n"
                "I analyzed your code snippet/error. Here is the breakdown:\n\n"
                "1. **Root Cause**: Unhandled async promise rejection or null property reference.\n"
                "2. **Fixed Code**:\n"
                "```js\n"
                "try {\n"
                "  const data = await fetchData();\n"
                "  if (!data) throw new Error('Data payload missing');\n"
                "  return data;\n"
                "} catch (err) {\n"
                "  console.error('Handled gracefully:', err.message);\n"
                "}\n"
                "```\n"
                "3. **Best Practice**: Always validate responses before dereferencing keys."
            )

        # DSA Detection
        if "dsa" in text_lower or "recursion" in text_lower or "binary tree" in text_lower or "graph" in text_lower or "leetcode" in text_lower:
            return (
                f"🧮 **KAIRO DSA Master ({depth.upper()})**:{attachment_context}\n\n"
                "Let's break down this Data Structure & Algorithm topic:\n\n"
                "• **Time Complexity**: O(N log N) average case.\n"
                "• **Space Complexity**: O(N) auxiliary space.\n"
                "• **Optimal Strategy**: Use a HashMap / Two-Pointers pattern to avoid quadratic O(N²) nested loops.\n\n"
                "```python\n"
                "def solve_problem(nums, target):\n"
                "    seen = {}\n"
                "    for i, num in enumerate(nums):\n"
                "        diff = target - num\n"
                "        if diff in seen:\n"
                "            return [seen[diff], i]\n"
                "        seen[num] = i\n"
                "    return []\n"
                "```\n"
                "Try solving this problem with O(1) space as a follow-up!"
            )

        # System Design / Interview
        if "system design" in text_lower or "interview" in text_lower or "architecture" in text_lower:
            return (
                f"📐 **KAIRO System Design Coach ({depth.upper()})**:{attachment_context}\n\n"
                "Top 3 checklist items for this interview topic:\n"
                "1. **Functional Requirements**: Low P99 latency, high availability (99.99%).\n"
                "2. **Data Model**: Relational DB (PostgreSQL) for transactional integrity + Redis cache layer.\n"
                "3. **Scalability**: Horizontal scaling behind NGINX / Cloud load balancers with DB read replicas."
            )

        # Default Helpful Mentor response
        return (
            f"💡 **KAIRO AI Mentor ({depth.upper()})**:{attachment_context}\n\n"
            "Great question! Moving from **Confusion → Clarity** on this topic requires 3 simple steps:\n\n"
            "1. **Core Concept**: Master the primary input/output boundary.\n"
            "2. **Hands-on Practice**: Implement a minimal working prototype.\n"
            "3. **Real-world Edge Cases**: Test under stress and high-concurrency loads.\n\n"
            "Keep pushing forward, Kritika! You're making progress every single day. 🚀"
        )

    @staticmethod
    def generate_roadmap(goal, college_year, skill_level, hours_per_day):
        week1_days = [
            ("Day 1", f"Core Foundations of {goal}", "Fundamentals", "Set up environment, dev tools, and basic hello world architecture."),
            ("Day 2", f"Data Structures & Key Concepts for {skill_level} Level", "DSA", "Practice 2 foundational problem sets and review syntax."),
            ("Day 3", f"Building the Core Module ({hours_per_day} hrs practice)", "Development", "Implement component layout and state management."),
            ("Day 4", "API Integration & Async Operations", "Backend", "Connect REST endpoints, handle loading and error states."),
            ("Day 5", "Database Schema & Query Optimization", "Database", "Design relational tables, indexes, and write migration scripts."),
            ("Day 6", "Testing, Debugging & Code Refactoring", "Quality", "Write unit tests, fix edge cases, and measure execution speed."),
            ("Day 7", "Weekly Review & Milestone Project", "Project", "Deploy initial working prototype and push to GitHub.")
        ]

        week2_days = [
            ("Day 8", "Advanced Patterns & Architecture", "Architecture", "Implement caching, state machine, and error boundaries."),
            ("Day 9", "Authentication & Security Hardening", "Security", "JWT tokens, CORS headers, password hashing, rate limiting."),
            ("Day 10", "Interview Preparation & System Design", "Interview", "Mock interview practice, system tradeoff analysis."),
            ("Day 11", "Performance Benchmarking", "Optimization", "Lighthouse audit, bundle size reduction, DB query profiling."),
            ("Day 12", "Portfolio Project Polish", "Portfolio", "Add documentation, write clean README, record demo video.")
        ]

        nodes = []
        node_idx = 1
        for day, title, cat, desc in week1_days:
            nodes.append({
                "id": f"gen_{node_idx}",
                "week_num": 1,
                "day_num": node_idx,
                "title": f"{day}: {title}",
                "description": desc,
                "category": cat,
                "completed": 0
            })
            node_idx += 1

        for day, title, cat, desc in week2_days:
            nodes.append({
                "id": f"gen_{node_idx}",
                "week_num": 2,
                "day_num": node_idx,
                "title": f"{day}: {title}",
                "description": desc,
                "category": cat,
                "completed": 0
            })
            node_idx += 1

        return nodes

    @staticmethod
    def generate_daily_schedule(hours_per_day=4):
        return [
            {"time_slot": "7:00 AM - 8:00 AM", "title": "Wake up & Mindful Morning", "category": "rest", "order_index": 1, "completed": 1},
            {"time_slot": "8:30 AM - 1:30 PM", "title": "College Classes & Lab Work", "category": "college", "order_index": 2, "completed": 0},
            {"time_slot": "2:30 PM - 4:30 PM", "title": f"DSA & LeetCode Problem Solving ({min(2, hours_per_day)}h)", "category": "study", "order_index": 3, "completed": 0},
            {"time_slot": "5:00 PM - 6:30 PM", "title": f"Project KAIRO Full-Stack Building ({max(2, hours_per_day-2)}h)", "category": "study", "order_index": 4, "completed": 0},
            {"time_slot": "7:00 PM - 8:00 PM", "title": "Fitness & Evening Run", "category": "health", "order_index": 5, "completed": 0},
            {"time_slot": "8:30 PM - 10:00 PM", "title": "Placement Prep & Communication Practice", "category": "interview", "order_index": 6, "completed": 0},
            {"time_slot": "10:30 PM", "title": "Night Recovery & Rest", "category": "rest", "order_index": 7, "completed": 0}
        ]

    @staticmethod
    def generate_flashcards(note_title, note_content):
        return [
            {
                "front": f"What is the core takeaway of {note_title}?",
                "back": note_content[:120] + "..." if len(note_content) > 120 else note_content
            },
            {
                "front": f"How do you apply the concepts from {note_title} in production?",
                "back": "By following modular architecture, validating all boundary conditions, and writing automated unit tests."
            }
        ]
