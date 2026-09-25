const TODO_KEY = 'schedule_todos';
const NOTIFIED_KEY = 'schedule_notified';

export function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveTodos(todos) {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

export function addTodo(todo) {
  const todos = loadTodos();
  const newTodo = { ...todo, id: Date.now(), completed: false };
  todos.push(newTodo);
  saveTodos(todos);
  return newTodo;
}

export function updateTodo(id, updates) {
  const todos = loadTodos().map((t) => (t.id === id ? { ...t, ...updates } : t));
  saveTodos(todos);
}

export function deleteTodo(id) {
  saveTodos(loadTodos().filter((t) => t.id !== id));
}

export function getNotifiedIds() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY)) || [];
  } catch {
    return [];
  }
}

export function addNotifiedId(id) {
  const ids = getNotifiedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids));
  }
}

export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

export function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '📅' });
  }
}
