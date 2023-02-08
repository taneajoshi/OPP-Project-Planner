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
        element.scrollIntoView({behavior: 'smooth'});
    }
}

class Component {
  constructor (hostElementId, insertBefore = false) {
    if(hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    }else {
      this.hostElement = document.body;
    }

    this.insertBefore = insertBefore;
  }

  detach() {
    if(this.element) {
      this.element.remove();
       //If we need the older browser support, then we need to do this instead - >
       // this.element.parentElement.removeChild(this.element);
    }
  }

  attach() {
    this.hostElement.insertAdjacentElement(this.insetBefore ? 'afterbegin' : 'beforeend' ,this.element);
  }  
}

class Tooltip extends Component{

  constructor (closeNotifierFunction, text, positonId) {
    super(positonId);
    this.closeNotifier = closeNotifierFunction;
    this.text = text;
    this.create();
  }

  closeTooltip = () => {
    this.detach();
    this.closeNotifier();
  }

  create() {
    const tooltipElement = document.createElement('div');
    tooltipElement.className = "card"; 
    const tooltipTemplate = document.getElementById('tooltip');
    const tooltipBody = document.importNode(tooltipTemplate.content, true);
    tooltipBody.querySelector('p').textContent = this.text;
    tooltipElement.append(tooltipBody);

    tooltipElement.addEventListener('click', this.closeTooltip);
    this.element = tooltipElement;
  }
}

class ProjectItem {
  hasActiveTooltip = false;
  constructor(id, updateProjectListsFunction, type) {
    this.id = id;
    this.updateProjectListsHandler = updateProjectListsFunction;
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
    this.connectDrag();
  }

  showMoreInfoHandler() {
    if(this.hasActiveTooltip) {
      return;
    }

    const projectElement = document.getElementById(this.id);
    const tooltipText = projectElement.dataset.extraInfo;

    const tooltip = new Tooltip(()=> {
      this.hasActiveTooltip = false;
    }, tooltipText, this.id);

    tooltip.attach();
    this.hasActiveTooltip = true;
  }

  connectDrag(){
    document.getElementById(this.id).addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', this.id);
      e.dataTransfer.effectAllowed = 'move';
    });
  }

  connectMoreInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
    moreInfoBtn.addEventListener('click', this.showMoreInfoHandler.bind(this));
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
    this.connectDroppable();
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  connectDroppable() {
    const list = document.querySelector(`#${this.type}-projects ul`);
    list.addEventListener('dragenter', e => {
      //If we have multiple draggable items in the page then we can make sure if we are dragging the correct element by doing this check.
      if(e.dataTransfer.types[0] === 'text/plain') {
        list.parentElement.classList.add('droppable');
        e.preventDefault();
      }
    });
    list.addEventListener('dragover', e => {
      if(e.dataTransfer.types[0] === 'text/plain') {
        e.preventDefault();
      }
    });

    list.addEventListener('dragleave', e => {
      if (e.relatedTarget.closest(`#${this.type}-projects ul`) !== list) {
        list.parentElement.classList.remove('droppable');
      }
    })
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