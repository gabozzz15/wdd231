const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".primary-nav");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  nav.classList.toggle("is-open");
});

const container = document.querySelector("#members-container");
const gridBtn = document.querySelector("#gridView");
const listBtn = document.querySelector("#listView");

async function getMembers() {
  const response = await fetch("./data/members.json");
  const members = await response.json();
  displayMembers(members);
}

function displayMembers(members) {
  container.innerHTML = "";
  members.forEach(member => {
    const card = document.createElement("article");
    card.classList.add("member-card");

    card.innerHTML = `
      <img src="images/${member.image}" alt="${member.name} logo">
      <div class="member-info">
        <h3>${member.name}</h3>
        <p>${member.address}</p>
        <p>${member.phone}</p>
        <a href="${member.website}" target="_blank">${member.website}</a>
        <p class="membership">Level: ${member.membership}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

gridBtn.addEventListener("click", () => {
  container.classList.add("grid-view");
  container.classList.remove("list-view");
  gridBtn.classList.add("active");
  listBtn.classList.remove("active");
});

listBtn.addEventListener("click", () => {
  container.classList.add("list-view");
  container.classList.remove("grid-view");
  listBtn.classList.add("active");
  gridBtn.classList.remove("active");
});

document.querySelector("#copyright").textContent =
  `© ${new Date().getFullYear()} Venezuelan Chamber of Commerce`;
document.querySelector("#lastModified").textContent =
  `Last Modification: ${document.lastModified}`;

getMembers();
