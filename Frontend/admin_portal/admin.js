const API_BASE = "http://localhost:5000/api";

const loggedInUser = JSON.parse(localStorage.getItem("user"));

if (!loggedInUser || loggedInUser.role !== "admin") {
  window.location.href = "../login_portal/login.html";
}

const timetableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

let allTimetableEntries = [];
let allTimeSlots = [];
let allSections = [];
let allFaculty = [];

const facultyCount = document.getElementById("facultyCount");
const subjectCount = document.getElementById("subjectCount");
const roomCount = document.getElementById("roomCount");
const sectionCount = document.getElementById("sectionCount");
const timetableCount = document.getElementById("timetableCount");

const timetableBody = document.getElementById("timetableBody");
const sectionTimetableGridBody = document.getElementById("sectionTimetableGridBody");
const facultyTimetableGridBody = document.getElementById("facultyTimetableGridBody");

const adminNameSide = document.getElementById("adminNameSide");
const adminUsernameSide = document.getElementById("adminUsernameSide");
const adminAvatar = document.getElementById("adminAvatar");

const sectionViewSelect = document.getElementById("sectionViewSelect");
const facultyViewSelect = document.getElementById("facultyViewSelect");

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");

const moduleCards = document.querySelectorAll(".module-card");
const modulePanels = document.querySelectorAll(".module-panel");

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

function loadAdminProfile() {
  if (adminNameSide) {
    adminNameSide.textContent = loggedInUser.name || "Admin User";
  }

  if (adminUsernameSide) {
    adminUsernameSide.textContent = `Username: ${loggedInUser.username}`;
  }

  if (adminAvatar) {
    const displayName = loggedInUser.name || loggedInUser.username || "A";
    adminAvatar.textContent = displayName.charAt(0).toUpperCase();
  }
}

function activateModule(moduleId) {
  moduleCards.forEach((card) => {
    card.classList.remove("active");
  });

  modulePanels.forEach((panel) => {
    panel.classList.remove("active");
  });

  const activeCard = document.querySelector(`.module-card[data-module="${moduleId}"]`);
  const activePanel = document.getElementById(moduleId);

  if (activeCard) {
    activeCard.classList.add("active");
  }

  if (activePanel) {
    activePanel.classList.add("active");
  }
}

async function loadStats() {
  const stats = await fetchJSON(`${API_BASE}/dashboard/stats`);

  if (facultyCount) facultyCount.textContent = stats.faculty;
  if (subjectCount) subjectCount.textContent = stats.subjects;
  if (roomCount) roomCount.textContent = stats.rooms;
  if (sectionCount) sectionCount.textContent = stats.sections;
  if (timetableCount) timetableCount.textContent = stats.timetable;
}

async function loadDropdowns() {
  const [subjects, faculty, rooms, sections, slots] = await Promise.all([
    fetchJSON(`${API_BASE}/subjects`),
    fetchJSON(`${API_BASE}/faculty`),
    fetchJSON(`${API_BASE}/rooms`),
    fetchJSON(`${API_BASE}/sections`),
    fetchJSON(`${API_BASE}/time-slots`)
  ]);

  allSections = sections;
  allFaculty = faculty;
  allTimeSlots = slots.filter((item) => item.slot_label !== "Lunch Break");

  const subjectSelect = document.getElementById("subject_id");
  const facultySelect = document.getElementById("faculty_id");
  const roomSelect = document.getElementById("room_id");
  const sectionSelect = document.getElementById("section_id");
  const slotSelect = document.getElementById("slot_id");

  const facultyTtFacultySelect = document.getElementById("faculty_tt_faculty_id");
  const facultyTtSectionSelect = document.getElementById("faculty_tt_section_id");
  const facultyTtSlotSelect = document.getElementById("faculty_tt_slot_id");
  const facultyTtSubjectSelect = document.getElementById("faculty_tt_subject_id");
  const facultyTtRoomSelect = document.getElementById("faculty_tt_room_id");

  if (subjectSelect) subjectSelect.innerHTML = `<option value="">Select Subject</option>`;
  if (facultySelect) facultySelect.innerHTML = `<option value="">Select Faculty</option>`;
  if (roomSelect) roomSelect.innerHTML = `<option value="">Select Room</option>`;
  if (sectionSelect) sectionSelect.innerHTML = `<option value="">Select Section</option>`;
  if (slotSelect) slotSelect.innerHTML = `<option value="">Select Time Slot</option>`;

  if (facultyTtFacultySelect) facultyTtFacultySelect.innerHTML = `<option value="">Select Faculty</option>`;
  if (facultyTtSectionSelect) facultyTtSectionSelect.innerHTML = `<option value="">Select Section</option>`;
  if (facultyTtSlotSelect) facultyTtSlotSelect.innerHTML = `<option value="">Select Time Slot</option>`;
  if (facultyTtSubjectSelect) facultyTtSubjectSelect.innerHTML = `<option value="">Select Subject</option>`;
  if (facultyTtRoomSelect) facultyTtRoomSelect.innerHTML = `<option value="">Select Room</option>`;

  if (sectionViewSelect) sectionViewSelect.innerHTML = `<option value="">Select Section to View</option>`;
  if (facultyViewSelect) facultyViewSelect.innerHTML = `<option value="">Select Faculty to View</option>`;

  subjects.forEach((item) => {
    if (subjectSelect) {
      subjectSelect.innerHTML += `<option value="${item.subject_id}">${item.subject_name} (${item.subject_code})</option>`;
    }
    if (facultyTtSubjectSelect) {
      facultyTtSubjectSelect.innerHTML += `<option value="${item.subject_id}">${item.subject_name} (${item.subject_code})</option>`;
    }
  });

  faculty.forEach((item) => {
    if (facultySelect) {
      facultySelect.innerHTML += `<option value="${item.faculty_id}">${item.faculty_name}</option>`;
    }
    if (facultyViewSelect) {
      facultyViewSelect.innerHTML += `<option value="${item.faculty_id}">${item.faculty_name}</option>`;
    }
    if (facultyTtFacultySelect) {
      facultyTtFacultySelect.innerHTML += `<option value="${item.faculty_id}">${item.faculty_name}</option>`;
    }
  });

  rooms.forEach((item) => {
    if (roomSelect) {
      roomSelect.innerHTML += `<option value="${item.room_id}">${item.room_name}</option>`;
    }
    if (facultyTtRoomSelect) {
      facultyTtRoomSelect.innerHTML += `<option value="${item.room_id}">${item.room_name}</option>`;
    }
  });

  sections.forEach((item) => {
    const label = `${item.branch} - Sem ${item.semester} - ${item.section_name}`;

    if (sectionSelect) {
      sectionSelect.innerHTML += `<option value="${item.section_id}">${label}</option>`;
    }
    if (sectionViewSelect) {
      sectionViewSelect.innerHTML += `<option value="${item.section_id}">${label}</option>`;
    }
    if (facultyTtSectionSelect) {
      facultyTtSectionSelect.innerHTML += `<option value="${item.section_id}">${label}</option>`;
    }
  });

  allTimeSlots.forEach((item) => {
    const slotLabel = `${item.slot_label} (${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)})`;

    if (slotSelect) {
      slotSelect.innerHTML += `<option value="${item.slot_id}">${slotLabel}</option>`;
    }
    if (facultyTtSlotSelect) {
      facultyTtSlotSelect.innerHTML += `<option value="${item.slot_id}">${slotLabel}</option>`;
    }
  });
}

async function loadTimetable() {
  allTimetableEntries = await fetchJSON(`${API_BASE}/timetable`);

  if (timetableBody) {
    timetableBody.innerHTML = "";

    if (allTimetableEntries.length === 0) {
      timetableBody.innerHTML = `
        <tr>
          <td colspan="8">No timetable entries found.</td>
        </tr>
      `;
    } else {
      allTimetableEntries.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.day}</td>
          <td>${item.slot_label}</td>
          <td>${item.start_time} - ${item.end_time}</td>
          <td>${item.subject_name}</td>
          <td>${item.faculty_name}</td>
          <td>${item.room_name}</td>
          <td>${item.branch} Sem-${item.semester} ${item.section_name}</td>
          <td><button class="delete-btn" onclick="deleteTimetable(${item.timetable_id})">Delete</button></td>
        `;
        timetableBody.appendChild(row);
      });
    }
  }

  updateSectionGrid();
  updateFacultyGrid();
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

function renderSectionTimetable(entries) {
  if (!sectionTimetableGridBody) return;

  const map = buildTimetableMap(entries);
  sectionTimetableGridBody.innerHTML = "";

  if (allTimeSlots.length === 0) {
    sectionTimetableGridBody.innerHTML = `<tr><td colspan="7">No time slots available.</td></tr>`;
    return;
  }

  allTimeSlots.forEach((slot) => {
    const row = document.createElement("tr");
    let html = `<td>${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}</td>`;

    timetableDays.forEach((day) => {
      const entry = map[String(slot.slot_id)]?.[day] || map[String(slot.slot_label)]?.[day];

      if (entry) {
        html += `
          <td class="timetable-cell">
            <div class="class-box">
              <div class="class-subject">${entry.subject_name}</div>
              <div class="class-code">${entry.subject_code || ""}</div>
              <div class="class-faculty">${entry.faculty_name}</div>
              <div class="class-room">${entry.room_name}</div>
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
    sectionTimetableGridBody.appendChild(row);
  });
}

function renderFacultyTimetable(entries) {
  if (!facultyTimetableGridBody) return;

  const map = buildTimetableMap(entries);
  facultyTimetableGridBody.innerHTML = "";

  if (allTimeSlots.length === 0) {
    facultyTimetableGridBody.innerHTML = `<tr><td colspan="7">No time slots available.</td></tr>`;
    return;
  }

  allTimeSlots.forEach((slot) => {
    const row = document.createElement("tr");
    let html = `<td>${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}</td>`;

    timetableDays.forEach((day) => {
      const entry = map[String(slot.slot_id)]?.[day] || map[String(slot.slot_label)]?.[day];

      if (entry) {
        html += `
          <td class="timetable-cell">
            <div class="class-box">
              <div class="class-subject">${entry.subject_name}</div>
              <div class="class-section">${entry.branch} ${entry.section_name}</div>
              <div class="class-room">${entry.room_name}</div>
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
    facultyTimetableGridBody.appendChild(row);
  });
}

function updateSectionGrid() {
  const selectedSectionId = sectionViewSelect?.value;

  if (!selectedSectionId) {
    renderSectionTimetable([]);
    return;
  }

  const selectedSection = allSections.find(
    (item) => String(item.section_id) === String(selectedSectionId)
  );

  if (!selectedSection) {
    renderSectionTimetable([]);
    return;
  }

  const filtered = allTimetableEntries.filter((item) => {
    if (String(item.section_id) === String(selectedSectionId)) {
      return true;
    }

    return (
      item.section_name === selectedSection.section_name &&
      String(item.semester) === String(selectedSection.semester) &&
      item.branch === selectedSection.branch
    );
  });

  renderSectionTimetable(filtered);
}

function updateFacultyGrid() {
  const selectedFacultyId = facultyViewSelect?.value;

  if (!selectedFacultyId) {
    renderFacultyTimetable([]);
    return;
  }

  const selectedFaculty = allFaculty.find(
    (item) => String(item.faculty_id) === String(selectedFacultyId)
  );

  if (!selectedFaculty) {
    renderFacultyTimetable([]);
    return;
  }

  const filtered = allTimetableEntries.filter((item) => {
    if (String(item.faculty_id) === String(selectedFacultyId)) {
      return true;
    }

    return item.faculty_name === selectedFaculty.faculty_name;
  });

  renderFacultyTimetable(filtered);
}

async function deleteTimetable(id) {
  try {
    await fetchJSON(`${API_BASE}/timetable/${id}`, { method: "DELETE" });
    alert("Timetable entry deleted successfully");
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

window.deleteTimetable = deleteTimetable;

async function loadAllData() {
  try {
    loadAdminProfile();
    await loadStats();
    await loadDropdowns();
    await loadTimetable();
  } catch (error) {
    alert(error.message);
  }
}

const facultyForm = document.getElementById("facultyForm");
if (facultyForm) {
  facultyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      faculty_name: document.getElementById("faculty_name").value,
      email: document.getElementById("faculty_email").value,
      department: document.getElementById("faculty_department").value
    };

    try {
      await fetchJSON(`${API_BASE}/faculty`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      e.target.reset();
      await loadAllData();
      activateModule("masterDataModule");
      alert("Faculty added successfully");
    } catch (error) {
      alert(error.message);
    }
  });
}

const subjectForm = document.getElementById("subjectForm");
if (subjectForm) {
  subjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      subject_name: document.getElementById("subject_name").value,
      subject_code: document.getElementById("subject_code").value,
      semester: document.getElementById("subject_semester").value
    };

    try {
      await fetchJSON(`${API_BASE}/subjects`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      e.target.reset();
      await loadAllData();
      activateModule("masterDataModule");
      alert("Subject added successfully");
    } catch (error) {
      alert(error.message);
    }
  });
}

const roomForm = document.getElementById("roomForm");
if (roomForm) {
  roomForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      room_name: document.getElementById("room_name").value,
      room_type: document.getElementById("room_type").value,
      capacity: document.getElementById("room_capacity").value
    };

    try {
      await fetchJSON(`${API_BASE}/rooms`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      e.target.reset();
      await loadAllData();
      activateModule("masterDataModule");
      alert("Room added successfully");
    } catch (error) {
      alert(error.message);
    }
  });
}

const sectionForm = document.getElementById("sectionForm");
if (sectionForm) {
  sectionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      section_name: document.getElementById("section_name").value,
      semester: document.getElementById("section_semester").value,
      branch: document.getElementById("section_branch").value
    };

    try {
      await fetchJSON(`${API_BASE}/sections`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      e.target.reset();
      await loadAllData();
      activateModule("masterDataModule");
      alert("Section added successfully");
    } catch (error) {
      alert(error.message);
    }
  });
}

const timetableForm = document.getElementById("timetableForm");
if (timetableForm) {
  timetableForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedSectionId = document.getElementById("section_id").value;

    const payload = {
      section_id: selectedSectionId,
      day: document.getElementById("day").value,
      slot_id: document.getElementById("slot_id").value,
      subject_id: document.getElementById("subject_id").value,
      faculty_id: document.getElementById("faculty_id").value,
      room_id: document.getElementById("room_id").value
    };

    try {
      await fetchJSON(`${API_BASE}/timetable`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      e.target.reset();
      await loadAllData();

      if (sectionViewSelect) {
        sectionViewSelect.value = selectedSectionId;
        updateSectionGrid();
      }

      activateModule("studentTimetableModule");
      alert("Student timetable entry added successfully");
    } catch (error) {
      alert(error.message);
    }
  });
}

const facultyTimetableForm = document.getElementById("facultyTimetableForm");
if (facultyTimetableForm) {
  facultyTimetableForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedFacultyId = document.getElementById("faculty_tt_faculty_id").value;

    const payload = {
      section_id: document.getElementById("faculty_tt_section_id").value,
      day: document.getElementById("faculty_tt_day").value,
      slot_id: document.getElementById("faculty_tt_slot_id").value,
      subject_id: document.getElementById("faculty_tt_subject_id").value,
      faculty_id: selectedFacultyId,
      room_id: document.getElementById("faculty_tt_room_id").value
    };

    try {
      await fetchJSON(`${API_BASE}/timetable`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      e.target.reset();
      await loadAllData();

      if (facultyViewSelect) {
        facultyViewSelect.value = selectedFacultyId;
        updateFacultyGrid();
      }

      activateModule("facultyTimetableModule");
      alert("Faculty timetable entry added successfully");
    } catch (error) {
      alert(error.message);
    }
  });
}

if (sectionViewSelect) {
  sectionViewSelect.addEventListener("change", updateSectionGrid);
}

if (facultyViewSelect) {
  facultyViewSelect.addEventListener("change", updateFacultyGrid);
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    await loadAllData();
    updateSectionGrid();
    updateFacultyGrid();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "../login_portal/login.html";
  });
}

moduleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const moduleId = card.getAttribute("data-module");
    activateModule(moduleId);
  });
});

loadAllData();