let timetable = {};
let studyLog = [];
let stopwatchInterval;
let stopwatchTime = 0;
let goals = [];
let notes = [];
let pomodoroInterval;
let pomodoroTime = 1500; 
let isWorkSession = true;
let calendar;

function addTimetableSlot() {
    const subject = document.getElementById('subject-input').value;
    const teacher = document.getElementById('teacher-input').value;
    const day = document.getElementById('day-select').value;
    const time = document.getElementById('time-input').value;

    if (!subject || !teacher || !day || !time) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!timetable[day]) {
        timetable[day] = [];
    }
    timetable[day].push({ subject, teacher, time });
    updateTimetableDisplay();
    saveTimetable();
    showNotification('Timetable slot added successfully', 'success');
}





function updateTimetableDisplay() {
    const timetableElement = document.getElementById('timetable-display');
    timetableElement.innerHTML = '';
    for (const day in timetable) {
        const dayElement = document.createElement('div');
        dayElement.innerHTML = `<h3 class="font-semibold mt-2">${day.charAt(0).toUpperCase() + day.slice(1)}</h3>`;
        timetable[day].forEach((slot, index) => {
            const slotElement = document.createElement('div');
            slotElement.className = 'bg-gray-700 p-2 rounded mb-1 flex justify-between items-center';
            slotElement.innerHTML = `
                <span>${slot.time} - ${slot.subject} (${slot.teacher})</span>
                <button onclick="removeTimetableSlot('${day}', ${index})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm">Remove</button>
            `;
            dayElement.appendChild(slotElement);
        });
        timetableElement.appendChild(dayElement);
    }
    updateCalendar();
}

function removeTimetableSlot(day, index) {
    timetable[day].splice(index, 1);
    if (timetable[day].length === 0) {
        delete timetable[day];
    }
    updateTimetableDisplay();
    saveTimetable();
    showNotification('Timetable slot removed', 'info');
}

function startStopwatch() {
    if (!stopwatchInterval) {
        stopwatchInterval = setInterval(updateStopwatch, 1000);
        showNotification('Stopwatch started', 'info');
    }
}

function pauseStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    showNotification('Stopwatch paused', 'info');
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchTime = 0;
    updateStopwatchDisplay();
    showNotification('Stopwatch reset', 'info');
}

function updateStopwatch() {
    stopwatchTime++;
    updateStopwatchDisplay();
}

function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchTime / 3600);
    const minutes = Math.floor((stopwatchTime % 3600) / 60);
    const seconds = stopwatchTime % 60;
    document.getElementById('stopwatch').textContent = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function logStudySession() {
    const subject = document.getElementById('study-subject').value;
    if (!subject) {
        showNotification('Please enter a subject', 'error');
        return;
    }
    const duration = stopwatchTime;
    studyLog.push({ subject, duration, date: new Date() });
    updateStudyLog();
    resetStopwatch();
    saveStudyLog();
    showNotification('Study session logged', 'success');
}

function updateStudyLog() {
    const logElement = document.getElementById('study-log');
    logElement.innerHTML = '';
    studyLog.forEach((session, index) => {
        const sessionElement = document.createElement('div');
        sessionElement.className = 'bg-gray-700 p-2 rounded mb-1 flex justify-between items-center';
        sessionElement.innerHTML = `
            <span>${session.subject} - ${formatDuration(session.duration)} - ${new Date(session.date).toLocaleDateString()}</span>
            <button onclick="removeStudySession(${index})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm">Remove</button>
        `;
        logElement.appendChild(sessionElement);
    });
    updatePerformanceChart();
    updateDashboard();
}

function removeStudySession(index) {
    studyLog.splice(index, 1);
    updateStudyLog();
    saveStudyLog();
    showNotification('Study session removed', 'info');
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function updatePerformanceChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    const subjectTotals = {};
    studyLog.forEach(session => {
        if (!subjectTotals[session.subject]) {
            subjectTotals[session.subject] = 0;
        }
        subjectTotals[session.subject] += session.duration;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(subjectTotals),
            datasets: [{
                label: 'Study Time (hours)',
                data: Object.values(subjectTotals).map(total => total / 3600),
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });
}

function addGoal() {
    const goalText = document.getElementById('goal-input').value;
    const goalDate = document.getElementById('goal-date').value;
    if (!goalText || !goalDate) {
        showNotification('Please enter both goal and date', 'error');
        return;
    }
    goals.push({ text: goalText, date: goalDate, completed: false });
    updateGoalsList();
    saveGoals();
    showNotification('Goal added successfully', 'success');
}

function updateGoalsList() {
    const goalsListElement = document.getElementById('goals-list');
    goalsListElement.innerHTML = '';
    goals.forEach((goal, index) => {
        const goalElement = document.createElement('div');
        goalElement.className = 'bg-gray-700 p-2 rounded mb-1 flex justify-between items-center';
        goalElement.innerHTML = `
            <span class="${goal.completed ? 'line-through' : ''}">${goal.text} (${goal.date})</span>
            <div>
                <button onclick="toggleGoalCompletion(${index})" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-2 rounded text-sm mr-2">
                    ${goal.completed ? 'Undo' : 'Complete'}
                </button>
                <button onclick="removeGoal(${index})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm">Remove</button>
            </div>
        `;
        goalsListElement.appendChild(goalElement);
    });
    updateDashboard();
}

function toggleGoalCompletion(index) {
    goals[index].completed = !goals[index].completed;
    updateGoalsList();
    saveGoals();
    showNotification(`Goal ${goals[index].completed ? 'completed' : 'uncompleted'}`, 'info');
}

function removeGoal(index) {
    goals.splice(index, 1);
    updateGoalsList();
    saveGoals();
    showNotification('Goal removed', 'info');
}

function startPomodoro() {
    if (!pomodoroInterval) {
        pomodoroInterval = setInterval(updatePomodoro, 1000);
        document.getElementById('pomodoro-status').textContent = isWorkSession ? 'Work Session' : 'Break Session';
        showNotification(`${isWorkSession ? 'Work' : 'Break'} session started`, 'info');
    }
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroTime = parseInt(document.getElementById('work-duration').value) * 60;
    isWorkSession = true;
    updatePomodoroDisplay();
    document.getElementById('pomodoro-status').textContent = '';
    showNotification('Pomodoro timer reset', 'info');
}

function updatePomodoro() {
    if (pomodoroTime > 0) {
        pomodoroTime--;
        updatePomodoroDisplay();
    } else {
        isWorkSession = !isWorkSession;
        pomodoroTime = isWorkSession ? 
            parseInt(document.getElementById('work-duration').value) * 60 : 
            parseInt(document.getElementById('break-duration').value) * 60;
        document.getElementById('pomodoro-status').textContent = isWorkSession ? 'Work Session' : 'Break Session';
        showNotification(`${isWorkSession ? 'Work' : 'Break'} session started`, 'info');
        if (Notification.permission === "granted") {
            new Notification('Pomodoro Timer', {
                body: isWorkSession ? 'Time to work!' : 'Take a break!',
                icon: 'path/to/icon.png'
            });
        }
    }
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroTime / 60);
    const seconds = pomodoroTime % 60;
    document.getElementById('pomodoro-timer').textContent = `${pad(minutes)}:${pad(seconds)}`;
}

function saveNote() {
    const noteText = document.getElementById('notes-input').value;
    if (noteText) {
        notes.push({ text: noteText, date: new Date() });
        updateNotesList();
        saveNotes();
        document.getElementById('notes-input').value = '';
        showNotification('Note saved successfully', 'success');
    } else {
        showNotification('Please enter a note', 'error');
    }
}

function updateNotesList() {
    const notesListElement = document.getElementById('notes-list');
    notesListElement.innerHTML = '';
    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'bg-gray-700 p-2 rounded mb-1';
        noteElement.innerHTML = `
            <p>${note.text}</p>
            <small>${new Date(note.date).toLocaleString()}</small>
            <button onclick="deleteNote(${index})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm mt-2">Delete</button>
        `;
        notesListElement.appendChild(noteElement);
    });
}

function deleteNote(index) {
    notes.splice(index, 1);
    updateNotesList();
    saveNotes();
    showNotification('Note deleted', 'info');
}

function updateCalendar() {
    if (calendar) {
        calendar.destroy();
    }
    const calendarEl = document.getElementById('full-calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: getCalendarEvents(),
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }
    });
    calendar.render();
}

function getCalendarEvents() {
    const events = [];
    for (const day in timetable) {
        timetable[day].forEach(slot => {
            events.push({
                title: `${slot.subject} (${slot.teacher})`,
                daysOfWeek: [['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day)],
                startTime: slot.time,
                endTime: moment(slot.time, 'HH:mm').add(1, 'hour').format('HH:mm')
            });
        });
    }
    goals.forEach(goal => {
        events.push({
            title: goal.text,
            start: goal.date,
            allDay: true,
            backgroundColor: goal.completed ? 'green' : 'orange'
        });
    });
    return events;
}

function updateDashboard() {
    const totalStudyTime = studyLog.reduce((total, session) => total + session.duration, 0);
    document.getElementById('total-study-time').textContent = formatDuration(totalStudyTime);
    
    const completedGoals = goals.filter(goal => goal.completed).length;
    document.getElementById('goals-completed').textContent = completedGoals;
    
    const upcomingDeadlines = goals.filter(goal => !goal.completed && new Date(goal.date) > new Date()).length;
    document.getElementById('upcoming-deadlines').textContent = upcomingDeadlines;
}



async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `<div class="mb-2"><strong>You:</strong> ${userInput}</div>`;
    document.getElementById('user-input').value = '';

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: `Student: ${userInput}\nAI Tutor:`,
            max_tokens: 150,
            n: 1,
            stop: null,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data.choices[0].text.trim();
        chatMessages.innerHTML += `<div class="mb-2"><strong>AI Tutor:</strong> ${aiResponse}</div>`;
    } catch (error) {
        console.error('Error:', error);
        chatMessages.innerHTML += `<div class="mb-2 text-red-500">Error: Unable to get response from AI Tutor</div>`;
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function saveTimetable() {
    localStorage.setItem('timetable', JSON.stringify(timetable));
}

function saveStudyLog() {
    localStorage.setItem('studyLog', JSON.stringify(studyLog));
}

function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadSavedData() {
    const savedTimetable = localStorage.getItem('timetable');
    if (savedTimetable) {
        timetable = JSON.parse(savedTimetable);
        updateTimetableDisplay();
    }

    const savedStudyLog = localStorage.getItem('studyLog');
    if (savedStudyLog) {
        studyLog = JSON.parse(savedStudyLog);
        updateStudyLog();
    }

    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
        goals = JSON.parse(savedGoals);
        updateGoalsList();
    }

    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        updateNotesList();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    initStudyEnvironment();
    updateCalendar();
    updateDashboard();
});

if ('Notification' in window) {
    Notification.requestPermission();
}


window.addEventListener('resize', () => {
    updateCalendar();
   
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        logStudySession();
    } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        startPomodoro();
    }
});


const timetableDisplay = document.getElementById('timetable-display');
new Sortable(timetableDisplay, {
    animation: 150,
    ghostClass: 'bg-gray-600',
    onEnd: (evt) => {
        const day = evt.item.parentNode.firstChild.textContent.toLowerCase();
        const { oldIndex, newIndex } = evt;
        const item = timetable[day].splice(oldIndex, 1)[0];
        timetable[day].splice(newIndex, 0, item);
        saveTimetable();
    }
});

if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();

        if (command.includes('start timer')) {
            startStopwatch();
        } else if (command.includes('stop timer')) {
            pauseStopwatch();
        } else if (command.includes('log study session')) {
            logStudySession();
        } else if (command.includes('start pomodoro')) {
            startPomodoro();
        }
    };

    recognition.start();
}


function visualizeStudyPatterns() {
    const ctx = document.createElement('canvas');
    document.getElementById('performance').appendChild(ctx);

    const studyByDayOfWeek = [0, 0, 0, 0, 0, 0, 0];
    studyLog.forEach(session => {
        const dayOfWeek = new Date(session.date).getDay();
        studyByDayOfWeek[dayOfWeek] += session.duration;
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Study Time Distribution',
                data: studyByDayOfWeek.map(time => time / 3600),
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });
}

visualizeStudyPatterns();


function suggestReviewTopics() {
    const today = new Date();
    const reviewSuggestions = studyLog
        .filter(session => {
            const daysSinceStudy = (today - new Date(session.date)) / (1000 * 60 * 60 * 24);
            return daysSinceStudy >= 1 && daysSinceStudy <= 7;
        })
        .map(session => session.subject);

    const uniqueSuggestions = [...new Set(reviewSuggestions)];
    const suggestionsElement = document.createElement('div');
    suggestionsElement.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">Suggested Review Topics:</h3>
        <ul class="list-disc pl-5">
            ${uniqueSuggestions.map(subject => `<li>${subject}</li>`).join('')}
        </ul>
    `;
    document.getElementById('dashboard').appendChild(suggestionsElement);
}

suggestReviewTopics();


let userXP = 0;
let userLevel = 1;

function updateXP(amount) {
    userXP += amount;
    if (userXP >= userLevel * 100) {
        userLevel++;
        showNotification(`Congratulations! You've reached level ${userLevel}!`, 'success');
    }
    updateUserProfile();
}

function updateUserProfile() {
    const profileElement = document.createElement('div');
    profileElement.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">Your Progress:</h3>
        <p>Level: ${userLevel}</p>
        <p>XP: ${userXP} / ${userLevel * 100}</p>
        <div class="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${(userXP / (userLevel * 100)) * 100}%"></div>
        </div>
    `;
    document.getElementById('dashboard').appendChild(profileElement);
}


const originalLogStudySession = logStudySession;
logStudySession = function() {
    originalLogStudySession();
    updateXP(10);
};

const originalToggleGoalCompletion = toggleGoalCompletion;
toggleGoalCompletion = function(index) {
    originalToggleGoalCompletion(index);
    if (goals[index].completed) {
        updateXP(20);
    }
};

updateUserProfile();