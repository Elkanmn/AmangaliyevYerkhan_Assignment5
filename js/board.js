// TASK 2: Kanban board (arrays, loops, functions and DOM)
// Every task has a number, string, boolean and array among its properties.
const tasks = [
  { id: 1, title: 'Finish JavaScript notes', priority: 1, tag: 'Study', done: false, labels: ['Week 7'], status: 'todo' },
  { id: 2, title: 'Practice CSS Grid', priority: 2, tag: 'Code', done: false, labels: ['Frontend'], status: 'todo' },
  { id: 3, title: 'Review probability formulas', priority: 1, tag: 'Study', done: false, labels: ['Math'], status: 'todo' },
  { id: 4, title: 'Plan the weekend', priority: 3, tag: 'Personal', done: false, labels: ['Life'], status: 'todo' },
  { id: 5, title: 'Read DOM examples', priority: 2, tag: 'Code', done: false, labels: ['Week 8'], status: 'todo' },
  { id: 6, title: 'Build a small webpage', priority: 1, tag: 'Code', done: false, labels: ['Practice'], status: 'progress' },
  { id: 7, title: 'Prepare for the quiz', priority: 1, tag: 'Study', done: false, labels: ['Exam'], status: 'progress' },
  { id: 8, title: 'Organize lecture files', priority: 3, tag: 'Study', done: false, labels: ['Notes'], status: 'progress' },
  { id: 9, title: 'Complete HTML exercises', priority: 2, tag: 'Code', done: true, labels: ['Frontend'], status: 'done' },
  { id: 10, title: 'Submit practice homework', priority: 1, tag: 'Study', done: true, labels: ['Course'], status: 'done' },
  { id: 11, title: 'Clean the workspace', priority: 3, tag: 'Personal', done: true, labels: ['Life'], status: 'done' },
  { id: 12, title: 'Watch functions tutorial', priority: 2, tag: 'Code', done: true, labels: ['JS'], status: 'done' }
];

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'progress', title: 'In progress' },
  { id: 'done', title: 'Done' }
];
const PROGRESS_LIMIT = 3;
let nextTaskId = 13;

const boardEl = document.querySelector('#kanban-board');
const boardMessage = document.querySelector('#board-message');
const searchEl = document.querySelector('#board-search');
const filterEl = document.querySelector('#board-filter');
const sortEl = document.querySelector('#board-sort');

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function showBoardMessage(text, isError = false) {
  boardMessage.textContent = text;
  boardMessage.classList.toggle('is-error', isError);
}

function renderBoard() {
  boardEl.replaceChildren();

  // Own loop: calculate the number of finished tasks.
  let finished = 0;
  for (const task of tasks) {
    if (task.done === true) finished++;
  }
  document.querySelector('#board-progress-text').textContent = `${finished} of ${tasks.length} done`;
  const progress = document.querySelector('#board-progress');
  progress.max = Math.max(tasks.length, 1);
  progress.value = finished;

  const query = searchEl.value.trim().toLowerCase();
  const selectedTag = filterEl.value;
  let visibleCount = 0;

  for (const column of COLUMNS) {
    const section = makeElement('section', 'kanban-column');
    const list = makeElement('div', 'task-list');
    const matching = tasks.filter(task =>
      task.status === column.id &&
      (selectedTag === 'all' || task.tag === selectedTag) &&
      task.title.toLowerCase().includes(query)
    );
    matching.sort((a, b) => sortEl.value === 'high' ? a.priority - b.priority : b.priority - a.priority);
    visibleCount += matching.length;

    const heading = makeElement('h3', 'column-heading', column.title);
    heading.append(makeElement('span', 'column-count', String(matching.length)));
    section.append(heading);

    for (const task of matching) {
      const card = makeElement('article', 'task-card');
      const category = makeElement('span', 'task-tag', task.tag);
      const title = makeElement('h4', '', task.title);
      const priorityName = ['High', 'Medium', 'Low'][task.priority - 1];
      const priority = makeElement('span', `priority priority-${task.priority}`, `${priorityName} priority`);
      const meta = makeElement('div', 'task-meta');
      meta.append(category, priority);
      card.append(meta, title);

      const actions = makeElement('div', 'task-actions');
      if (task.status !== 'todo') {
        const back = makeElement('button', 'small-button', '← Back');
        back.type = 'button';
        back.dataset.action = 'back';
        back.dataset.id = String(task.id);
        back.setAttribute('aria-label', `Move ${task.title} backward`);
        actions.append(back);
      }
      if (task.status !== 'done') {
        const next = makeElement('button', 'small-button small-button-primary', 'Next →');
        next.type = 'button';
        next.dataset.action = 'next';
        next.dataset.id = String(task.id);
        next.setAttribute('aria-label', `Move ${task.title} forward`);
        actions.append(next);
      }
      card.append(actions);
      list.append(card);
    }
    if (matching.length === 0) {
      list.append(makeElement('p', 'empty-column', 'No tasks here.'));
    }
    section.append(list);
    boardEl.append(section);
  }
  document.querySelector('#board-empty').hidden = visibleCount !== 0;
}

// One listener on the board handles ALL task buttons (event delegation).
boardEl.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || !boardEl.contains(button)) return;

  const task = tasks.find(item => item.id === Number(button.dataset.id));
  if (!task) return;

  if (button.dataset.action === 'next') {
    if (task.status === 'todo') {
      let progressCount = 0;
      for (const item of tasks) {
        if (item.status === 'progress') progressCount++;
      }
      if (progressCount >= PROGRESS_LIMIT) {
        showBoardMessage('In Progress is full (maximum 3). Move another task to Done first.', true);
        return; // Blocked: do not change the array.
      }
      task.status = 'progress';
    } else if (task.status === 'progress') {
      task.status = 'done';
    }
  } else if (button.dataset.action === 'back') {
    if (task.status === 'done') {
      let progressCount = 0;
      for (const item of tasks) {
        if (item.status === 'progress') progressCount++;
      }
      if (progressCount >= PROGRESS_LIMIT) {
        showBoardMessage('In Progress is full (maximum 3).', true);
        return;
      }
      task.status = 'progress';
    } else if (task.status === 'progress') {
      task.status = 'todo';
    }
  }
  task.done = task.status === 'done';
  showBoardMessage(`Moved "${task.title}" successfully.`);
  renderBoard();
});

for (const control of [searchEl, filterEl, sortEl]) {
  control.addEventListener(control === searchEl ? 'input' : 'change', renderBoard);
}

document.querySelector('#new-task-form').addEventListener('submit', event => {
  event.preventDefault();
  const titleInput = document.querySelector('#new-task-title');
  const title = titleInput.value.trim();
  if (title.length < 3) {
    showBoardMessage('Task name must have at least 3 characters.', true);
    titleInput.focus();
    return;
  }
  tasks.push({
    id: nextTaskId++, title: title,
    priority: Number(document.querySelector('#new-task-priority').value),
    tag: document.querySelector('#new-task-tag').value,
    done: false, labels: ['New'], status: 'todo'
  });
  event.target.reset();
  searchEl.value = '';
  filterEl.value = 'all';
  showBoardMessage(`Added "${title}" to To do.`);
  renderBoard();
});

// This empty message belongs to the page controls, not to the task data.
const emptyBoard = makeElement('p', 'board-empty', 'No tasks match your search or filter.');
emptyBoard.id = 'board-empty';
emptyBoard.hidden = true;
boardEl.after(emptyBoard);
renderBoard();
