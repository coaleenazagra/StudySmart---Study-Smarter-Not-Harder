// Mobile Menu Toggle
// Controls the hamburger menu behavior for mobile devices

// Ensures the code runs only after the full HTML document has been parsed and loaded.
document.addEventListener('DOMContentLoaded', function() { 
    // Selects (gets a reference to) the HTML elements needed for the mobile menu: the hamburger button, the navigation list, and the auth buttons(login/signup).
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    const authButtons = document.querySelector('.auth-buttons');
    
    // Checks if the mobile menu button actually exists on the page before trying to add an event listener.
    if (mobileMenuBtn) {
        // Attaches a click event listener to the mobile menu button.
        mobileMenuBtn.addEventListener('click', function() {
            // If the navigation menu exists, it toggles the CSS class 'show' on it. This class is what the CSS uses to show or hide the menu for mobile.
            if (navMenu) navMenu.classList.toggle('show');
            // Performs the same 'show' class toggle on the authentication buttons, typically displaying them along with the main navigation.
            if (authButtons) authButtons.classList.toggle('show');
        });
    }
    

    // Testimonial Slider
    // Creates an auto-rotating carousel for testimonial content with navigation dots
 
    //Selects all individual testimonial slides and the container element where the navigation dots will be placed.
    const testimonials = document.querySelectorAll('.testimonial');
    const dotsContainer = document.querySelector('.testimonial-dots');

    // Proceeds only if there is at least one testimonial to display.
    if (testimonials.length > 0) {
        // Initializes an array to hold dot references and checks if the dots container exists.
        let dots = [];
        if (dotsContainer) {
            // Clears any existing dots inside the container to prevent duplicates if the script runs multiple times.Clear any existing dots
            while (dotsContainer.firstChild) dotsContainer.removeChild(dotsContainer.firstChild);
            // Loops through each testimonial to dynamically create a navigation dot (<span>). It adds the class 'active' to the first dot.
            testimonials.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'dot' + (index === 0 ? ' active' : '');
                dotsContainer.appendChild(dot);
            });
            // Gets the newly created dot elements and stores them in the dots array for later use.
            dots = dotsContainer.querySelectorAll('.dot');
        }

        // Initializes the index variable to track the currently visible testimonial (starting at the first one).
        let currentIndex = 0;

        // Attaches a click handler to each dot. When clicked, it hides all testimonials, removes the 'active' class from all dots, shows the testimonial corresponding to the clicked dot's index, and sets that dot to 'active'. It also updates currentIndex.
        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    testimonials.forEach(t => { t.style.display = 'none'; });
                    dots.forEach(d => d.classList.remove('active'));
                    testimonials[index].style.display = 'block';
                    dot.classList.add('active');
                    currentIndex = index;
                });
            });
        }

        // Defines the function responsible for auto-advancing the slider.
        function rotateTestimonials() {
            // Hides the currently visible testimonial and deactivates the current dot.
            testimonials.forEach(t => { t.style.display = 'none'; });
            if (dots.length > 0) dots.forEach(d => d.classList.remove('active'));

            // Calculates the next index using the modulo operator (%). This ensures the index wraps back to 0 after the last testimonial.
            currentIndex = (currentIndex + 1) % testimonials.length;
            // Shows the new testimonial and activates the corresponding do
            testimonials[currentIndex].style.display = 'block';
            if (dots.length > 0) dots[currentIndex].classList.add('active');
        }

        // Sets the initial state by hiding all testimonials except the first one.
        testimonials.forEach((t, index) => {
            if (index !== 0) t.style.display = 'none';
        });

        // Starts the auto-rotation loop, calling rotateTestimonials every 5000 milliseconds (5 seconds).
        setInterval(rotateTestimonials, 5000);
    }
});


// Theme and Animation Setup
// Handles theme application and scroll-based animations.

document.addEventListener('DOMContentLoaded', function() {
    // Selects the <html> element (root), enforces the 'light' theme by setting its data-theme attribute, and attempts to clear any stored theme preference from the user's browser.
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    try { localStorage.removeItem('theme'); } catch (e) {}

    // Selects all HTML elements that should have the reveal-on-scroll animation.
    const revealTargets = document.querySelectorAll('.feature-card, .technique-card, .tool-card, .resource-card, .section-title');
    // Checks if the browser supports the IntersectionObserver API and if any targets were found.
    if ('IntersectionObserver' in window && revealTargets.length > 0) {
        // Creates a new IntersectionObserver instance. The callback function runs when the observed elements enter or exit the viewport, with a threshold of 0.15 (meaning it triggers when 15% of the element is visible).
        const observer = new IntersectionObserver((entries) => {
            // When an entry is intersecting (i.e., visible), the fade-in-up class is applied to trigger the animation, and then the element is unobserved so the action doesn't repeat.
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        // Instructs the observer to watch every target element.
        revealTargets.forEach(el => observer.observe(el));
    } else {
        // Fallback: If the browser doesn't support IntersectionObserver, it applies the fade-in-up class immediately so the content is visible, avoiding a bug.
        revealTargets.forEach(el => el.classList.add('fade-in-up'));
    }
});


// Pomodoro Timer Implementation
// Provides a 25-minute study timer with pause/resume functionality and visual progress tracking

class PomodoroTimer {
    // The special method called when a new PomodoroTimer object is created. It sets the initial state properties on the new object (this).
    constructor() {
        // Sets the initial time to 25 minutes and 0 seconds, and the running state to false
        this.minutes = 25;
        this.seconds = 0;
        this.isRunning = false;
        // Stores the ID returned by setInterval, which is necessary to later stop the timer using clearInterval.
        this.timerInterval = null;
        // Sets the current operational mode (25-minute focus session).
        this.mode = 'pomodoro';
        // Calculates the total duration in seconds for the current mode (1500 seconds), used for progress tracking.
        this.totalSeconds = 25 * 60;
        // Load the user's previously saved count of completed Pomodoro sessions from the browser's local storage,
        this.completedCount = parseInt(localStorage.getItem('pomodoroCompleted') || '0', 10);
        // Initializes a property to store the calculated circumference of the SVG progress ring.
        this.ringCircumference = 0;
    }
    
    // Calculates the SVG circle's circumference and sets the initial stroke-dasharray and stroke-dashoffset to this circumference. This makes the circle appear fully filled or empty before the timer starts.
    initRing() {
        // Selects the SVG element (likely a <circle>) that visualizes the progress.
        const ringProgress = document.querySelector('.ring-progress');
        // Exits the function if the progress ring element isn't found, preventing errors.
        if (!ringProgress) return;
        // Determine the radius (r) of the SVG circular progress bar, using a defined value from the HTML if available, or a reliable default value if not.
        const r = parseFloat(ringProgress.getAttribute('r')) || 54;
        // Calculates the circumference of the circle (2πr) and saves it to the object property.
        this.ringCircumference = 2 * Math.PI * r;
        // Sets the dash pattern to the circumference, ensuring the dash is as long as the entire circle.
        ringProgress.setAttribute('stroke-dasharray', String(this.ringCircumference));
        // Sets the dash offset to the circumference, making the circle appear empty initially (the full dash is pushed outside the visible path).
        ringProgress.setAttribute('stroke-dashoffset', String(this.ringCircumference));
    }

    // Calculates the percentage of the timer completed, converts that to an SVG stroke-dashoffset value, and updates the ring's progress visually.
    updateRing() {
        // Ensure that the necessary HTML element and internal timer properties exist and are valid before attempting to update the visual progress bar.
        const ringProgress = document.querySelector('.ring-progress');
        if (!ringProgress || !this.totalSeconds || !this.ringCircumference) return;
        // Calculates the total time remaining in seconds.
        const remaining = this.minutes * 60 + this.seconds;
        // Calculates the fraction of time completed.
        const progress = (this.totalSeconds - remaining) / this.totalSeconds;
        // Clamps the progress value between $0$ and $1$ to handle potential floating point errors or edge cases.
        const clamped = Math.max(0, Math.min(progress, 1));
        // Calculates the necessary stroke-dashoffset value. An offset of 0 is full, and an offset equal to the circumference is empty. 1 - clamped gives the fraction remaining, so as time decreases, the offset decreases, making the progress line draw forward.
        const offset = this.ringCircumference * (1 - clamped);
        // Applies the calculated offset to the SVG element to visually update the progress bar.
        ringProgress.setAttribute('stroke-dashoffset', String(offset));
    }

    // Starts the timer. It only proceeds if isRunning is false. It sets isRunning to true and creates a 1-second interval that repeatedly calls this.tick()
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => this.tick(), 1000);
            return true;
        }
        return false;
    }
    
    // Pauses the timer. It only proceeds if isRunning is true. It sets isRunning to false and stops the setInterval loop using clearInterval(this.timerInterval).
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timerInterval);
            return true;
        }
        return false;
    }
    
    // Resets the timer. It pauses the timer and then calls this.setTime(this.mode) to reload the original time for the current mode.
    reset() {
        this.pause();
        this.setTime(this.mode);
        return true;
    }
    
    // The core countdown logic: subtracts one second. If seconds hit zero, it decrements minutes and resets seconds to 59. If both hit zero, it calls timerComplete(). Finally, it updates the display.
    tick() {
        // Checks if the seconds have reached zero.
        if (this.seconds === 0) {
            // If seconds are zero, checks if minutes are also zero, meaning the timer has completed. If so, it calls this.timerComplete() and exits.
            if (this.minutes === 0) {
                this.timerComplete();
                return;
            }
            // If seconds are zero but minutes are not, it decrements the minutes and resets seconds to 59.
            this.minutes--;
            this.seconds = 59;
        // If seconds are not zero, it simply decrements the seconds.
        } else {
            this.seconds--;
        }
        
        // Calls the method to update the on-screen time and the SVG ring.
        this.updateDisplay();
    }
    
    // Handles end-of-timer logic: calls pause(), plays an alarm (see playAlarm()), switches the mode (e.g., pomodoro → short break), increments and saves the completedCount if a Pomodoro finished, and calls setTime() for the new mode.
    timerComplete() {
        // Stops the timer and plays the notification/alarm sound.
        this.pause();
        this.playAlarm();
        
        // Stores the current mode and then switches the mode: Pomodoro goes to Short Break, Short Break goes back to Pomodoro.
        const prevMode = this.mode;
        // Switch modes
        if (this.mode === 'pomodoro') {
            this.mode = 'shortBreak';
        } else if (this.mode === 'shortBreak') {
            this.mode = 'pomodoro';
        }
        
        // If the completed cycle was a Pomodoro (focus session), it increments the counter, saves it to localStorage, and updates the UI element displaying the count.
        if (prevMode === 'pomodoro') {
            this.completedCount += 1;
            localStorage.setItem('pomodoroCompleted', String(this.completedCount));
            const countEl = document.getElementById('pomodoro-count');
            if (countEl) countEl.textContent = String(this.completedCount);
        }
        
        // Calls setTime() to load the time for the new mode (e.g., 5 minutes for a Short Break).
        this.setTime(this.mode);
    }
    
    // Sets the minutes and totalSeconds based on the specified mode (25 for pomodoro, 5 for short break, 15 for long break). It then updates the UI for the timer display and mode badge.
    setTime(mode) {
        this.mode = mode;
        // Uses a switch statement to set this.minutes based on the requested mode (pomodoro: 25, shortBreak: 5, longBreak: 15, default: 25).
        switch (mode) {
            case 'pomodoro':
                this.minutes = 25;
                break;
            case 'shortBreak':
                this.minutes = 5;
                break;
            case 'longBreak':
                this.minutes = 15;
                break;
            default:
                this.minutes = 25;
        }
        
        // Resets seconds to 0, recalculates totalSeconds, and calls methods to update the mode badge and time display.
        this.seconds = 0;
        this.totalSeconds = this.minutes * 60;
        this.updateModeUI();
        this.updateDisplay();
    }
    
    // Updates the main time display element (#timer-display) by zero-padding the minutes and seconds (e.g., 05:00 instead of 5:0). It also calls updateRing().
    updateDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        // Selects the timer display element and updates its text content. It uses .padStart(2, '0') to ensure both minutes and seconds are always two digits (e.g., 5 becomes 05).
        if (timerDisplay) {
            timerDisplay.textContent = `${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
        }
        // Calls the method to update the visual progress bar based on the new time.
        this.updateRing();
    }
    
    // Updates the text of the mode badge and toggles the active class and aria-selected attribute on the mode buttons (Pomodoro, Short Break, Long Break) to reflect the current mode.
    updateModeUI() {
        const badge = document.getElementById('mode-badge');
        // Updates the text of the status badge (#mode-badge) to show the current mode name.
        if (badge) {
            badge.textContent = this.mode === 'pomodoro' ? 'Pomodoro' : this.mode === 'shortBreak' ? 'Short Break' : 'Long Break';
        }
        // Defines the buttons for each mode, iterates through them, and uses classList.toggle('active', active) to visually highlight the currently selected mode button. It also updates ARIA attributes for accessibility.
        const map = [
            { id: 'pomodoro-mode', active: this.mode === 'pomodoro' },
            { id: 'short-break-mode', active: this.mode === 'shortBreak' },
            { id: 'long-break-mode', active: this.mode === 'longBreak' }
        ];
        map.forEach(({ id, active }) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }
    
    // Plays an alarm sound (not specified, but implied) and attempts to display a browser desktop notification if permission has been granted.
    playAlarm() {
        // Checks if the browser supports Web Notifications and if the user has already granted permission.
        if ('Notification' in window && Notification.permission === 'granted') {
            // Creates and displays a standard browser notification with a relevant message (break or focus) based on the next mode.
            new Notification('Timer Complete', {
                body: this.mode === 'pomodoro' ? 'Time for a break!' : 'Time to focus!',
                icon: 'images/timer-icon.svg'
            });
        }
    }
}

// Ensures all the HTML elements are loaded before the JavaScript attempts to find and use them.
document.addEventListener('DOMContentLoaded', function() {
    // Selects the timer's main container. The rest of the block only runs if this container exists, meaning the timer feature is present on the page.
    const timerContainer = document.getElementById('pomodoro-timer-container');
    
    if (timerContainer) {
        // Creates the one and only instance of the timer object.
        const timer = new PomodoroTimer();
        
        // Calls methods to set up the initial look of the timer's SVG ring and the time display.
        timer.initRing();
        timer.updateDisplay();
        
        // Updates the Pomodoro count display element with the value loaded from localStorage.
        const countEl = document.getElementById('pomodoro-count');
        if (countEl) countEl.textContent = String(timer.completedCount);
        
        // Selects the three main control buttons: Start, Pause, and Reset.
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const resetBtn = document.getElementById('reset-timer');

        // Initial state: Disables the Pause button so the user can't pause a timer that hasn't started yet.
        pauseBtn.disabled = true;

        // Attaches a click handler to the Start button. If timer.start() succeeds, it disables the Start button and enables the Pause button.
        startBtn.addEventListener('click', () => {
            if (timer.start()) {
                pauseBtn.disabled = false;
                startBtn.disabled = true;
            }
        });

        // Attaches a click handler to the Pause button. If timer.pause() succeeds, it enables the Start button and disables the Pause button.
        pauseBtn.addEventListener('click', () => {
            if (timer.pause()) {
                pauseBtn.disabled = true;
                startBtn.disabled = false;
            }
        });

        // Attaches a click handler to the Reset button. If timer.reset() succeeds, it disables Pause and enables Start, restoring the initial button state.
        resetBtn.addEventListener('click', () => {
            if (timer.reset()) {
                pauseBtn.disabled = true;
                startBtn.disabled = false;
            }
        });
        
        // Attaches listeners to the mode-selection buttons. Clicking any of these calls timer.setTime() to instantly switch to that mode.
        document.getElementById('pomodoro-mode').addEventListener('click', () => timer.setTime('pomodoro'));
        document.getElementById('short-break-mode').addEventListener('click', () => timer.setTime('shortBreak'));
        document.getElementById('long-break-mode').addEventListener('click', () => timer.setTime('longBreak'));
    }
});


// Study Planner
// Manages CRUD for study tasks stored in localStorage
 
class StudyPlanner {
    // Initializes the planner by loading tasks from localStorage (key: 'studyTasks'). If no data is found, it starts with an empty array.
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];
    }
    
    // Create Operation: Defines the function to add a new task. It takes all necessary task details as arguments.
    addTask(title, subject, dueDate, priority, estimatedTime) {
        // Creates a new task object.
        const newTask = {
            // Assigns a unique ID to the task using the current timestamp (milliseconds since 1970).
            id: Date.now(),
            // Uses shorthand property names to assign the function arguments (like title) as properties on the new task object.
            title,
            subject,
            dueDate,
            priority,
            estimatedTime,
            // Initializes the task status as not completed.
            completed: false,
            // Records the exact time the task was created in a standard, sortable string format.
            createdAt: new Date().toISOString()
        };
        
        // Adds the new task object to the internal array of tasks.
        this.tasks.push(newTask);
        // Calls the method to immediately save the updated array back to localStorage.
        this.saveTasks();
        return newTask;
    }
    
    // Delete Operation: Removes a task by its ID. It uses the filter method to create a new array containing only tasks whose id does not match the provided id. It then saves the shorter list.
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }
    
    // Update Operation: Modifies an existing task. It uses the map method to iterate through tasks.
    updateTask(id, updates) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                // If the task ID matches, it creates a new task object by spreading the old task's properties (...task) and then overwriting them with the new properties from the updates object (...updates).
                return { ...task, ...updates };
            }
            return task;
        });
        
        this.saveTasks();
    }
    
    // Toggle Completion: Finds the task by ID and creates a new object with only the completed property flipped to the opposite value (!task.completed), effectively marking it complete or incomplete.
    toggleTaskCompletion(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        this.saveTasks();
    }
    
    // Sort by Date: Returns a copy of the tasks ([...this.tasks]) sorted by the dueDate. The sort function uses new Date(a.dueDate) - new Date(b.dueDate) to sort dates in ascending order (oldest first).
    getTasksByDueDate() {
        return [...this.tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    
    // Sort by Priority: Defines an object (priorityOrder) to map text priorities (high, medium, low) to numerical values (1, 2, 3). It then sorts the tasks based on these numerical values.
    getTasksByPriority() {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return [...this.tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    
    // Persist Data: Converts the JavaScript array of tasks into a JSON string (JSON.stringify) and stores it permanently in the browser's localStorage.
    saveTasks() {
        localStorage.setItem('studyTasks', JSON.stringify(this.tasks));
    }
}

// Ensures the code runs only after the entire HTML page structure is loaded. It creates a new StudyPlanner instance if the container exists.
document.addEventListener('DOMContentLoaded', function() {
    const plannerContainer = document.getElementById('study-planner-container');
    
    if (plannerContainer) {
        const studyPlanner = new StudyPlanner();
        
        // Rendering Function: Defines the core function for rendering the task list on the screen.
        function displayTasks() {
            const tasksList = document.getElementById('tasks-list');
            // Retrieves the list of tasks, defaulting to sorting them by due date.
            const tasks = studyPlanner.getTasksByDueDate();
            
            // Empty State: If the tasks list is empty, it injects an "empty state" message into the task list area instead of individual tasks.
            if (tasks.length === 0) {
                tasksList.innerHTML = `
                    <div class="empty-state">
                        <p>No tasks yet. Add your first study task!</p>
                    </div>
                `;
                return;
            }
            
            tasksList.innerHTML = '';
            
            // Loops through each task and dynamically creates the HTML structure (taskElement.innerHTML) for a single task item, including its title, details, checkbox, and action buttons.
            tasks.forEach(task => {
                const dueDate = new Date(task.dueDate).toLocaleDateString();
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskElement.dataset.id = task.id;
                
                taskElement.innerHTML = `
                    <div class="task-header">
                        <div class="task-checkbox">
                            <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        </div>
                        <div class="task-title">${task.title}</div>
                        <div class="task-actions">
                            <button class="edit-task"><i class="fas fa-edit"></i></button>
                            <button class="delete-task"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="task-details">
                        <div class="task-subject">Subject: ${task.subject}</div>
                        <div class="task-due-date">Due: ${dueDate}</div>
                        <div class="task-priority priority-${task.priority}">Priority: ${task.priority}</div>
                        <div class="task-time">Est. Time: ${task.estimatedTime} min</div>
                    </div>
                `;
                
                tasksList.appendChild(taskElement);
                
                // Add event listeners
                const checkbox = taskElement.querySelector('input[type="checkbox"]');
                // Attaches a listener to the checkbox. When checked/unchecked, it calls toggleTaskCompletion() and updates the task's visual appearance on the screen (classList.toggle('completed')).
                checkbox.addEventListener('change', function() {
                    studyPlanner.toggleTaskCompletion(task.id);
                    taskElement.classList.toggle('completed');
                });
                
                const deleteBtn = taskElement.querySelector('.delete-task');
                // Attaches a listener to the Delete button. It asks for confirmation, then calls deleteTask(), and re-renders the entire list (displayTasks()).
                deleteBtn.addEventListener('click', function() {
                    if (confirm('Are you sure you want to delete this task?')) {
                        studyPlanner.deleteTask(task.id);
                        displayTasks();
                    }
                });
                
                const editBtn = taskElement.querySelector('.edit-task');
                // Attaches a listener to the Edit button. It takes the current task's data, uses it to fill the fields in the modal form, and makes the edit modal visible.
                editBtn.addEventListener('click', function() {
                    // Populate edit form
                    document.getElementById('edit-task-id').value = task.id;
                    document.getElementById('edit-task-title').value = task.title;
                    document.getElementById('edit-task-subject').value = task.subject;
                    document.getElementById('edit-task-due-date').value = task.dueDate.split('T')[0];
                    document.getElementById('edit-task-priority').value = task.priority;
                    document.getElementById('edit-task-time').value = task.estimatedTime;
                    
                    // Show edit modal
                    document.getElementById('edit-task-modal').classList.add('show');
                });
            });
        }
        
        // Initial Render: Calls the function once to show the tasks when the page loads.
        displayTasks();
        
        // Add new task form
        const newTaskForm = document.getElementById('new-task-form');
        // Add Task Form Handler: Attaches a listener to the form submission. It prevents the default browser submission (e.preventDefault()), collects input values, and if they're valid, calls studyPlanner.addTask(), clears the form, and re-renders the list.
        newTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value.trim();
            const subject = document.getElementById('task-subject').value.trim();
            const dueDate = document.getElementById('task-due-date').value;
            const priority = document.getElementById('task-priority').value;
            const estimatedTime = document.getElementById('task-time').value;
            
            if (title && subject && dueDate) {
                studyPlanner.addTask(title, subject, dueDate, priority, estimatedTime);
                newTaskForm.reset();
                displayTasks();
            }
        });
        
        // Edit task form
        const editTaskForm = document.getElementById('edit-task-form');
        // Edit Task Form Handler: Prevents default submission, retrieves the task ID (and parses it to an integer), collects all updated values into an updates object, calls studyPlanner.updateTask(), hides the modal, and re-renders the list.
        editTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const idRaw = document.getElementById('edit-task-id').value;
            const id = parseInt(idRaw, 10);
            if (Number.isNaN(id)) {
                console.warn('Edit task failed: invalid task id', idRaw);
                return;
            }
            const updates = {
                title: document.getElementById('edit-task-title').value.trim(),
                subject: document.getElementById('edit-task-subject').value.trim(),
                dueDate: document.getElementById('edit-task-due-date').value,
                priority: document.getElementById('edit-task-priority').value,
                estimatedTime: document.getElementById('edit-task-time').value
            };
            
            studyPlanner.updateTask(id, updates);
            document.getElementById('edit-task-modal').classList.remove('show');
            displayTasks();
        });
        
        // Attaches a listener to a close button (like an 'X' or 'Cancel') to hide the edit modal.
        document.querySelector('.close-modal').addEventListener('click', function() {
            document.getElementById('edit-task-modal').classList.remove('show');
        });
        
        // Filter Buttons: Attaches listeners to the 'filter by date' and 'filter by priority' buttons. When clicked, they call the appropriate sorting method (getTasksByDueDate() or getTasksByPriority()) and pass the resulting sorted array to the (simplified) displayFilteredTasks() function.
        document.getElementById('filter-by-date').addEventListener('click', function() {
            const tasks = studyPlanner.getTasksByDueDate();
            displayFilteredTasks(tasks);
        });
        
        document.getElementById('filter-by-priority').addEventListener('click', function() {
            const tasks = studyPlanner.getTasksByPriority();
            displayFilteredTasks(tasks);
        });
        
        // A placeholder or simplified function to display a specific, already-sorted list of tasks (usually by clearing the list and re-rendering the task elements).
        function displayFilteredTasks(tasks) {
            const tasksList = document.getElementById('tasks-list');
            tasksList.innerHTML = '';
            
            tasks.forEach(task => {
                // Same task rendering logic as in displayTasks
                // This is simplified for brevity
                const taskElement = document.createElement('div');
                taskElement.textContent = task.title;
                tasksList.appendChild(taskElement);
            });
        }
    }
});

// Focus Music Player
// Handles background focus music playback with volume control and UI updates.
class MusicPlayer {
    // The function that runs when a new MusicPlayer object is created.
    constructor() {
        // Creates the HTML5 <audio> element. This is the core object used to load, play, pause, and control the actual sound file.
        this.audio = new Audio();
        // Sets the initial state: not currently playing, no track loaded, and a default volume level of 70%.
        this.isPlaying = false;
        this.currentTrack = null;
        this.volume = 0.7;
        // Defines the hardcoded list of music tracks. Each track is an object with a unique id, a display title, the file src (path), and a type for categorization.
        this.tracks = [
            { id: 1, title: 'Deep Focus', src: 'sounds/Deep Focus.mp3', type: 'focus' },
            { id: 2, title: 'Ambient Study', src: 'sounds/Ambient Study.mp3', type: 'ambient' },
            { id: 3, title: 'Nature Sounds', src: 'sounds/Nature Sounds.mp3', type: 'nature' },
            { id: 4, title: 'White Noise', src: 'sounds/White Noise.mp3', type: 'noise' }
        ];
        
        // Error Handling: Attaches a listener to the audio object. If the audio fails to load or play (e.g., bad file path), it logs an error to the console and updates the UI to show an error message.
        this.audio.addEventListener('error', () => {
            console.error('Audio error occurred');
            const titleEl = document.getElementById('current-track-title');
            if (titleEl) titleEl.textContent = `Error playing: ${this.currentTrack?.title || 'track'}`;
        });
        
        // Ready Feedback: Attaches a listener that fires when the audio file has loaded enough data to begin playing. It confirms the currentTrack title in the UI.
        this.audio.addEventListener('canplay', () => {
            if (this.currentTrack) {
                const titleEl = document.getElementById('current-track-title');
                if (titleEl) titleEl.textContent = this.currentTrack.title;
            }
        });
    }
    
    // Finds the track by ID. If a new track is selected, it stops the current track, sets the new track's src, sets the volume and loop: true, and attempts to start playback using this.audio.play(). Updates the UI upon successful playback.
    play(trackId) {
        // Finds the track object in the this.tracks array that matches the ID passed to the function.
        const track = this.tracks.find(t => t.id === trackId);
        
        // If no track matches the ID, the function exits.
        if (!track) return false;
        
        // Optimization: Checks if the requested track is already loaded and currently playing. If so, it does nothing and returns true.
        if (this.currentTrack && this.currentTrack.id === trackId && this.isPlaying) {
            // Already playing this track
            return true;
        }
        
        // If a different track is currently playing, it calls this.stop() to gracefully halt playback before starting the new one.
        if (this.isPlaying) {
            this.stop();
        }
        
        // Sets the current track property to the newly selected track object.
        this.currentTrack = track;
        // Sets the source file for the HTML5 audio element.
        this.audio.src = track.src;
        // Sets the audio element's volume to the saved user preference (defaults to 0.7).
        this.audio.volume = this.volume;
        // Ensures the track will automatically repeat when it finishes, providing continuous focus music.
        this.audio.loop = true;
        
        // UI: indicate loading state briefly
        const trackTitle = document.getElementById('current-track-title');
        // Updates the UI to show a temporary "Loading..." status.
        if (trackTitle) trackTitle.textContent = `Loading: ${track.title}...`;
        
        // Starts playback. play() returns a Promise, which is used to handle success or failure (e.g., if the browser blocks autoplay). Upon successful play, it sets this.isPlaying = true and updates the UI.
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayerUI();
        }).catch(error => {
            console.error('Error playing audio:', error);
            // If autoplay policy blocks, user clicking again will succeed; otherwise error handler will attempt fallback
        });
        
        return true;
    }
    
    // Stops the audio playback using the native pause() method, updates the internal isPlaying state to false, and updates the UI (e.g., changes the icon to 'Play').
    pause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayerUI();
            return true;
        }
        return false;
    }
    
    // Continues playback. It only runs if the player is not already playing and a currentTrack is loaded. It calls this.audio.play() and updates the state/UI on success.
    resume() {
        if (!this.isPlaying && this.currentTrack) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayerUI();
            }).catch(error => {
                console.error('Error resuming audio:', error);
            });
            return true;
        }
        return false;
    }
    
    // Stops and resets the track. It pauses the audio and sets this.audio.currentTime = 0, forcing the track to start from the beginning if played again.
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayerUI();
    }
    
    // Volume Control: Updates both the internal this.volume property and the volume level on the actual HTML5 audio element.
    setVolume(level) {
        this.volume = level;
        this.audio.volume = level;
    }
    
    // Updates the visual elements: setting the text of the current track title, changing the play/pause button icon (<i class="fas fa-play"></i> vs. <i class="fas fa-pause"></i>), and toggling the active class on the playlist buttons. Includes accessibility updates with ARIA attributes.
    updatePlayerUI() {
        // Element Check: Grabs references to the main UI elements. It immediately exits (return) if the player's container is missing.
        const playerContainer = document.getElementById('music-player-container');
        // Track Title & Play/Pause Button: Gets references to the UI elements. If a track is loaded, it updates the title. It dynamically changes the Play/Pause button's icon (<i class="fas">...</i>) and the aria-label (for accessibility) based on the this.isPlaying state.
        if (!playerContainer) return;
        
        const trackTitle = document.getElementById('current-track-title');
        const playPauseBtn = document.getElementById('play-pause-btn');
        
        // Track Playing State: If a track is loaded, it sets the title text. It uses a ternary operator to check this.isPlaying and set the button's icon to the Pause icon (<i class="fas fa-pause"></i>) if playing, or the Play icon otherwise.
        if (this.currentTrack) {
            trackTitle.textContent = this.currentTrack.title;
            playPauseBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
            // Accessibility (A11Y): Sets the button's accessible name (what screen readers announce) to "Pause" or "Play [Track Title]" based on the current state.
            playPauseBtn.setAttribute('aria-label', this.isPlaying ? 'Pause' : `Play ${this.currentTrack.title}`);
        // No Track State: If no track is loaded, it displays "No track selected" and ensures the button defaults to the Play icon and "Play" label.
        } else {
            trackTitle.textContent = 'No track selected';
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            playPauseBtn.setAttribute('aria-label', 'Play');
        }
        
        // Marks the title element as an ARIA live region, meaning screen readers will announce changes to its content (like when a new track starts loading).
        trackTitle.setAttribute('aria-live', 'polite');
        
        // Track Button Highlighting: Selects all track buttons (.track-button). It iterates over them and checks if the button's ID matches the this.currentTrack.id. It then uses classList.toggle('active', isActive) to visually highlight the active track and updates ARIA attributes (aria-selected, aria-pressed).
        const trackButtons = document.querySelectorAll('.track-button');
        trackButtons.forEach(btn => {
            const id = parseInt(btn.dataset.trackId);
            // Checks if the current button's ID matches the ID of the track currently loaded in the player.
            const isActive = !!this.currentTrack && this.currentTrack.id === id;
            // Visual Highlight: Adds or removes the CSS class active to the button based on the isActive state.
            btn.classList.toggle('active', isActive);
            // Sets ARIA attributes to indicate whether the button is currently selected or pressed, providing screen readers with the button's operational status.
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }
}

// Ensures all this code runs only after the entire HTML document is fully loaded, preventing errors that occur when JavaScript tries to access elements that don't exist yet.
document.addEventListener('DOMContentLoaded', function() {
    // Ensures all this code runs only after the entire HTML document is fully loaded, preventing errors that occur when JavaScript tries to access elements that don't exist yet.
    const musicPlayerContainer = document.getElementById('music-player-container');
    
    // Safety Check: The rest of the logic only runs if the music player container actually exists on the page.
    if (musicPlayerContainer) {
        // Instantiation: Creates a single, active instance of the MusicPlayer object. This object holds the player's logic and state.
        const musicPlayer = new MusicPlayer();
        
        // Calls the method to set the initial visual state of the player (e.g., showing the default title, setting the Play icon).
        musicPlayer.updatePlayerUI();
        
        // Selects all buttons in the playlist used to select a track.
        const trackButtons = document.querySelectorAll('.track-button');
        // Loops through each track button to set it up.
        trackButtons.forEach(button => {
            // Accessibility (A11Y): Sets ARIA attributes (role, aria-label, aria-selected) to make the buttons correctly announce their purpose and state to screen readers.
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', `Play ${button.textContent}`);
            button.setAttribute('aria-selected', 'false');
            // Click Listener (Track Selection): Attaches a click handler. It reads the track ID from the button's data attribute (this.dataset.trackId), converts it to an integer, and tells the player to play(trackId).
            button.addEventListener('click', function() {
                const trackId = parseInt(this.dataset.trackId);
                musicPlayer.play(trackId);
                // Keeps keyboard focus on the clicked button, improving accessibility and navigation.
                this.focus();
            });
        });
        
        // Finds the main control button.
        const playPauseBtn = document.getElementById('play-pause-btn');
        // A11Y: Indicates that this button controls the element displaying the track title.
        playPauseBtn.setAttribute('aria-controls', 'current-track-title');
        // Click Listener (Play/Pause/Resume): Attaches a handler to manage the main playback cycle.
        playPauseBtn.addEventListener('click', function() {
            // Pause Logic: If the player is currently playing, it calls the pause() method.
            if (musicPlayer.isPlaying) {
                musicPlayer.pause();
            } else {
                // Resume Logic: If the player is paused and has a track loaded, it calls the resume() method.
                if (musicPlayer.currentTrack) {
                    musicPlayer.resume();
                // Start Logic (Initial Play): If nothing is loaded, it defaults to playing the very first track in the list.
                } else if (musicPlayer.tracks.length > 0) {
                    musicPlayer.play(musicPlayer.tracks[0].id);
                }
            }
        });
        
        // Finds the HTML range input (slider) for volume control.
        const volumeSlider = document.getElementById('volume-slider');
        // Input Listener (Volume): Attaches a listener that fires whenever the slider value changes. It reads the new position (this.value), converts it to a decimal number (parseFloat), and calls musicPlayer.setVolume() to instantly adjust the volume.
        volumeSlider.addEventListener('input', function() {
            const volume = parseFloat(this.value);
            musicPlayer.setVolume(volume);
        });
    }
});