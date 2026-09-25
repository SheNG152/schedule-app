import { useState, useEffect } from 'react';
import { COURSES, getCurrentWeek, DAY_NAMES, TIME_SLOTS } from './data';
import {
  loadTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  requestNotificationPermission,
  sendNotification,
  getNotifiedIds,
  addNotifiedId,
} from './storage';
import './App.css';

function Home({ onNavigate }) {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('');

  useEffect(() => {
    setTodos(loadTodos());
    requestNotificationPermission();
    checkReminders();
  }, []);

  function checkReminders() {
    const week = getCurrentWeek();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const notifiedIds = getNotifiedIds();

    COURSES.forEach((course) => {
      if (course.day === now.getDay() && course.weeks.includes(week)) {
        const slot = TIME_SLOTS.find((s) => s.period === course.startPeriod);
        if (slot) {
          const [startStr] = slot.time.split('-');
          const [h, m] = startStr.split(':').map(Number);
          const courseMinutes = h * 60 + m;
          const diff = courseMinutes - currentMinutes;

          if (diff > 0 && diff <= 30 && !notifiedIds.includes(course.id)) {
            sendNotification('课程提醒', `${course.name} 将在 ${slot.time} 开始`);
            addNotifiedId(course.id);
          }
        }
      }
    });

    const todayStr = now.toISOString().split('T')[0];
    todos.forEach((todo) => {
      if (todo.date === todayStr && !todo.completed && !notifiedIds.includes(`todo-${todo.id}`)) {
        sendNotification('待办提醒', `今日待办：${todo.text}`);
        addNotifiedId(`todo-${todo.id}`);
      }
    });
  }

  function handleAddTodo(e) {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const todo = addTodo({ text: newTodoText.trim(), date: newTodoDate });
    setTodos([...todos, todo]);
    setNewTodoText('');
    setNewTodoDate('');
  }

  function handleToggle(id) {
    const todo = todos.find((t) => t.id === id);
    updateTodo(id, { completed: !todo.completed });
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function handleDelete(id) {
    deleteTodo(id);
    setTodos(todos.filter((t) => t.id !== id));
  }

  const week = getCurrentWeek();
  const today = new Date();
  const todayDay = today.getDay() || 7;
  const todayCourses = COURSES.filter(
    (c) => c.day === todayDay && c.weeks.includes(week)
  );

  return (
    <div className="home-page">
      <div className="today-section">
        <h2>📅 今天 ({DAY_NAMES[todayDay]})</h2>
        <p className="week-info">第 {week} 周</p>
        {todayCourses.length === 0 ? (
          <p className="no-courses">今天没有课 🎉</p>
        ) : (
          <div className="course-list">
            {todayCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-time">
                  {TIME_SLOTS.find((s) => s.period === course.startPeriod)?.time.split('-')[0]} -{' '}
                  {TIME_SLOTS.find((s) => s.period === course.endPeriod)?.time.split('-')[1]}
                </div>
                <div className="course-name">{course.name}</div>
                <div className="course-detail">
                  {course.teacher} · {course.location}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="todo-section">
        <h2>📝 待办事项</h2>
        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="添加待办..."
            className="todo-input"
          />
          <input
            type="date"
            value={newTodoDate}
            onChange={(e) => setNewTodoDate(e.target.value)}
            className="todo-date-input"
          />
          <button type="submit" className="add-btn">
            添加
          </button>
        </form>
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
              />
              <span className="todo-text">{todo.text}</span>
              {todo.date && <span className="todo-date">{todo.date}</span>}
              <button className="delete-btn" onClick={() => handleDelete(todo.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WeeklySchedule() {
  const week = getCurrentWeek();
  const weekCourses = COURSES.filter((c) => c.weeks.includes(week));

  return (
    <div className="weekly-page">
      <h2>📆 第 {week} 周课表</h2>
      <div className="schedule-grid">
        <div className="schedule-header-cell time-header" style={{ gridRow: 1 }}>时间</div>
        {DAY_NAMES.slice(1).map((day, i) => (
          <div key={i} className="schedule-header-cell day-header" style={{ gridRow: 1, gridColumn: i + 2 }}>
            {day}
          </div>
        ))}
        {TIME_SLOTS.map((slot) => (
          <div
            key={`time-${slot.period}`}
            className="time-cell"
            style={{ gridRow: slot.period + 1 }}
          >
            <div className="period-num">{slot.period}</div>
            <div className="period-time">{slot.time}</div>
          </div>
        ))}
        {TIME_SLOTS.map((slot) =>
          Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
            const course = weekCourses.find(
              (c) => c.day === day && c.startPeriod === slot.period
            );
            if (!course) return null;
            return (
              <div
                key={`course-${course.id}`}
                className="course-block"
                style={{
                  gridColumn: day + 1,
                  gridRow: `${slot.period + 1} / span ${course.endPeriod - course.startPeriod + 1}`,
                }}
              >
                <div className="block-name">{course.name}</div>
                <div className="block-detail">{course.teacher}</div>
                <div className="block-location">{course.location}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const week = getCurrentWeek();

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 课程表</h1>
        <p className="header-subtitle">第 {week} 周</p>
      </header>
      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 首页
        </button>
        <button
          className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          📆 周课表
        </button>
        <button
          className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          📝 待办
        </button>
      </nav>
      <main className="main-content">
        {activeTab === 'home' && <Home />}
        {activeTab === 'weekly' && <WeeklySchedule />}
        {activeTab === 'todos' && (
          <TodoList
            todos={loadTodos()}
            onAdd={(text, date) => {
              const todo = addTodo({ text, date });
              return todo;
            }}
            onToggle={(id) => {
              const todo = loadTodos().find((t) => t.id === id);
              updateTodo(id, { completed: !todo.completed });
            }}
            onDelete={(id) => {
              deleteTodo(id);
            }}
          />
        )}
      </main>
    </div>
  );
}

function TodoList({ todos: initialTodos, onAdd, onToggle, onDelete }) {
  const [todos, setTodos] = useState(initialTodos);
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    const todo = onAdd(newText.trim(), newDate);
    setTodos([...todos, todo]);
    setNewText('');
    setNewDate('');
  }

  function handleToggle(id) {
    onToggle(id);
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function handleDelete(id) {
    onDelete(id);
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="todo-page">
      <h2>📝 待办事项</h2>
      <form className="todo-form" onSubmit={handleAdd}>
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="添加待办..."
          className="todo-input"
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="todo-date-input"
        />
        <button type="submit" className="add-btn">
          添加
        </button>
      </form>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span className="todo-text">{todo.text}</span>
            {todo.date && <span className="todo-date">{todo.date}</span>}
            <button className="delete-btn" onClick={() => handleDelete(todo.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
