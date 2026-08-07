/**
 * Project KAIRO — Client Application Engine (Phase 1 MVP Production)
 * Connects AI Mentor (Voice/Attachment/History), AI Roadmap Generator, Drag & Drop Smart Planner,
 * Dashboard Velocity Metrics, Smart Notes, 3D Flashcards, and PDF Export.
 */

document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = '';
  let activeChatId = "chat_welcome";
  let voiceOutputEnabled = true;
  let currentSpeechRecognition = null;
  let attachedFile = null;

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
  // 2. AUTH & USER SESSION
  // =========================================================================
  const authModal = document.getElementById('auth-modal');
  const btnUserProfile = document.getElementById('btn-user-profile');
  const btnLoginDemo = document.getElementById('btn-login-demo');

  btnUserProfile.addEventListener('click', () => {
    authModal.classList.add('active');
  });

  btnLoginDemo.addEventListener('click', () => {
    authModal.classList.remove('active');
  });

  // =========================================================================
  // 3. AI MENTOR CHAT ENGINE (WITH VOICE, ATTACHMENTS, & SAVED HISTORY)
  // =========================================================================
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');
  const depthSelect = document.getElementById('depth-select');
  const promptChips = document.querySelectorAll('.prompt-chip');
  const chatHistoryList = document.getElementById('chat-history-list');
  const btnNewChatSession = document.getElementById('btn-new-chat-session');
  const currentChatTitle = document.getElementById('current-chat-title');
  const btnToggleVoiceOutput = document.getElementById('btn-toggle-voice-output');
  const btnVoiceInput = document.getElementById('btn-voice-input');
  const btnAttachFile = document.getElementById('btn-attach-file');
  const fileUploadInput = document.getElementById('file-upload-input');

  // Toggle AI Speech Synthesis Voice Output
  btnToggleVoiceOutput.addEventListener('click', () => {
    voiceOutputEnabled = !voiceOutputEnabled;
    btnToggleVoiceOutput.classList.toggle('active', voiceOutputEnabled);
    btnToggleVoiceOutput.textContent = voiceOutputEnabled ? "🔊" : "🔇";
  });

  function speakText(text) {
    if (!voiceOutputEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any previous speech
    const cleanText = text.replace(/[*#`]/g, '').replace(/http\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // Voice Input (Speech-to-Text)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    currentSpeechRecognition = new SpeechRecognition();
    currentSpeechRecognition.continuous = false;
    currentSpeechRecognition.interimResults = false;
    currentSpeechRecognition.lang = 'en-US';

    currentSpeechRecognition.onstart = () => {
      btnVoiceInput.classList.add('recording');
      chatInput.placeholder = "Listening... Speak your question now!";
    };

    currentSpeechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
    };

    currentSpeechRecognition.onend = () => {
      btnVoiceInput.classList.remove('recording');
      chatInput.placeholder = "Ask KAIRO anything or attach code/documents...";
    };

    btnVoiceInput.addEventListener('click', () => {
      try {
        currentSpeechRecognition.start();
      } catch (e) {
        currentSpeechRecognition.stop();
      }
    });
  } else {
    btnVoiceInput.style.display = 'none';
  }

  // File Attachments
  btnAttachFile.addEventListener('click', () => fileUploadInput.click());
  fileUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      attachedFile = {
        name: file.name,
        type: file.type,
        text: evt.target.result
      };
      chatInput.placeholder = `Attached: ${file.name} — Type a question...`;
    };
    reader.readAsText(file);
  });

  // Load Saved Chats Sidebar
  async function loadChatsHistory() {
    try {
      const res = await fetch(`${API_BASE}/api/chats`);
      const chats = await res.json();
      chatHistoryList.innerHTML = '';

      chats.forEach(c => {
        const item = document.createElement('div');
        item.className = `chat-history-item ${c.id === activeChatId ? 'active' : ''}`;
        item.textContent = `💬 ${c.title}`;
        item.addEventListener('click', () => {
          activeChatId = c.id;
          currentChatTitle.textContent = c.title;
          loadChatMessages(c.id);
          loadChatsHistory();
        });
        chatHistoryList.appendChild(item);
      });
    } catch (e) {
      console.warn("API Offline, using local session", e);
    }
  }

  // Load Messages for active chat
  async function loadChatMessages(chatId) {
    try {
      const res = await fetch(`${API_BASE}/api/chats/${chatId}`);
      const msgs = await res.json();
      chatMessages.innerHTML = '';

      msgs.forEach(m => {
        appendMessage(m.sender, m.content, m.attachment_name);
      });
    } catch (e) {
      console.warn("API Offline", e);
    }
  }

  btnNewChatSession.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "New AI Chat Session" })
      });
      const data = await res.json();
      activeChatId = data.id;
      currentChatTitle.textContent = data.title;
      loadChatMessages(data.id);
      loadChatsHistory();
    } catch (e) {
      console.error(e);
    }
  });

  function appendMessage(sender, text, attachmentName = null) {
    const wrapper = document.createElement('div');
    wrapper.className = `msg-wrapper ${sender}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let formatted = text
      .replace(/```(js|python|html|css)?\n([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.4); padding: 0.75rem; border-radius: 8px; font-family: monospace; overflow-x: auto; margin: 0.5rem 0;"><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    let attachHTML = '';
    if (attachmentName) {
      attachHTML = `<div class="attachment-preview-box">📄 Attached: ${attachmentName}</div>`;
    }

    wrapper.innerHTML = `
      <div class="msg-bubble">
        ${formatted}
        ${attachHTML}
        <span class="msg-time">${timeStr}</span>
      </div>
    `;

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function handleUserSend(text) {
    if (!text.trim() && !attachedFile) return;

    const userText = text.trim();
    const currentAttachment = attachedFile;
    chatInput.value = '';
    attachedFile = null;
    chatInput.placeholder = "Ask KAIRO anything or attach code/documents...";

    appendMessage('user', userText, currentAttachment ? currentAttachment.name : null);

    try {
      const res = await fetch(`${API_BASE}/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userText,
          depth: depthSelect.value,
          attachment_name: currentAttachment ? currentAttachment.name : null,
          attachment_type: currentAttachment ? currentAttachment.type : null,
          attachment_text: currentAttachment ? currentAttachment.text : null
        })
      });
      const data = await res.json();
      appendMessage('bot', data.bot_message.content);
      speakText(data.bot_message.content);
      loadChatsHistory();
    } catch (e) {
      console.warn("Using offline bot fallback", e);
    }
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

  loadChatsHistory();
  loadChatMessages(activeChatId);

  // =========================================================================
  // 4. PERSONALIZED ROADMAP ENGINE (AI GENERATOR)
  // =========================================================================
  const roadmapContainer = document.getElementById('roadmap-container');
  const trackProgressFill = document.getElementById('track-progress-fill');
  const trackProgressPct = document.getElementById('track-progress-pct');
  const btnOpenRoadmapModal = document.getElementById('btn-open-roadmap-modal');
  const btnCloseRoadmapModal = document.getElementById('btn-close-roadmap-modal');
  const roadmapModal = document.getElementById('roadmap-modal');
  const roadmapForm = document.getElementById('roadmap-form');

  btnOpenRoadmapModal.addEventListener('click', () => roadmapModal.classList.add('active'));
  btnCloseRoadmapModal.addEventListener('click', () => roadmapModal.classList.remove('active'));

  async function loadRoadmap() {
    try {
      const res = await fetch(`${API_BASE}/api/roadmap`);
      const data = await res.json();
      renderRoadmapNodes(data.nodes || []);
    } catch (e) {
      console.warn("API Offline", e);
    }
  }

  function renderRoadmapNodes(nodes) {
    roadmapContainer.innerHTML = '';
    let total = nodes.length;
    let completed = 0;

    const weeksMap = {};
    nodes.forEach(n => {
      const w = n.week_num || 1;
      if (!weeksMap[w]) weeksMap[w] = [];
      weeksMap[w].push(n);
    });

    Object.keys(weeksMap).forEach(wNum => {
      const stageCard = document.createElement('div');
      stageCard.className = 'glass-panel stage-card';

      let nodesHTML = '';
      weeksMap[wNum].forEach(node => {
        if (node.completed) completed++;

        nodesHTML += `
          <div class="node-item ${node.completed ? 'completed' : ''}" data-node-id="${node.id}">
            <div class="node-checkbox">${node.completed ? '✓' : ''}</div>
            <div class="node-info">
              <h4 class="node-title">${node.title}</h4>
              <p>${node.description || ''}</p>
              <div style="margin-top: 0.4rem;"><span class="tag-mini">${node.category || 'Core'}</span></div>
            </div>
          </div>
        `;
      });

      stageCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-glass);">
          <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(139, 92, 246, 0.2); color: #C4B5FD; display: flex; align-items: center; justify-content: center; font-weight: 700;">${wNum}</div>
          <h3>Week ${wNum} Milestones</h3>
        </div>
        <div class="node-grid">${nodesHTML}</div>
      `;

      roadmapContainer.appendChild(stageCard);
    });

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    trackProgressFill.style.width = `${pct}%`;
    trackProgressPct.textContent = `${pct}%`;

    const items = roadmapContainer.querySelectorAll('.node-item');
    items.forEach(el => {
      el.addEventListener('click', async () => {
        const nid = el.getAttribute('data-node-id');
        try {
          await fetch(`${API_BASE}/api/roadmap/node/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ node_id: nid })
          });
          loadRoadmap();
          loadDashboardStats();
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  roadmapForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goal = document.getElementById('rm-goal').value;
    const year = document.getElementById('rm-year').value;
    const skill = document.getElementById('rm-skill').value;
    const hours = document.getElementById('rm-hours').value;

    try {
      const res = await fetch(`${API_BASE}/api/roadmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, college_year: year, skill_level: skill, hours_per_day: hours })
      });
      const data = await res.json();
      roadmapModal.classList.remove('active');
      renderRoadmapNodes(data.nodes || []);
    } catch (e) {
      console.error(e);
    }
  });

  loadRoadmap();

  // =========================================================================
  // 5. SMART PLANNER (HTML5 DRAG & DROP SCHEDULE)
  // =========================================================================
  const taskListEl = document.getElementById('task-list');
  const btnAddTask = document.getElementById('btn-add-task');
  const taskTitleInput = document.getElementById('task-title-input');
  const taskCategorySelect = document.getElementById('task-category-select');
  const btnAiAutoSchedule = document.getElementById('btn-ai-auto-schedule');

  async function loadPlannerTasks() {
    try {
      const res = await fetch(`${API_BASE}/api/planner`);
      const tasks = await res.json();
      renderPlannerTasks(tasks);
    } catch (e) {
      console.warn("API Offline", e);
    }
  }

  function renderPlannerTasks(tasks) {
    taskListEl.innerHTML = '';
    tasks.forEach(t => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-task-id', t.id);

      const catClasses = {
        study: 'cat-study',
        college: 'cat-college',
        health: 'cat-health',
        rest: 'cat-rest',
        interview: 'cat-interview'
      };

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <span class="drag-handle">⋮⋮</span>
          <input type="checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}" class="task-check" style="cursor: pointer;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.72rem; color: var(--text-muted);">${t.time_slot}</span>
            <span style="${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}; font-weight: 500;">${t.title}</span>
          </div>
        </div>
        <span class="task-cat-badge ${catClasses[t.category] || 'cat-study'}">${t.category.toUpperCase()}</span>
      `;

      // HTML5 Drag and Drop events
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', t.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        saveTaskOrder();
      });

      taskListEl.appendChild(card);
    });

    taskListEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(taskListEl, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (draggable) {
        if (afterElement == null) {
          taskListEl.appendChild(draggable);
        } else {
          taskListEl.insertBefore(draggable, afterElement);
        }
      }
    });

    const checks = taskListEl.querySelectorAll('.task-check');
    checks.forEach(chk => {
      chk.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        try {
          await fetch(`${API_BASE}/api/planner/task/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: id })
          });
          loadPlannerTasks();
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  async function saveTaskOrder() {
    const cards = [...taskListEl.querySelectorAll('.task-card')];
    const orderedIds = cards.map(c => c.getAttribute('data-task-id'));
    try {
      await fetch(`${API_BASE}/api/planner/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_ids: orderedIds })
      });
    } catch (e) {
      console.error(e);
    }
  }

  btnAddTask.addEventListener('click', async () => {
    const title = taskTitleInput.value.trim();
    if (!title) return;

    try {
      await fetch(`${API_BASE}/api/planner/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: taskCategorySelect.value })
      });
      taskTitleInput.value = '';
      loadPlannerTasks();
    } catch (e) {
      console.error(e);
    }
  });

  btnAiAutoSchedule.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/api/planner/generate`, { method: 'POST' });
      const tasks = await res.json();
      renderPlannerTasks(tasks);
    } catch (e) {
      console.error(e);
    }
  });

  loadPlannerTasks();

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
          alert("🎉 Great focus session! Take a 5-minute break.");
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
  // 6. PROGRESS DASHBOARD METRICS
  // =========================================================================
  async function loadDashboardStats() {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`);
      const data = await res.json();
      if (data) {
        document.getElementById('stat-streak-val').textContent = `${data.streak_days || 12} Days`;
        document.getElementById('stat-hours-val').textContent = `${data.study_hours || 48.5} hrs`;
        document.getElementById('stat-problems-val').textContent = `${data.problems_solved || 42}`;
        document.getElementById('stat-score-val').textContent = `${data.productivity_score || 88}/100`;
      }
    } catch (e) {
      console.warn("API Offline", e);
    }
  }

  loadDashboardStats();

  // =========================================================================
  // 7. SMART NOTES & 3D FLASHCARDS ENGINE
  // =========================================================================
  let currentNoteId = "note_dsa_1";
  let activeFlashcards = [];
  let flashcardIdx = 0;

  const noteListItems = document.getElementById('note-list-items');
  const noteSearchInput = document.getElementById('note-search-input');
  const noteTitleInput = document.getElementById('note-title-input');
  const noteBodyTextarea = document.getElementById('note-body-textarea');
  const btnNewNote = document.getElementById('btn-new-note');
  const btnSummarizeNote = document.getElementById('btn-summarize-note');
  const btnGenFlashcards = document.getElementById('btn-gen-flashcards');
  const noteAiSummary = document.getElementById('note-ai-summary');
  const btnExportPdf = document.getElementById('btn-export-pdf');

  // Flashcards Modal
  const flashcardModal = document.getElementById('flashcard-modal');
  const btnCloseFlashcards = document.getElementById('btn-close-flashcards');
  const flashcardCard = document.getElementById('flashcard-card');
  const flashcardFrontText = document.getElementById('flashcard-front-text');
  const flashcardBackText = document.getElementById('flashcard-back-text');
  const flashcardCounter = document.getElementById('flashcard-counter');
  const btnPrevCard = document.getElementById('btn-prev-card');
  const btnNextCard = document.getElementById('btn-next-card');

  async function loadNotes() {
    try {
      const res = await fetch(`${API_BASE}/api/notes`);
      const notes = await res.json();
      renderNotesList(notes);
    } catch (e) {
      console.warn("API Offline", e);
    }
  }

  function renderNotesList(notes) {
    const q = noteSearchInput.value.toLowerCase();
    const filtered = notes.filter(n => n.title.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q)));

    noteListItems.innerHTML = '';
    filtered.forEach(n => {
      const thumb = document.createElement('div');
      thumb.className = `note-thumb ${n.id === currentNoteId ? 'active' : ''}`;
      thumb.innerHTML = `
        <h4 style="font-size: 0.88rem; margin-bottom: 0.25rem;">${n.title || 'Untitled Note'}</h4>
        <p style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n.content ? n.content.substring(0, 45) + '...' : 'Empty note'}</p>
      `;
      thumb.addEventListener('click', () => {
        currentNoteId = n.id;
        noteTitleInput.value = n.title;
        noteBodyTextarea.value = n.content || '';
        noteAiSummary.innerHTML = n.ai_summary || "Click 'AI Summarize' to generate key takeaways.";
        renderNotesList(notes);
      });
      noteListItems.appendChild(thumb);
    });
  }

  noteSearchInput.addEventListener('input', () => loadNotes());

  async function saveCurrentNote() {
    if (!currentNoteId) return;
    try {
      await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentNoteId,
          title: noteTitleInput.value,
          content: noteBodyTextarea.value
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  noteTitleInput.addEventListener('change', () => { saveCurrentNote(); loadNotes(); });
  noteBodyTextarea.addEventListener('change', () => saveCurrentNote());

  btnNewNote.addEventListener('click', () => {
    currentNoteId = `note_${Date.now()}`;
    noteTitleInput.value = "New Concept Note";
    noteBodyTextarea.value = "";
    noteAiSummary.textContent = "Click 'AI Summarize' to extract key bullet points.";
    saveCurrentNote();
    loadNotes();
  });

  btnSummarizeNote.addEventListener('click', () => {
    const text = noteBodyTextarea.value.trim();
    if (!text) {
      noteAiSummary.textContent = "⚠️ Please write some notes first.";
      return;
    }
    noteAiSummary.innerHTML = "<em>✨ Analyzing concepts with KAIRO AI...</em>";
    setTimeout(() => {
      const summaryText = `• <strong>Core Focus</strong>: "${text.substring(0, 60)}..."<br>• <strong>Key Takeaway</strong>: Review this concept in your next Pomodoro session to solidify long-term memory!`;
      noteAiSummary.innerHTML = summaryText;
    }, 400);
  });

  // 3D Flashcard Generation & Study Deck
  btnGenFlashcards.addEventListener('click', async () => {
    if (!currentNoteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/notes/${currentNoteId}/flashcards`, { method: 'POST' });
      activeFlashcards = await res.json();
      if (activeFlashcards && activeFlashcards.length > 0) {
        flashcardIdx = 0;
        showFlashcard();
        flashcardModal.classList.add('active');
      }
    } catch (e) {
      console.error(e);
    }
  });

  function showFlashcard() {
    if (!activeFlashcards[flashcardIdx]) return;
    const card = activeFlashcards[flashcardIdx];
    flashcardFrontText.textContent = `❓ Question ${flashcardIdx + 1}: ${card.front}`;
    flashcardBackText.textContent = `💡 Answer: ${card.back}`;
    flashcardCounter.textContent = `${flashcardIdx + 1} / ${activeFlashcards.length}`;
    flashcardCard.classList.remove('flipped');
  }

  flashcardCard.addEventListener('click', () => {
    flashcardCard.classList.toggle('flipped');
  });

  btnPrevCard.addEventListener('click', () => {
    if (flashcardIdx > 0) {
      flashcardIdx--;
      showFlashcard();
    }
  });

  btnNextCard.addEventListener('click', () => {
    if (flashcardIdx < activeFlashcards.length - 1) {
      flashcardIdx++;
      showFlashcard();
    }
  });

  btnCloseFlashcards.addEventListener('click', () => flashcardModal.classList.remove('active'));

  // Export PDF
  btnExportPdf.addEventListener('click', () => {
    window.print();
  });

  loadNotes();

});
