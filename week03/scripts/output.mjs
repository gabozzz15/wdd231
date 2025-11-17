export function setTitle(course) {
  document.querySelector("#courseName").textContent =
    course.name + " (" + course.code + ")";
}

export function renderSections(sections) {
  const tbody = document.querySelector("#sections");
  tbody.innerHTML = "";

  sections.forEach(sec => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sec.sectionNum}</td>
      <td>${sec.enrolled}</td>
      <td>${sec.instructor}</td>
    `;
    tbody.appendChild(row);
  });
}
