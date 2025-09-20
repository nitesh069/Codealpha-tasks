const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const completedList = document.getElementById('completed-list');
const prioritySelect = document.getElementById('priority');
const searchInput = document.getElementById('search');
const filterPriority = document.getElementById('filter-priority');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const toggleCompletedBtn = document.getElementById('toggle-completed');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let showCompleted = false;

darkModeToggle.addEventListener('click', () => document.body.classList.toggle('dark-mode'));
toggleCompletedBtn.addEventListener('click', () => {
    showCompleted = !showCompleted;
    completedList.style.display = showCompleted ? 'block' : 'none';
    toggleCompletedBtn.textContent = showCompleted ? 'Hide Completed Tasks' : 'Show Completed Tasks';
});

function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

function getFilteredTasks() {
    const searchText = searchInput.value.toLowerCase();
    const priorityFilter = filterPriority.value;
    return tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchText);
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });
}

let dragIndex = null;
function makeDraggable() {
    const items = document.querySelectorAll('#task-list li');
    items.forEach((item, index) => {
        item.draggable = true;
        item.addEventListener('dragstart', () => { dragIndex = index; item.classList.add('dragging'); });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
        item.addEventListener('dragover', e => e.preventDefault());
        item.addEventListener('drop', () => {
            const draggedTask = tasks[dragIndex];
            tasks.splice(dragIndex, 1);
            tasks.splice(index, 0, draggedTask);
            saveTasks();
            renderTasks();
        });
    });
}

function renderTasks() {
    taskList.innerHTML = '';
    completedList.innerHTML = '';

    getFilteredTasks().forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.name;

        const badge = document.createElement('span');
        badge.className = `badge ${task.priority}`;
        badge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        li.appendChild(badge);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', e => {
            e.stopPropagation();
            li.classList.add('fade-out');
            setTimeout(() => {
                const idx = tasks.indexOf(task);
                tasks.splice(idx, 1);
                saveTasks();
                renderTasks();
            }, 400);
        });
        li.appendChild(deleteBtn);

        li.addEventListener('click', () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        if (task.completed) completedList.appendChild(li);
        else taskList.appendChild(li);
    });

    makeDraggable();
}

addTaskBtn.addEventListener('click', () => {
    const taskName = taskInput.value.trim();
    const priority = prioritySelect.value;
    if (!taskName) return alert('Please enter a task!');
    tasks.push({ name: taskName, completed: false, priority });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    prioritySelect.value = 'low';
});

taskInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTaskBtn.click(); });
searchInput.addEventListener('input', renderTasks);
filterPriority.addEventListener('change', renderTasks);

renderTasks();