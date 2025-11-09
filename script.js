class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.updateDate();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.clearAll = document.getElementById('clearAll');
        this.currentDate = document.getElementById('currentDate');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
        this.clearAll.addEventListener('click', () => this.clearAllTasks());
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.taskInput.focus();
            return;
        }

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.saveTasks();
        this.updateDisplay();
        
        // Add a subtle animation
        setTimeout(() => {
            const taskElement = document.querySelector(`[data-id="${task.id}"]`);
            if (taskElement) {
                taskElement.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    taskElement.style.transform = 'scale(1)';
                }, 150);
            }
        }, 100);
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateDisplay();
        }
    }

    deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
                this.updateDisplay();
            }, 300);
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.editingTaskId = taskId;
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        const taskTextElement = taskElement.querySelector('.task-text');
        const taskActionsElement = taskElement.querySelector('.task-actions');

        taskElement.classList.add('editing');
        
        // Create edit input
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'task-edit-input';
        editInput.value = task.text;
        
        // Create save and cancel buttons
        const editActions = document.createElement('div');
        editActions.className = 'edit-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'task-btn save-btn';
        saveBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'task-btn cancel-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        editActions.appendChild(saveBtn);
        editActions.appendChild(cancelBtn);
        
        // Insert edit elements
        taskTextElement.parentNode.insertBefore(editInput, taskTextElement);
        taskActionsElement.parentNode.replaceChild(editActions, taskActionsElement);
        
        editInput.focus();
        editInput.select();
        
        // Bind events
        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText && newText !== task.text) {
                task.text = newText;
                this.saveTasks();
            }
            this.cancelEdit(taskId);
        };
        
        const cancelEdit = () => this.cancelEdit(taskId);
        
        saveBtn.addEventListener('click', saveEdit);
        cancelBtn.addEventListener('click', cancelEdit);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });
    }

    cancelEdit(taskId) {
        this.editingTaskId = null;
        this.updateDisplay();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.updateDisplay();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    clearCompletedTasks() {
        if (this.tasks.some(task => task.completed)) {
            if (confirm('Are you sure you want to clear all completed tasks?')) {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.updateDisplay();
            }
        }
    }

    clearAllTasks() {
        if (this.tasks.length > 0) {
            if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
                this.tasks = [];
                this.saveTasks();
                this.updateDisplay();
            }
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
    }

    updateDisplay() {
        this.updateStats();
        
        const filteredTasks = this.getFilteredTasks();
        this.taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.emptyState.classList.remove('hidden');
            return;
        }
        
        this.emptyState.classList.add('hidden');
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="task-btn edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Bind events
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return li;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.currentDate.textContent = now.toLocaleDateString('en-US', options);
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus on input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('taskInput').focus();
    }
    
    // Escape to clear input or cancel editing
    if (e.key === 'Escape') {
        const input = document.getElementById('taskInput');
        if (document.activeElement === input) {
            input.value = '';
            input.blur();
        }
    }
});
