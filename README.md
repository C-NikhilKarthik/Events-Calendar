# React Calendar Application

This is a React-based calendar application that supports multiple resources and events. It features month navigation, event creation by dragging, moving, resizing of events, and per‑month persistence using localStorage. Additionally, you can add new resources dynamically (only for the current month) via the header.

## Features

- **Month Navigation:**  
  Use the header controls (previous, next, today) to navigate between months. The calendar reloads data (events and resources) specific to the selected month.

- **Event Management:**

  - **Create events** by clicking and dragging on an empty resource row.
  - **Move events** by dragging anywhere on the event.
  - **Resize events** using the resizer handle on the right edge of an event.
  - Each event is given a **random background color** and shows its start time (calculated as 20 minutes per pixel).

- **Resources:**

  - The calendar comes with a default of 15 resources per month.
  - You can **add new resources** using the "Add Resource" button in the header. The new resources are only added for the current month and persist between reloads.

- **LocalStorage Persistence:**  
  Both the events and the number of resources are saved in localStorage on a per‑month basis. Changing the month loads only that month’s data.

## Project Structure

- **`Calendar.js`**  
  The main component that holds the current date state and renders both the header and body of the calendar.

- **`CalendarHeader.js`**  
  Handles month navigation and contains the "Add Resource" button, dispatching a custom event to modify the number of resources in the current month.

- **`CalendarBody.js`**  
  Contains all the calendar grid logic, including event creation, moving, resizing, and localStorage persistence. When a custom event is received from the header, it increases the resource count for that month.

- **Utilities:**  
  Common date functions (e.g., `getMonthDays`, `getMonthName`) are provided in the `utils/dateUtils` module.

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm, yarn, or your preferred package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/C-NikhilKarthik/Events-Calendar
   ```

2. Change into the repository directory:

   ```bash
   cd events-calendar
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port specified by your configuration). You should see the calendar with the header and calendar body.

### Build for Production

To build an optimized production version:

```bash
npm run build
```

## Customization

- **Calendar Appearance:**  
  The calendar grid, event colors, and styles use Tailwind CSS classes. You can customize the styling by modifying these classes or updating the Tailwind configuration.

- **Date Utilities:**  
  Update or add new utility functions in the `utils/dateUtils` module if you need different date formats or calculations.

- **Persisted Data Format:**  
  The calendar stores its data in localStorage using a key structure like:
  ```json
  {
    "2025-02": {
      "events": [...],
      "resources": 15
    },
    "2025-03": { ... }
  }
  ```
  This structure ensures each month has its own set of events and resource count.
