class Tooltip {}

class ProjectItem {}

class ProjectList {
    constructor(type) {
        const prjItems = document.querySelectorAll(`#${type}-projects li`);
        console.log(prjItems);
    }
}

class App  {
    //Static method as we will call it only once, for the first time when the script loads.
    static init() {
        const activeProjectList = new ProjectList('active');
        const FinishedProjectList = new ProjectList('finished');

    }
}

App.init();