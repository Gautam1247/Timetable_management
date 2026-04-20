const API_BASE = "http://localhost:5000/api";

const loggedInUser = JSON.parse(localStorage.getItem("user"));

if (!loggedInUser || loggedInUser.role !== "faculty") {
  window.location.href = "../login_portal/login.html";
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayName = dayNames[new Date().getDay()];
const timetableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

let allTimeSlots = [];
let facultyTimetableEntries = [];

const profileNameSide = document.getElementById("profileNameSide");
const profileEmailSide = document.getElementById("profileEmailSide");
const profileDepartmentSide = document.getElementById("profileDepartmentSide");
const profileFacultyIdSide = document.getElementById("profileFacultyIdSide");
const avatarInitial = document.getElementById("avatarInitial");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

const totalClasses = document.getElementById("totalClasses");
const todayCount = document.getElementById("todayCount");
const facultyNameCard = document.getElementById("facultyNameCard");
const facultyDepartmentCard = document.getElementById("facultyDepartmentCard");

const weeklyTimetableGridBody = document.getElementById("weeklyTimetableGridBody");
const todayClassesContainer = document.getElementById("todayClassesContainer");
const refreshBtn = document.getElementById("refreshBtn");
const downloadImgBtn = document.getElementById("downloadImgBtn");
const logoutBtn = document.getElementById("logoutBtn");

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

async function loadFacultyProfile() {
  const profile = await fetchJSON(`${API_BASE}/faculty/profile/${loggedInUser.id}`);

  if (profileNameSide) {
    profileNameSide.textContent = profile.faculty_name;
  }

  if (profileEmailSide) {
    profileEmailSide.textContent = profile.email || "faculty@email.com";
  }

  if (profileDepartmentSide) {
    profileDepartmentSide.textContent = profile.department || "Faculty";
  }

  if (profileFacultyIdSide) {
    profileFacultyIdSide.textContent = `Faculty ID: ${profile.faculty_id}`;
  }

  if (facultyNameCard) {
    facultyNameCard.textContent = profile.faculty_name;
  }

  if (facultyDepartmentCard) {
    facultyDepartmentCard.textContent = profile.department || "Faculty";
  }

  if (avatarInitial) {
    avatarInitial.textContent = profile.faculty_name
      ? profile.faculty_name.charAt(0).toUpperCase()
      : "F";
  }
}

function renderTodayClasses(data) {
  const todaysClasses = data.filter((item) => item.day === todayName);

  if (todayCount) {
    todayCount.textContent = todaysClasses.length;
  }

  if (!todayClassesContainer) return;

  if (todaysClasses.length === 0) {
    todayClassesContainer.innerHTML = `<p class="empty-text">No classes scheduled for today.</p>`;
    return;
  }

  todayClassesContainer.innerHTML = "";

  todaysClasses.forEach((item) => {
    const div = document.createElement("div");
    div.className = "today-class";
    div.innerHTML = `
      <h4>${item.subject_name}</h4>
      <p><strong>Time:</strong> ${item.start_time} - ${item.end_time}</p>
      <p><strong>Section:</strong> ${item.branch} ${item.section_name}</p>
      <p><strong>Room:</strong> ${item.room_name}</p>
    `;
    todayClassesContainer.appendChild(div);
  });
}

function buildTimetableMap(entries) {
  const map = {};

  entries.forEach((item) => {
    const key = String(item.slot_id || item.slot_label);

    if (!map[key]) {
      map[key] = {};
    }

    map[key][item.day] = item;
  });

  return map;
}

function renderTimetableGrid(data) {
  if (totalClasses) {
    totalClasses.textContent = data.length;
  }

  if (!weeklyTimetableGridBody) return;

  weeklyTimetableGridBody.innerHTML = "";

  if (allTimeSlots.length === 0) {
    weeklyTimetableGridBody.innerHTML = `
      <tr>
        <td colspan="6">No time slots available.</td>
      </tr>
    `;
    renderTodayClasses(data);
    return;
  }

  const timetableMap = buildTimetableMap(data);

  allTimeSlots.forEach((slot) => {
    const row = document.createElement("tr");
    let html = `<td>${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}</td>`;

    timetableDays.forEach((day) => {
      const entry =
        timetableMap[String(slot.slot_id)]?.[day] ||
        timetableMap[String(slot.slot_label)]?.[day];

      if (entry) {
        html += `
          <td class="timetable-cell">
            <div class="class-box">
              <div class="class-subject">${entry.subject_name}</div>
              <div class="class-code">${entry.branch} ${entry.section_name}</div>
              <div class="class-section">${entry.room_name}</div>
            </div>
          </td>
        `;
      } else {
        html += `
          <td class="timetable-cell">
            <div class="empty-slot">-</div>
          </td>
        `;
      }
    });

    row.innerHTML = html;
    weeklyTimetableGridBody.appendChild(row);
  });

  renderTodayClasses(data);
}

async function loadFacultyTimetable() {
  const [slots, timetable] = await Promise.all([
    fetchJSON(`${API_BASE}/time-slots`),
    fetchJSON(`${API_BASE}/faculty/timetable/${loggedInUser.id}`)
  ]);

  allTimeSlots = slots.filter((item) => item.slot_label !== "Lunch Break");
  facultyTimetableEntries = timetable;

  renderTimetableGrid(facultyTimetableEntries);
}

async function initFacultyPortal() {
  try {
    await loadFacultyProfile();
    await loadFacultyTimetable();
  } catch (error) {
    alert(error.message);
  }
}

function downloadWeeklyTimetablePDF() {
  const timetableTable = document.querySelector(".timetable-card .timetable-grid");
  if (!timetableTable) return;

  const exportWrapper = document.createElement("div");
  exportWrapper.style.background = "#ffffff";
  exportWrapper.style.padding = "12px";
  exportWrapper.style.width = "1120px";
  exportWrapper.style.boxSizing = "border-box";
  exportWrapper.style.fontFamily = '"Segoe UI", Arial, sans-serif';
  exportWrapper.style.color = "#162033";

  const tableClone = timetableTable.cloneNode(true);

  tableClone.style.width = "100%";
  tableClone.style.minWidth = "100%";
  tableClone.style.borderCollapse = "collapse";
  tableClone.style.tableLayout = "fixed";

  const allCells = tableClone.querySelectorAll("th, td");
  allCells.forEach((cell) => {
    cell.style.padding = "4px 5px";
    cell.style.fontSize = "11px";
    cell.style.lineHeight = "1.15";
    cell.style.wordBreak = "break-word";
    cell.style.verticalAlign = "top";
    cell.style.border = "1px solid #d9e2f2";
  });

  const firstColumnCells = tableClone.querySelectorAll("td:first-child, th:first-child");
  firstColumnCells.forEach((cell) => {
    cell.style.width = "130px";
    cell.style.fontWeight = "700";
    cell.style.background = "#f7faff";
  });

  const classBoxes = tableClone.querySelectorAll(".class-box");
  classBoxes.forEach((box) => {
    box.style.padding = "5px";
    box.style.minHeight = "unset";
    box.style.borderRadius = "8px";
    box.style.border = "1px solid #dbe7fb";
    box.style.background = "#f8fbff";
  });

  const subjectEls = tableClone.querySelectorAll(".class-subject");
  subjectEls.forEach((el) => {
    el.style.fontSize = "11px";
    el.style.fontWeight = "700";
    el.style.marginBottom = "4px";
  });

  const metaEls = tableClone.querySelectorAll(".class-code, .class-section, .class-room");
  metaEls.forEach((el) => {
    el.style.fontSize = "9px";
    el.style.marginBottom = "2px";
  });

  const emptyEls = tableClone.querySelectorAll(".empty-slot");
  emptyEls.forEach((el) => {
    el.style.fontSize = "11px";
    el.style.color = "#7b8ca9";
  });

  exportWrapper.appendChild(tableClone);

  const facultyName = profileNameSide?.textContent?.trim() || "faculty";

  const options = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename: `${facultyName.replace(/\s+/g, "_")}_weekly_timetable.pdf`,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: {
      scale: 1.4,
      useCORS: true,
      backgroundColor: "#ffffff"
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "landscape"
    },
    pagebreak: {
      mode: ["css"]
    }
  };

  html2pdf().set(options).from(exportWrapper).save();
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", initFacultyPortal);
}

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener("click", downloadWeeklyTimetablePDF);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "../login_portal/login.html";
  });
}

initFacultyPortal();