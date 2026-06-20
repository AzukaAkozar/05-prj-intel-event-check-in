// ===== Intel Sustainability Summit Check-In App =====

// --- Constants ---
const ATTENDEE_GOAL = 50;

const TEAM_NAMES = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// --- Element references ---
const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");

const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");

// --- App state ---
// Try to load saved state from localStorage; otherwise start fresh.
let attendeeCount = 0;
let teamCounts = { water: 0, zero: 0, power: 0 };
let attendeeList = []; // [{ name, team }]

loadState();
renderAll();

// --- Event listener ---
checkInForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading on submit

  const name = attendeeNameInput.value.trim();
  const team = teamSelect.value;

  // Basic validation (the inputs are also marked required in HTML)
  if (!name || !team) {
    return;
  }

  // Update attendance + team counts
  attendeeCount++;
  teamCounts[team]++;

  // Track attendee for the Attendee List LevelUp
  attendeeList.push({ name: name, team: team });

  // Show personalized greeting
  showGreeting(name, team);

  // Update all displayed numbers + progress bar
  renderAll();

  // Save to localStorage so progress survives refresh
  saveState();

  // Check if we just hit the attendance goal
  checkForCelebration();

  // Reset the form for the next attendee
  checkInForm.reset();
  attendeeNameInput.focus();
});

// --- Functions ---

// Build and display the "Welcome, NAME from TEAM!" message
function showGreeting(name, team) {
  greeting.textContent = `🎉 Welcome, ${name} from ${TEAM_NAMES[team]}!`;
}

// Update every number on the page: total count, team counts, progress bar
function renderAll() {
  attendeeCountEl.textContent = attendeeCount;

  waterCountEl.textContent = teamCounts.water;
  zeroCountEl.textContent = teamCounts.zero;
  powerCountEl.textContent = teamCounts.power;

  updateProgressBar();
  renderAttendeeList();
}

// Update the width of the progress bar based on attendeeCount vs the goal
function updateProgressBar() {
  const percent = Math.min((attendeeCount / ATTENDEE_GOAL) * 100, 100);
  progressBar.style.width = `${percent}%`;
}

// Figure out which team currently has the most check-ins
function getWinningTeam() {
  let winningKey = "water";

  for (const key in teamCounts) {
    if (teamCounts[key] > teamCounts[winningKey]) {
      winningKey = key;
    }
  }

  return TEAM_NAMES[winningKey];
}

// LevelUp: Celebration Feature — fires once the goal is reached
function checkForCelebration() {
  if (attendeeCount === ATTENDEE_GOAL) {
    const winner = getWinningTeam();
    greeting.textContent = `🏆 Goal reached! ${winner} is leading the Sustainability Summit!`;
  }
}

// LevelUp: Attendee List — render the running list of attendees + teams
function renderAttendeeList() {
  let listContainer = document.getElementById("attendeeList");

  // Create the list container the first time it's needed
  if (!listContainer) {
    listContainer = document.createElement("div");
    listContainer.id = "attendeeList";
    listContainer.classList.add("attendee-list");

    const teamStats = document.querySelector(".team-stats");
    teamStats.insertAdjacentElement("afterend", listContainer);
  }

  listContainer.innerHTML = "";

  if (attendeeList.length === 0) {
    return;
  }

  const heading = document.createElement("h3");
  heading.textContent = "Attendee List";
  listContainer.appendChild(heading);

  const ul = document.createElement("ul");

  attendeeList.forEach(function (attendee) {
    const li = document.createElement("li");
    li.textContent = `${attendee.name} — ${TEAM_NAMES[attendee.team]}`;
    ul.appendChild(li);
  });

  listContainer.appendChild(ul);
}

// LevelUp: Save Your Progress — persist state to localStorage
function saveState() {
  const state = {
    attendeeCount: attendeeCount,
    teamCounts: teamCounts,
    attendeeList: attendeeList,
  };

  localStorage.setItem("intelSummitCheckIn", JSON.stringify(state));
}

// LevelUp: Save Your Progress — load saved state on page load
function loadState() {
  const saved = localStorage.getItem("intelSummitCheckIn");

  if (!saved) {
    return;
  }

  try {
    const state = JSON.parse(saved);
    attendeeCount = state.attendeeCount || 0;
    teamCounts = state.teamCounts || { water: 0, zero: 0, power: 0 };
    attendeeList = state.attendeeList || [];
  } catch (error) {
    console.error("Could not load saved check-in data:", error);
  }
}
