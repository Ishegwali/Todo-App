// To-Do App Dashboard Script
// Data Persistence via localStorage

const STORAGE_KEY = 'todo_app_dashboard_tasks';

// Application State
let tasks = [];
let currentStatusFilter = 'all';
let currentPriorityFilter = 'all';
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskCategoryInput = document.getElementById('task-category');
const taskPriorityInput = document.getElementById('task-priority');
const taskDueDateInput = document.getElementById('task-due-date');

const taskListContainer = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const currentDateEl = document.getElementById('current-date');

// Stats Elements
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');
const statHigh = document.getElementById('stat-high');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');

// Filter & Search Controls
const searchInput = document.getElementById('search-input');
const statusFiltersContainer = document.getElementById('status-filters');
const filterPrioritySelect = document.getElementById('filter-priority');
const filterCategorySelect = document.getElementById('filter-category');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  displayCurrentDate();
  loadTasks();
  setupEventListeners();
  render();
});

// Display Current Date in Header
function displayCurrentDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString('en-US', options);
}

// Load Tasks from WebStorage (localStorage)
function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      tasks = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      tasks = getSampleTasks();
    }
  } else {
    // Default seed tasks for first-time view
    tasks = getSampleTasks();
    saveTasks();
  }
}

// Save Tasks to WebStorage (localStorage)
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Initial Sample Tasks
function getSampleTasks() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return [
    {
      id: '1',
      title: 'Complete Q3 Project Proposal',
      category: 'Work',
      priority: 'High',
      dueDate: today,
      completed: false,
      createdAt: Date.now() - 10000
    },
    {
      id: '2',
      title: 'Buy groceries for dinner prep',
      category: 'Shopping',
      priority: 'Medium',
      dueDate: tomorrow,
      completed: true,
      createdAt: Date.now() - 20000
    },
    {
      id: '3',
      title: 'Schedule morning workout session',
      category: 'Health',
      priority: 'Low',
      dueDate: '',
      completed: false,
      createdAt: Date.now() - 30000
    }
  ];
}

// Setup Event Listeners
function setupEventListeners() {
  // Add Task
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    renderTasks();
  });

  // Status Filter Buttons
  statusFiltersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentStatusFilter = e.target.dataset.status;
      renderTasks();
    }
  });

  // Priority Filter
  filterPrioritySelect.addEventListener('change', (e) => {
    currentPriorityFilter = e.target.value;
    renderTasks();
  });

  // Category Filter
  filterCategorySelect.addEventListener('change', (e) => {
    currentCategoryFilter = e.target.value;
    renderTasks();
  });

  // Clear Completed
  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    render();
  });

  // Event Delegation for Task List Actions (Check, Edit, Delete)
  taskListContainer.addEventListener('click', (e) => {
    const taskCard = e.target.closest('.task-card');
    if (!taskCard) return;

    const taskId = taskCard.dataset.id;

    // Toggle Complete Checkbox
    if (e.target.classList.contains('task-checkbox')) {
      toggleTaskComplete(taskId);
    }

    // Delete Task
    if (e.target.classList.contains('delete-btn')) {
      deleteTask(taskId);
    }

    // Edit Task
    if (e.target.classList.contains('edit-btn')) {
      editTask(taskId);
    }
  });
}

// Add New Task
function addTask() {
  const title = taskTitleInput.value.trim();
  if (!title) return;

  const newTask = {
    id: Date.now().toString(),
    title: title,
    category: taskCategoryInput.value,
    priority: taskPriorityInput.value,
    dueDate: taskDueDateInput.value,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();

  // Reset form
  taskTitleInput.value = '';
  taskDueDateInput.value = '';
  taskPriorityInput.value = 'Medium';

  render();
}

// Toggle Task Completion
function toggleTaskComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// Edit Task
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newTitle = prompt('Edit Task Title:', task.title);
  if (newTitle !== null && newTitle.trim() !== '') {
    task.title = newTitle.trim();
    saveTasks();
    render();
  }
}

// Filter Tasks
function getFilteredTasks() {
  return tasks.filter(task => {
    // Status Filter
    if (currentStatusFilter === 'active' && task.completed) return false;
    if (currentStatusFilter === 'completed' && !task.completed) return false;

    // Priority Filter
    if (currentPriorityFilter !== 'all' && task.priority !== currentPriorityFilter) return false;

    // Category Filter
    if (currentCategoryFilter !== 'all' && task.category !== currentCategoryFilter) return false;

    // Search Query Filter
    if (currentSearchQuery) {
      const matchTitle = task.title.toLowerCase().includes(currentSearchQuery);
      const matchCategory = task.category.toLowerCase().includes(currentSearchQuery);
      if (!matchTitle && !matchCategory) return false;
    }

    return true;
  });
}

// Render Entire Dashboard
function render() {
  renderStats();
  renderTasks();
}

// Update Dashboard Overview Stats
function renderStats() {
  const total = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = total - completedCount;
  const highPriorityCount = tasks.filter(t => t.priority === 'High' && !t.completed).length;

  statTotal.textContent = total;
  statPending.textContent = pendingCount;
  statCompleted.textContent = completedCount;
  statHigh.textContent = highPriorityCount;

  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  progressText.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
}

// Render Task Cards List
function renderTasks() {
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    taskListContainer.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  taskListContainer.innerHTML = filtered.map(task => {
    const isOverdue = isTaskOverdue(task.dueDate, task.completed);
    const dateDisplay = formatDueDate(task.dueDate);
    const priorityClass = `badge-priority-${task.priority.toLowerCase()}`;

    return `
      <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark completed">
          <div class="task-details">
            <span class="task-title-text">${escapeHTML(task.title)}</span>
            <div class="task-meta">
              <span class="badge badge-category">${escapeHTML(task.category)}</span>
              <span class="badge ${priorityClass}">${task.priority} Priority</span>
              ${dateDisplay ? `<span class="task-date ${isOverdue ? 'overdue' : ''}">${dateDisplay}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-edit action-btn edit-btn">Edit</button>
          <button class="btn btn-danger action-btn delete-btn">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Check if Task is Overdue
function isTaskOverdue(dueDateStr, completed) {
  if (!dueDateStr || completed) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return dueDateStr < todayStr;
}

// Format Due Date Display Text
function formatDueDate(dueDateStr) {
  if (!dueDateStr) return '';

  const todayStr = new Date().toISOString().split('T')[0];

  if (dueDateStr === todayStr) {
    return 'Due Today';
  }

  const [year, month, day] = dueDateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (dueDateStr < todayStr) {
    return `Overdue (${formatted})`;
  }

  return `Due ${formatted}`;
}

// Escape HTML for XSS prevention
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
