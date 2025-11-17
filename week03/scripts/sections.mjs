export function setSectionSelection(sections) {
  const select = document.querySelector("#sectionNumber");
  select.innerHTML = "";

  sections.forEach(sec => {
    const option = document.createElement("option");
    option.value = sec.sectionNum;
    option.textContent = sec.sectionNum;
    select.appendChild(option);
  });
}
