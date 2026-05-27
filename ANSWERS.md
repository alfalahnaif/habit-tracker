# Answers

## 1. How to run

The project does not need any npm install or build step.

From the project folder, run:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

On Windows, if `python3` does not work, use:

```bash
python -m http.server 5173
```

The app stores habits and checkmarks in `localStorage`, so the data stays after a page reload in the same browser.

## 2. Stack & design choices

I used plain HTML, CSS, and JavaScript because the task is small and does not need a framework. The main requirements are local state, a weekly grid, and simple interactions, so vanilla JS keeps the project easy to read and run on a fresh machine.

Two design choices I made:

1. I used a weekly grid instead of a vertical list. Habits are down the left and the seven days are across the top, so the user can quickly scan the whole week without opening separate habit details.

2. I made today's column a soft highlighted color instead of using a bright alert color. The current day should be easy to find, but it should not compete with the actual completed checkmarks. Completed cells use the stronger green state because that is the main success feedback.

The week starts on Monday because this feels more natural for planning a working or study week. The streak counter counts up to today if today is checked. If today is not checked yet, it counts up to yesterday. I chose this because a user should not lose their visible streak in the morning before they have had time to complete the habit.

## 3. Responsive & accessibility

On a 1440px laptop, the grid fits comfortably in the main card, with the habit name, streak, and seven day columns visible at once. On a 360px phone, the page stacks vertically: the add form and week buttons become full width, and the habit grid becomes horizontally scrollable so the columns remain readable instead of being squeezed too much.

One accessibility detail I handled is keyboard and screen reader support for the important controls. The day check buttons use `aria-pressed`, and the rename/delete/toggle buttons have labels that include the habit name and date. I also added visible focus states for keyboard navigation.

One thing I knowingly skipped is drag-and-drop reordering for habits. It would be useful, but it adds extra keyboard and touch accessibility work. For this assessment, I kept the editing simple with rename and delete.

## 4. AI usage

I used ChatGPT to help me move faster on the first pass of the project. I asked it for a simple habit tracker using plain HTML/CSS/JS, plus a README and this answers file. It helped draft the basic structure, localStorage approach, and the weekly grid logic.

I changed the output in a few specific ways. The first version leaned a bit too polished and app-like, so I simplified the copy and kept the design quieter. I also kept the mobile version as a horizontally scrollable grid instead of forcing the seven day columns into a tiny phone width, because the cells became too small to tap comfortably. I also adjusted the streak rule so an unchecked current day does not immediately break the visible streak until the user has the day to complete it.

## 5. Honest gap

The biggest unfinished part is habit organization. Right now habits appear in the order they were added, and the user cannot reorder or group them. With another day, I would add a simple reorder option and maybe a small weekly summary at the top, like “12/21 completed this week,” so progress is easier to understand when the list grows to 10 or 15 habits.
