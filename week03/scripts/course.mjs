const byuiCourse = {
  code: "WDD231",
  name: "Web Frontend Development I",
  sections: [
    { sectionNum: 1, enrolled: 88, instructor: "Brother Bingham" },
    { sectionNum: 2, enrolled: 81, instructor: "Sister Shultz" },
    { sectionNum: 3, enrolled: 95, instructor: "Sister Smith" }
  ],

  changeEnrollment(sectionNum, add = true) {
    const section = this.sections.find(sec => sec.sectionNum == sectionNum);
    if (!section) return;

    if (add) section.enrolled++;
    else if (section.enrolled > 0) section.enrolled--;
  }
};

export default byuiCourse;
