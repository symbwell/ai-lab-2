const ToDo = class {
    constructor(listContainer) {
        this.tasks = [];
        this.container = listContainer;
    }

    draw() {
        this.container.innerHtml = '';

        this.tasks.forEach(element => {
            this.drawElement(element.title, element.date);
        });
    }

    #drawElement(title, date) {
        let htmlElement = document.createElement("div").className("element");
        let checkbox = document.createElement("input").setAttribute("type", "checkbox").className("select");

        let titleBox = document.createElement("div").className("text");
        titleBox.createTextNode(title);

        let dateBox = document.createElement("div").className("date");
        dateBox.createTextNode(date);

        let deleteBox = document.createElement("div").className("delete");
        deleteBox.innerHtml = "<i class='bx bx-trash'></i>";

        htmlElement
            .append(checkbox)
            .append(titleBox)
            .append(dateBox)
            .append(deleteBox);

        this.listContainer
            .append(htmlElement);
    }
}