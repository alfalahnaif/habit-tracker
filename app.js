const STORAGE_KEY = "simple-habit-tracker-v1";

const form = document.querySelector("#habitForm");
const input = document.querySelector("#habitInput");
const grid = document.querySelector("#grid");
const weekLabel = document.querySelector("#weekLabel");
const emptyState = document.querySelector("#emptyState");
const trackerPanel = document.querySelector("#trackerPanel");
const prevWeekBtn = document.querySelector("#prevWeek");
const nextWeekBtn = document.querySelector("#nextWeek");
const todayWeekBtn = document.querySelector("#todayWeek");

let state = loadState();
let visibleWeekStart = startOfWeek(new Date());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = input.value.trim();

  if (!name) return;

  state.habits.push({
    id: createId(),
    name,
    createdAt: toDateKey(new Date())
  });

  input.value = "";
  saveAndRender();
});

prevWeekBtn.addEventListener("click", () => {
  visibleWeekStart = addDays(visibleWeekStart, -7);
  render();
});

nextWeekBtn.addEventListener("click", () => {
  visibleWeekStart = addDays(visibleWeekStart, 7);
  render();
});

todayWeekBtn.addEventListener("click", () => {
  visibleWeekStart = startOfWeek(new Date());
  render();
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      habits: [],
      checks: {}
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      checks: parsed.checks || {}
    };
  } catch {
    return {
      habits: [],
      checks: {}
    };
  }
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function render() {
  const days = Array.from({ length: 7 }, (_, index) => addDays(visibleWeekStart, index));
  const todayKey = toDateKey(new Date());
  const weekEnd = addDays(visibleWeekStart, 6);

  weekLabel.textContent = `${formatShortDate(visibleWeekStart)} - ${formatShortDate(weekEnd)}`;
  emptyState.classList.toggle("hidden", state.habits.length > 0);
  trackerPanel.classList.toggle("hidden", state.habits.length === 0);

  if (state.habits.length === 0) {
    grid.innerHTML = "";
    return;
  }

  grid.innerHTML = "";
  grid.appendChild(buildHeaderRow(days, todayKey));

  state.habits.forEach((habit) => {
    grid.appendChild(buildHabitRow(habit, days, todayKey));
  });
}

function buildHeaderRow(days, todayKey) {
  const row = document.createElement("div");
  row.className = "grid-row";

  row.appendChild(cell("Habit", "header-cell"));
  row.appendChild(cell("Streak", "header-cell"));

  days.forEach((day) => {
    const dayKey = toDateKey(day);
    const header = cell("", `header-cell ${dayKey === todayKey ? "today-column" : ""}`);
    header.innerHTML = `${day.toLocaleDateString("en-US", { weekday: "short" })}<strong>${day.getDate()}</strong>`;
    row.appendChild(header);
  });

  return row;
}

function buildHabitRow(habit, days, todayKey) {
  const row = document.createElement("div");
  row.className = "grid-row";

  const nameCell = cell("", "habit-name-cell");
  const nameInput = document.createElement("input");
  nameInput.className = "habit-name";
  nameInput.value = habit.name;
  nameInput.setAttribute("aria-label", `Rename ${habit.name}`);
  nameInput.addEventListener("change", () => renameHabit(habit.id, nameInput.value));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", `Delete ${habit.name}`);
  deleteBtn.addEventListener("click", () => deleteHabit(habit.id));

  nameCell.append(nameInput, deleteBtn);
  row.appendChild(nameCell);

  const streakCell = cell("", "streak");
  streakCell.innerHTML = `<strong>${calculateStreak(habit.id)}</strong><span>days</span>`;
  row.appendChild(streakCell);

  days.forEach((day) => {
    const dateKey = toDateKey(day);
    const isToday = dateKey === todayKey;
    const checked = Boolean(state.checks[habit.id]?.[dateKey]);
    const isFuture = dateKey > todayKey;
    const dayCell = cell("", isToday ? "today-column" : "");

    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-toggle ${checked ? "checked" : ""}`;
    button.textContent = "✓";
    button.disabled = isFuture;
    button.setAttribute("aria-pressed", checked ? "true" : "false");
    button.setAttribute("aria-label", `${habit.name} on ${formatLongDate(day)} ${checked ? "completed" : "not completed"}`);
    button.addEventListener("click", () => toggleCheck(habit.id, dateKey));

    dayCell.appendChild(button);
    row.appendChild(dayCell);
  });

  return row;
}

function renameHabit(id, newName) {
  const habit = state.habits.find((item) => item.id === id);
  const cleanName = newName.trim();

  if (!habit) return;
  habit.name = cleanName || habit.name;
  saveAndRender();
}

function deleteHabit(id) {
  const habit = state.habits.find((item) => item.id === id);
  const message = habit ? `Delete "${habit.name}"?` : "Delete this habit?";

  if (!confirm(message)) return;

  state.habits = state.habits.filter((item) => item.id !== id);
  delete state.checks[id];
  saveAndRender();
}

function toggleCheck(habitId, dateKey) {
  if (!state.checks[habitId]) state.checks[habitId] = {};

  if (state.checks[habitId][dateKey]) {
    delete state.checks[habitId][dateKey];
  } else {
    state.checks[habitId][dateKey] = true;
  }

  saveAndRender();
}

function calculateStreak(habitId) {
  const today = new Date();
  let cursor = state.checks[habitId]?.[toDateKey(today)] ? today : addDays(today, -1);
  let streak = 0;

  while (state.checks[habitId]?.[toDateKey(cursor)]) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function cell(text, extraClass = "") {
  const div = document.createElement("div");
  div.className = `grid-cell ${extraClass}`.trim();
  div.textContent = text;
  return div;
}

function startOfWeek(date) {
  const copy = stripTime(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(copy, diff);
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return stripTime(copy);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  const cleanDate = stripTime(date);
  const year = cleanDate.getFullYear();
  const month = String(cleanDate.getMonth() + 1).padStart(2, "0");
  const day = String(cleanDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatLongDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

render();
