/**
 * KAIRO — App Engine
 * Interactive logic for AI Mentor, Personalized Roadmap, Smart Planner, Pomodoro Timer, & Smart Notes
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. TAB NAVIGATION SYSTEM
  // =========================================================================
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      if (!targetTab) return;

      navItems.forEach(nav => nav.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      item.classList.add('active');
      const activePane = document.getElementById(targetTab);
      if (activePane) activePane.classList.add('active');
    });
  });

  // =========================================================================
  // 2. AI MENTOR CHAT ENGINE
  // =========================================================================
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');
  const depthSelect = document.getElementById('depth-select');
  const promptChips = document.querySelectorAll('.prompt-chip');

  const botKnowledge = {
    recursion: {
      beginner: "🌱 **Recursion Made Simple**: Imagine standing between two parallel mirrors, seeing infinite reflections. In code, recursion happens when a function calls itself to solve smaller pieces of a problem, until it hits a stopping condition called a **Base Case**.\n\nWithout a base case, it goes on forever (causing a stack overflow)!",
      intermediate: "⚡ **Recursion vs Iteration**:\n\n```js\n// Recursive Factorial\nfunction factorial(n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive step\n}\n```\nKey points:\n1. Base Case prevents infinite loop.\n2. Call stack stores return addresses.\n3. Iteration uses loops (`for`/`while`) which consume O(1) extra stack space, while simple recursion uses O(N) call stack space.",
      advanced: "🔬 **Deep Dive**: Tail Call Optimization (TCO) allows recursive calls in tail position to reuse stack frames. In dynamic programming, recursive solutions map directly to DAG subproblems with memoization tables converting recursive top-down equations into bottom-up iteration."
    },
    system: {
      beginner: "🌱 **System Design 101**: System design is about building applications that handle millions of users without crashing. Think of it like designing a city's road network instead of just building a single house.",
      intermediate: "⚡ **Core Pillars of System Design**:\n1. **Load Balancing**: Distributing incoming HTTP traffic evenly across multiple app servers using Round-Robin or Least-Connections algorithms.\n2. **Database Caching**: Storing hot keys in Redis or Memcached to avoid costly SQL queries.\n3. **Database Sharding & Replication**: Read replicas for scalability, partitioning data across multiple database nodes.",
      advanced: "🔬 **High-Availability & Consistency**: CAP Theorem dictates choosing between Consistency and Availability during network partitions. Eventual consistency strategies utilize Vector Clocks, Gossip Protocols, and Consistent Hashing rings with virtual nodes."
    },
    nextjs: {
      beginner: "🌱 **Next.js Quick Start**: Next.js is a framework built on top of React. It gives you automatic routing, fast loading times, and server rendering out of the box!",
      intermediate: "⚡ **Next.js App Router Highlights**:\n1. **Server Components (RSC)**: Render heavy components on the server without sending JS bundle weight to the client.\n2. **Server Actions**: Mutate database state directly from components using async functions.\n3. **API Routes**: Create backend endpoints easily in `app/api/route.js`.",
      advanced: "🔬 **Architecture**: Next.js integrates React Fiber streaming architecture with Suspense boundaries, static site generation (SSG), Incremental Static Regeneration (ISR), and edge middleware deployment."
    },
    ai: {
      beginner: "🌱 **AI Engineering Strategy**: Start by mastering Python, understanding how matrix math works, and building small apps using LLM APIs like OpenAI and Gemini before moving to complex models.",
      intermediate: "⚡ **30-Day AI Roadmap**:\n- Week 1: Python, NumPy, Pandas data wrangling.\n- Week 2: Prompt Engineering, RAG (Retrieval-Augmented Generation), Vector DBs (Chroma/Pinecone).\n- Week 3: LangChain / LlamaIndex orchestration.\n- Week 4: Fine-tuning, model evaluation, and deployment.",
      advanced: "🔬 **LLM Systems**: RAG architecture relies on semantic embedding vectors, HNSW graph indexing for vector similarity search, context window optimization, and fine-tuning with LoRA (Low-Rank Adaptation)."
    }
  };

  function appendMessage(sender, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `msg-wrapper ${sender}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format text markdown code blocks & line breaks
    let formatted = text
      .replace(/```(js|python|html|css)?\n([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.4); padding: 0.75rem; border-radius: 8px; font-family: monospace; overflow-x: auto; margin: 0.5rem 0;"><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    wrapper.innerHTML = `
      <div class="msg-bubble">
        ${formatted}
        <span class="msg-time">${timeStr}</span>
      </div>
    `;

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleUserSend(text) {
    if (!text.trim()) return;
    appendMessage('user', text);
    chatInput.value = '';

    // Simulate AI thinking
    setTimeout(() => {
      const depth = depthSelect.value || 'intermediate';
      const queryLower = text.toLowerCase();
      let responseText = "";

      if (queryLower.includes('recursion') || queryLower.includes('iteration')) {
        responseText = botKnowledge.recursion[depth];
      } else if (queryLower.includes('system design') || queryLower.includes('architecture')) {
        responseText = botKnowledge.system[depth];
      } else if (queryLower.includes('next') || queryLower.includes('react')) {
        responseText = botKnowledge.nextjs[depth];
      } else if (queryLower.includes('ai') || queryLower.includes('roadmap') || queryLower.includes('strategy')) {
        responseText = botKnowledge.ai[depth];
      } else {
        responseText = `💡 **KAIRO AI Guidance (${depth.toUpperCase()})**:\n\nGreat question! Regarding "${text}":\n\nTo move from **Confusion → Clarity**, start by breaking this topic into 3 core steps:\n1. **Core Concept**: Understand the fundamental inputs and outputs.\n2. **Hands-on Practice**: Build a minimal 10-line prototype to test edge cases.\n3. **Real-world Application**: Review how top production systems implement this pattern.\n\nKeep up the consistency on Day 1! 🚀`;
      }

      appendMessage('bot', responseText);
    }, 600);
  }

  btnSendChat.addEventListener('click', () => handleUserSend(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserSend(chatInput.value);
  });

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) handleUserSend(promptText);
    });
  });

  // =========================================================================
  // 3. PERSONALIZED ROADMAP ENGINE
  // =========================================================================
  const tracksData = {
    swe: {
      stages: [
        {
          num: 1,
          name: "Core Fundamentals & Data Structures",
          nodes: [
            { id: "s1_1", title: "Array & Hashing Operations", desc: "Master Two-Pointers, Sliding Window, and HashMaps.", completed: true, tag: "DSA" },
            { id: "s1_2", title: "Git & Version Control Mastery", desc: "Branching, rebase vs merge, PR workflows.", completed: true, tag: "Tools" },
            { id: "s1_3", title: "Asynchronous JavaScript & Event Loop", desc: "Promises, async/await, microtask queue.", completed: false, tag: "JS" }
          ]
        },
        {
          num: 2,
          name: "Full-Stack Development & DB Architecture",
          nodes: [
            { id: "s2_1", title: "RESTful API & Express Architecture", desc: "Middleware chains, authentication, CORS.", completed: false, tag: "Backend" },
            { id: "s2_2", title: "PostgreSQL & Prisma ORM Schema Design", desc: "Relational constraints, indexes, migrations.", completed: false, tag: "Database" },
            { id: "s2_3", title: "Next.js App Router & Tailwind Styling", desc: "Server components, responsive UI layouts.", completed: false, tag: "Frontend" }
          ]
        }
      ]
    },
    ai: {
      stages: [
        {
          num: 1,
          name: "AI & Data Engineering Foundations",
          nodes: [
            { id: "a1_1", title: "Python for Data Science (NumPy/Pandas)", desc: "Vectorized operations, array slicing, DataFrames.", completed: true, tag: "Python" },
            { id: "a1_2", title: "Linear Algebra & Calculus Basics", desc: "Matrix multiplication, gradients, partial derivatives.", completed: false, tag: "Math" }
          ]
        },
        {
          num: 2,
          name: "LLMs, RAG & Agentic Systems",
          nodes: [
            { id: "a2_1", title: "Embeddings & Vector Databases", desc: "ChromaDB, cosine similarity, vector indexing.", completed: false, tag: "RAG" },
            { id: "a2_2", title: "LangChain & Multi-Agent Frameworks", desc: "Tool use, prompt templates, memory managers.", completed: false, tag: "Agents" }
          ]
        }
      ]
    },
    ds: {
      stages: [
        {
          num: 1,
          name: "Exploratory Data Analysis & Statistics",
          nodes: [
            { id: "d1_1", title: "Probability & Hypothesis Testing", desc: "Z-scores, p-values, A/B testing statistical rigor.", completed: true, tag: "Stats" },
            { id: "d1_2", title: "Data Visualization (Seaborn & Plotly)", desc: "Interactive charts, trend analysis.", completed: false, tag: "Viz" }
          ]
        }
      ]
    },
    cyber: {
      stages: [
        {
          num: 1,
          name: "Networking & Security Principles",
          nodes: [
            { id: "c1_1", title: "TCP/IP Protocol Stack & Wireshark", desc: "Packet capture, HTTP/HTTPS security, TLS handshakes.", completed: true, tag: "Network" },
            { id: "c1_2", title: "OWASP Top 10 Vulnerabilities", desc: "SQL injection, XSS, CSRF mitigation.", completed: false, tag: "Security" }
          ]
        }
      ]
    }
  };

  let currentTrack = "swe";
  const roadmapContainer = document.getElementById('roadmap-container');
  const trackTabs = document.querySelectorAll('.track-tab');
  const trackProgressFill = document.getElementById('track-progress-fill');
  const trackProgressPct = document.getElementById('track-progress-pct');

  function renderRoadmap() {
    const track = tracksData[currentTrack];
    if (!track) return;

    roadmapContainer.innerHTML = '';
    let totalNodes = 0;
    let completedNodes = 0;

    track.stages.forEach(stage => {
      const stageCard = document.createElement('div');
      stageCard.className = 'glass-panel stage-card';

      let nodesHTML = '';
      stage.nodes.forEach(node => {
        totalNodes++;
        if (node.completed) completedNodes++;

        nodesHTML += `
          <div class="node-item ${node.completed ? 'completed' : ''}" data-node-id="${node.id}">
            <div class="node-checkbox">${node.completed ? '✓' : ''}</div>
            <div class="node-info">
              <h4 class="node-title">${node.title}</h4>
              <p>${node.desc}</p>
              <div class="node-tags">
                <span class="tag-mini">${node.tag}</span>
              </div>
            </div>
          </div>
        `;
      });

      stageCard.innerHTML = `
        <div class="stage-header">
          <div class="stage-title">
            <div class="stage-num">${stage.num}</div>
            <h3>${stage.name}</h3>
          </div>
        </div>
        <div class="node-grid">
          ${nodesHTML}
        </div>
      `;

      roadmapContainer.appendChild(stageCard);
    });

    // Update Progress
    const pct = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
    trackProgressFill.style.width = `${pct}%`;
    trackProgressPct.textContent = `${pct}%`;

    // Attach Checkbox Toggle
    const nodeElements = roadmapContainer.querySelectorAll('.node-item');
    nodeElements.forEach(el => {
      el.addEventListener('click', () => {
        const nodeId = el.getAttribute('data-node-id');
        track.stages.forEach(stage => {
          stage.nodes.forEach(n => {
            if (n.id === nodeId) {
              n.completed = !n.completed;
            }
          });
        });
        renderRoadmap();
      });
    });
  }

  trackTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      trackTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTrack = tab.getAttribute('data-track');
      renderRoadmap();
    });
  });

  renderRoadmap();

  // =========================================================================
  // 4. SMART PLANNER & POMODORO TIMER
  // =========================================================================
  let tasks = [
    { id: 1, title: "Solve 2 LeetCode Medium Problems", category: "study", done: true },
    { id: 2, title: "Attend Software Engineering Lecture", category: "college", done: false },
    { id: 3, title: "Evening 30-min Cardio / Run", category: "health", done: false },
    { id: 4, title: "Mindfulness & Sleep Wind-down", category: "rest", done: false }
  ];

  const taskListEl = document.getElementById('task-list');
  const btnAddTask = document.getElementById('btn-add-task');
  const taskTitleInput = document.getElementById('task-title-input');
  const taskCategorySelect = document.getElementById('task-category-select');

  function renderTasks() {
    taskListEl.innerHTML = '';
    tasks.forEach(t => {
      const card = document.createElement('div');
      card.className = 'task-card';

      const catClasses = {
        study: 'cat-study',
        college: 'cat-college',
        health: 'cat-health',
        rest: 'cat-rest'
      };

      card.innerHTML = `
        <div class="task-left">
          <input type="checkbox" ${t.done ? 'checked' : ''} data-id="${t.id}" class="task-check" style="cursor: pointer;">
          <span style="${t.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.title}</span>
        </div>
        <span class="task-cat-badge ${catClasses[t.category] || 'cat-study'}">${t.category.toUpperCase()}</span>
      `;

      taskListEl.appendChild(card);
    });

    const checks = taskListEl.querySelectorAll('.task-check');
    checks.forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const task = tasks.find(x => x.id === id);
        if (task) task.done = e.target.checked;
        renderTasks();
      });
    });
  }

  btnAddTask.addEventListener('click', () => {
    const title = taskTitleInput.value.trim();
    if (!title) return;
    tasks.push({
      id: Date.now(),
      title: title,
      category: taskCategorySelect.value,
      done: false
    });
    taskTitleInput.value = '';
    renderTasks();
  });

  renderTasks();

  // Pomodoro Logic
  let timerInterval = null;
  let secondsLeft = 25 * 60;
  let isTimerRunning = false;

  const timerDisplay = document.getElementById('timer-display');
  const timerStatus = document.getElementById('timer-status');
  const btnTimerStart = document.getElementById('btn-timer-start');
  const btnTimerReset = document.getElementById('btn-timer-reset');

  function updateTimerDisplay() {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  btnTimerStart.addEventListener('click', () => {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      btnTimerStart.textContent = "▶ Resume Session";
      timerStatus.textContent = "PAUSED";
    } else {
      isTimerRunning = true;
      btnTimerStart.textContent = "⏸ Pause Session";
      timerStatus.textContent = "DEEP FOCUS";
      timerInterval = setInterval(() => {
        if (secondsLeft > 0) {
          secondsLeft--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          isTimerRunning = false;
          alert("🎉 Great focus session! Time for a 5-minute break.");
          secondsLeft = 25 * 60;
          updateTimerDisplay();
          btnTimerStart.textContent = "▶ Start Session";
          timerStatus.textContent = "READY";
        }
      }, 1000);
    }
  });

  btnTimerReset.addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    secondsLeft = 25 * 60;
    updateTimerDisplay();
    btnTimerStart.textContent = "▶ Start Session";
    timerStatus.textContent = "READY";
  });

  updateTimerDisplay();

  // =========================================================================
  // 5. SMART NOTES ENGINE
  // =========================================================================
  let notes = JSON.parse(localStorage.getItem('kairo_notes')) || [
    {
      id: 1,
      title: "System Design — Load Balancing & Caching",
      content: "Load balancers distribute traffic across multiple servers using algorithms like Round Robin or Least Connections.\n\nRedis is an in-memory key-value store used to cache frequent DB query results to decrease latency."
    },
    {
      id: 2,
      title: "Recursion & Call Stack Takeaways",
      content: "Always define a clear base case to avoid stack overflow. Iterative solutions use O(1) space, while simple recursion uses O(N) call stack space."
    }
  ];

  let activeNoteId = notes[0] ? notes[0].id : null;

  const noteListItems = document.getElementById('note-list-items');
  const noteTitleInput = document.getElementById('note-title-input');
  const noteBodyTextarea = document.getElementById('note-body-textarea');
  const btnNewNote = document.getElementById('btn-new-note');
  const btnSummarizeNote = document.getElementById('btn-summarize-note');
  const noteAiSummary = document.getElementById('note-ai-summary');

  function saveNotesToStorage() {
    localStorage.setItem('kairo_notes', JSON.stringify(notes));
  }

  function renderNotesList() {
    noteListItems.innerHTML = '';
    notes.forEach(n => {
      const thumb = document.createElement('div');
      thumb.className = `note-thumb ${n.id === activeNoteId ? 'active' : ''}`;
      thumb.innerHTML = `
        <h4>${n.title || 'Untitled Note'}</h4>
        <p>${n.content ? n.content.substring(0, 45) + '...' : 'Empty note'}</p>
      `;
      thumb.addEventListener('click', () => {
        activeNoteId = n.id;
        loadActiveNote();
        renderNotesList();
      });
      noteListItems.appendChild(thumb);
    });
  }

  function loadActiveNote() {
    const currentNote = notes.find(n => n.id === activeNoteId);
    if (currentNote) {
      noteTitleInput.value = currentNote.title;
      noteBodyTextarea.value = currentNote.content;
      noteAiSummary.textContent = "Click 'Generate AI Summary' to extract key action items.";
    } else {
      noteTitleInput.value = '';
      noteBodyTextarea.value = '';
    }
  }

  noteTitleInput.addEventListener('input', () => {
    const currentNote = notes.find(n => n.id === activeNoteId);
    if (currentNote) {
      currentNote.title = noteTitleInput.value;
      saveNotesToStorage();
      renderNotesList();
    }
  });

  noteBodyTextarea.addEventListener('input', () => {
    const currentNote = notes.find(n => n.id === activeNoteId);
    if (currentNote) {
      currentNote.content = noteBodyTextarea.value;
      saveNotesToStorage();
    }
  });

  btnNewNote.addEventListener('click', () => {
    const newNote = {
      id: Date.now(),
      title: "New Note",
      content: ""
    };
    notes.unshift(newNote);
    activeNoteId = newNote.id;
    saveNotesToStorage();
    renderNotesList();
    loadActiveNote();
  });

  btnSummarizeNote.addEventListener('click', () => {
    const content = noteBodyTextarea.value.trim();
    if (!content) {
      noteAiSummary.textContent = "⚠️ Please write some notes first before generating a summary.";
      return;
    }

    noteAiSummary.innerHTML = "<em>✨ Analyzing note contents with KAIRO AI...</em>";
    setTimeout(() => {
      const words = content.split(' ');
      noteAiSummary.innerHTML = `
        • <strong>Core Concept</strong>: "${content.substring(0, 60)}..."<br>
        • <strong>Word Count</strong>: ${words.length} words<br>
        • <strong>Key Takeaway</strong>: Review this concept in your next Pomodoro session to solidify memory retention!
      `;
    }, 500);
  });

  renderNotesList();
  loadActiveNote();

});
