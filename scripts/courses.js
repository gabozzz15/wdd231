const courses = [
  { id: "WDD130", title: "Web Design and Development I", category: "WDD", credits: 3, completed: true },
  { id: "WDD131", title: "Web Design and Development II", category: "WDD", credits: 3, completed: true },
  { id: "WDD231", title: "Web Design and Development III", category: "WDD", credits: 3, completed: false },
  { id: "CSE120", title: "Intro to Programming", category: "CSE", credits: 3, completed: true },
  { id: "CSE140", title: "Data Structures", category: "CSE", credits: 3, completed: false }
];

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('course-list');
  const creditTotalEl = document.getElementById('creditTotal');
  const filterButtons = document.querySelectorAll('.filter-btn');

  function renderCourses(filtered) {
    listEl.innerHTML = '';
    if (!filtered || filtered.length === 0) {
      listEl.innerHTML = '<p>No courses to display.</p>';
      creditTotalEl.textContent = '0';
      return;
    }

    filtered.forEach(course => {
      const card = document.createElement('article');
      card.className = 'course-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-labelledby', `course-${course.id}`);

      const left = document.createElement('div');
      left.className = 'course-left';

      const code = document.createElement('div');
      code.className = 'course-code';
      code.textContent = course.id;

      const title = document.createElement('p');
      title.className = 'course-title';
      title.id = `course-${course.id}`;
      title.textContent = course.title;

      left.appendChild(code);
      left.appendChild(title);

      const right = document.createElement('div');
      right.className = 'course-right course-meta';

      const credits = document.createElement('div');
      credits.className = 'course-credits';
      credits.textContent = `${course.credits} credits`;

      right.appendChild(credits);

      if (course.completed) {
        const completedTag = document.createElement('div');
        completedTag.className = 'course-complete';
        completedTag.textContent = 'Completed';
        completedTag.setAttribute('aria-label', `${course.id} completed`);
        right.appendChild(completedTag);
      }

      card.appendChild(left);
      card.appendChild(right);
      listEl.appendChild(card);
    });

    // calculate credits with reduce
    const total = filtered.reduce((sum, c) => sum + (c.credits || 0), 0);
    creditTotalEl.textContent = total;
  }

  function filterBy(category) {
    if (category === 'all') {
      renderCourses(courses);
    } else {
      renderCourses(courses.filter(c => c.category === category));
    }
  }

  // Add click handlers
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      filterBy(cat);
    });
  });

  renderCourses(courses);
});
