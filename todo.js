const ToDo = class {
    #storageKey = 'toDoAppTasks';

    constructor(listContainer, taskInput, dateInput, addButton, searchInput) {
        this.tasks = [];
        this.currentSearch = "";

        this.container = listContainer;
        this.taskInput = taskInput;
        this.dateInput = dateInput;
        this.addButton = addButton;
        this.searchInput = searchInput;

        this.#loadTasks(); 
        this.#init();
        this.draw();
    }

    #init() {
        this.addButton.addEventListener('click', () => this.#handleAddTask());
        this.taskInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.#handleAddTask();
        });

        this.container.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.delete');
            if (deleteButton) {
                const element = deleteButton.closest('.element');
                this.#handleDelete(parseInt(element.dataset.index, 10));
                return;
            }
            const clickableArea = event.target.closest('.text, .date');
            if (clickableArea) {
                this.#handleStartEdit(clickableArea.closest('.element'));
                return;
            }
        });

        document.addEventListener('click', (event) => {
            const currentEditor = this.container.querySelector('.element.editing');
            if (!currentEditor) return;
            const isClickInsideEditor = currentEditor.contains(event.target);
            const isClickInSearch = event.target.closest('.search');
            const isClickInAddForm = event.target.closest('.add-form');
            if (!isClickInsideEditor && !isClickInAddForm && !isClickInSearch) {
                this.#handleSaveEdit();
            }
        });

        this.searchInput.addEventListener('input', () => {
            this.#handleSearch();
        });
    }

    #handleAddTask() {
        const title = this.taskInput.value.trim();
        const date = this.dateInput.value;

        if (title.length < 3) {
            alert("Title must be at least 3 characters long");
            return;
        }

        if (title.length > 255) {
            alert("Title must not exceed 255 characters.");
            return;
        }

        if (date) { 
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const inputDate = new Date(date);

            if (inputDate < today) {
                alert("Date cannot be in the past. Please select today or a later date.");
                return;
            }
        }

        this.addTask(title, date);

        this.taskInput.value = '';
        this.dateInput.value = '';
        this.taskInput.focus();
    }

    #handleDelete(index) {
        if (index >= 0 && index < this.tasks.length) {
            this.tasks.splice(index, 1);
            this.#saveTasks();
            this.draw();
        }
    }

    #handleStartEdit(element) {
        const indexToEdit = element.dataset.index;
        const currentEditor = this.container.querySelector('.element.editing');
        if (currentEditor && currentEditor.dataset.index === indexToEdit) {
            return;
        }
        if (currentEditor) {
            this.#handleSaveEdit();
        }
        const newElementToEdit = this.container.querySelector(`.element[data-index="${indexToEdit}"]`);
        if (newElementToEdit) {
            newElementToEdit.classList.add('editing');
            newElementToEdit.querySelector('.edit-text').focus();
        }
    }

    #handleSaveEdit() {
        const currentEditor = this.container.querySelector('.element.editing');
        if (!currentEditor) return;

        const index = parseInt(currentEditor.dataset.index, 10);
        const newTitle = currentEditor.querySelector('.edit-text').value.trim();
        const newDate = currentEditor.querySelector('.edit-date').value;

        if (!newTitle || newTitle.length < 3) {
            alert("Title must be at least 3 characters long");
            currentEditor.querySelector('.edit-text').focus();
            return;
        }
        if (newTitle.length > 255) {
            alert("Title must not exceed 255 characters.");
            return;
        }

        if (newDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(newDate);
            if (inputDate < today) {
                alert("Date cannot be in the past.");
                return;
            }
        }

        this.tasks[index].title = newTitle;
        this.tasks[index].date = newDate || "";
        this.#saveTasks();
        this.draw();
    }

    #handleSearch() {
        this.currentSearch = this.searchInput.value.toLowerCase();
        this.draw();
    }

    addTask(title, date) {
        const newTask = {
            title: title,
            date: date || ""
        };
        this.tasks.push(newTask);
        this.#saveTasks();
        this.draw();
    }

    draw() {
        this.container.innerHTML = '';
        const query = this.currentSearch;

        this.tasks.forEach((element, index) => {
            if (query.length >= 2) {
                if (!element.title.toLowerCase().includes(query)) {
                    return;
                }
            }
            this.#drawElement(element.title, element.date, index);
        });
    }

    #drawElement(title, date, index) {
        let htmlElement = document.createElement("div");
        htmlElement.className = "element";
        htmlElement.dataset.index = index;

        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.className = "select";

        let titleBox = document.createElement("div");
        titleBox.className = "text";

        const query = this.currentSearch;
        if (query.length >= 2 && title.toLowerCase().includes(query)) {
            const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'gi');
            const highlightedHTML = title.replace(regex, (match) => `<mark>${match}</mark>`);
            titleBox.innerHTML = highlightedHTML;
        } else {
            titleBox.textContent = title;
        }

        let dateBox = document.createElement("div");
        dateBox.className = "date";
        dateBox.textContent = date;

        let deleteBox = document.createElement("div");
        deleteBox.className = "delete";
        deleteBox.innerHTML = "<i class='bx bx-trash'></i>";

        let editTitle = document.createElement("input");
        editTitle.className = "edit-text";
        editTitle.setAttribute("type", "text");
        editTitle.value = title;

        let editDate = document.createElement("input");
        editDate.className = "edit-date";
        editDate.setAttribute("type", "date");
        editDate.value = date;

        htmlElement.append(
            checkbox,
            titleBox, editTitle,
            dateBox, editDate,
            deleteBox
        );
        this.container.append(htmlElement);
    }

    #saveTasks() {
        localStorage.setItem(this.#storageKey, JSON.stringify(this.tasks));
    }

    #loadTasks() {
        const tasksJSON = localStorage.getItem(this.#storageKey);

        if (tasksJSON) {
            try {
                this.tasks = JSON.parse(tasksJSON);
            } catch (e) {
                console.error("Błąd odczytu Local Storage:", e);
                this.tasks = [];
                this.#saveTasks();
            }
        } else {
            this.tasks = [];
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const listContainer = document.getElementById('list');
    const taskInput = document.getElementById('newTaskText');
    const dateInput = document.getElementById('newTaskDate');
    const addButton = document.getElementById('addTask');
    const searchInput = document.querySelector('.search-input');

    if (!listContainer || !taskInput || !dateInput || !addButton || !searchInput) {
        console.error("Błąd: Nie znaleziono wszystkich elementów formularza, listy lub wyszukiwarki.");
        return;
    }

    const myToDoList = new ToDo(
        listContainer,
        taskInput,
        dateInput,
        addButton,
        searchInput
    );
});