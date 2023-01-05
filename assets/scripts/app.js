class DOMHepler {
    static clearEventListners(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }
    static moveElement(elementId, newDestinationSelector) {
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element);
    }
}

class Tooltip {

  constructor (closeNotifierFunction) {
    this.closeNotifier = closeNotifierFunction;
  }

  closeTooltip = () => {
    this.detach();
    this.closeNotifier();
  }

  detach() {
    this.element.remove();
    //If we need the older browser support, then we need to do this instead - >
    // this.element.parentElement.removeChild(this.element);
  }

  attach() {
    const tooltipElement = document.createElement('div');
    tooltipElement.className = "card"; 
    tooltipElement.textContent = "Dummy tooltip content";
    tooltipElement.addEventListener('click', this.detach);
    this.element = tooltipElement;
    document.body.append(tooltipElement);
  }  
}

class ProjectItem {
  hasActiveTooltip = false;
  constructor(id, updateProjectListsFunction, type) {
    this.id = id;
    this.updateProjectListsHandler = updateProjectListsFunction;
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
  }

  showMoreInfoHandler() {
    if(this.hasActiveTooltip) {
      return;
    }

    const tooltip = new Tooltip(()=> {
      this.hasActiveTooltip = false;
    });

    tooltip.attach();
    this.hasActiveTooltip = true;
  }

  connectMoreInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
    moreInfoBtn.addEventListener('click', this.showMoreInfoHandler);
  }

  connectSwitchButton(type) {
    const projectItemElement = document.getElementById(this.id);
    let switchBtn = projectItemElement.querySelector('button:last-of-type');
    switchBtn = DOMHepler.clearEventListners(switchBtn);
    switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';
    switchBtn.addEventListener('click', this.updateProjectListsHandler.bind(null, this.id));
  }

  update(updateProjectListFn, type) {
    this.updateProjectListsHandler = updateProjectListFn;
    this.connectSwitchButton(type);
  }
}

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    for (const prjItem of prjItems) {
      this.projects.push(
        new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type)
      );
    }
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  addProject(project) { 
    this.projects.push(project); 
    DOMHepler.moveElement(project.id, `#${this.type}-projects ul`); 
    project.update(this.switchProject.bind(this), this.type);
  }

    switchProject(projectId) {
        //One way to remove the project from the list
        // const projectIndex = this.projects.findIndex(p => p.id === projectId );
        // this.projects.splice(projectIndex, 1);

        //Shorter alternative ->
        this.switchHandler(this.projects.find(p => p.id === projectId));
        this.projects = this.projects.filter(p => p.id !== projectId);
    }
}

class App  {
    //Static method as we will call it only once, for the first time when the script loads.
    static init() {
        const activeProjectsList = new ProjectList('active');
        const finishedProjectsList = new ProjectList('finished');
        activeProjectsList.setSwitchHandlerFunction(finishedProjectsList.addProject.bind(finishedProjectsList));
        finishedProjectsList.setSwitchHandlerFunction(activeProjectsList.addProject.bind(activeProjectsList));

    }
}

App.init();