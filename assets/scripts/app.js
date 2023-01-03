class Tooltip {}

class ProjectItem {
    constructor(id) {
        this.id = id;
        this.connectMoreInfoButton();
        this.connectSwitchButton();
    }

    connectMoreInfoButton() {

    }

    connectSwitchButton() {
        const projectItemElement = document.getElementById(this.id);
        const switchButton = projectItemElement.querySelector('button:last-of-type');
        switchButton.addEventListener('click', )
    }
}

class ProjectList {
    projects = [];
    constructor(type) {
        const prjItems = document.querySelectorAll(`#${type}-projects li`);
        for (const prjItem of prjItems) {
            this.projects.push(new ProjectItem(prjItem.id));
        }
    }

    addProject() {

    }
    switchProject(projectId) {
        //One way to remove the project from the list
        // const projectIndex = this.projects.findIndex(p => p.id === projectId );
        // this.projects.splice(projectIndex, 1);

        //Shorter alternative ->
        this.projects = this.projects.filter(p => p.id !== projectId);
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