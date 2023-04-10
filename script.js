// Elements
const addTaskBtn = document.querySelector(".add-task-btn");
const formSection = document.querySelector(".form-section");
const form = document.forms["addTask"];
const inputBody = form["body"];
const select = form["status"];
const listContainer = document.querySelector(".tasks-block__first-list");
const completedListContainer = document.querySelector(
  ".tasks-block__list_completed"
);
const tasksSum = document.querySelector(".main-header__title span");
const taskSectionTitle = document.querySelector(".tasks-block__title");

// Itialization
const objOfTasks = JSON.parse(localStorage.getItem("second-list")) || {};
let changedTask; // задача, которая подвергается изменениям
renderAllTasks(objOfTasks);
setTasksSum();

// Events
addTaskBtn.addEventListener("click", showForm); // показ формы
form.addEventListener("submit", onSubmitHandler); // добавление задачи
listContainer.addEventListener("click", chooseOption); // кнопка с 3 точками
completedListContainer.addEventListener("click", chooseOption); // кнопка с 3 точками в другой секции
listContainer.addEventListener("click", changeStatus); // нажатие на кнопку со статусом

// Handlers
function showForm() {
  formSection.classList.remove("form-section_hidden");
  formSection.querySelector("input").focus();
  formSection
    .querySelector(".create-task-btn")
    .classList.remove("create-task-btn_hidden");
  formSection
    .querySelector(".change-task-btn")
    .classList.add("change-task-btn_hidden");
}
function onSubmitHandler(e) {
  e.preventDefault();
  const bodyValue = inputBody.value;
  const status = select.value;

  if (!bodyValue || !status) {
    alert("Форма пустая");
    return;
  }
  if (e.target.children[3].classList.contains("change-task-btn_hidden")) {
    const task = createNewObjTask(bodyValue, status);
    const li = renderOneLi(task);
    listContainer.insertAdjacentHTML("beforeend", li);
    setTasksSum();
    listContainer.parentElement.classList.remove("tasks-block_hidden");
  } else {
    objOfTasks[changedTask.dataset.taskId].body = bodyValue;
    objOfTasks[changedTask.dataset.taskId].status = status;
    localStorage.setItem("second-list", JSON.stringify(objOfTasks));
    changedTask.querySelector("p").textContent = bodyValue;
    const icon = changedTask.querySelector("img");
    icon.src = `images/Ellipse-${setStatusImg(status)}.png`;
    icon.nextSibling.textContent = status;
  }
  form.reset();
  formSection.classList.add("form-section_hidden");
}
function chooseOption({ target }) {
  if (target.classList.contains("tasks-list__btn-edit")) {
    if (window.getComputedStyle(target.nextElementSibling).display == "none") {
      target.nextElementSibling.style.display = "block";
      const links = Array.from(target.nextElementSibling.children);
      links.forEach((a) => {
        if (a.dataset.type == "delete") {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            deleteTask(target);
          });
        } else {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            changeTask(target);
          });
        }
      });
    } else {
      target.nextElementSibling.style.display = "none";
    }
  }
}
function changeStatus({ target }) {
  if (target.classList.contains("tasks-list__btn-main")) {
    const task = target.closest(".tasks-list");
    const id = task.dataset.taskId;
    switch (target.classList[1]) {
      case "tasks-list__btn-main_pending":
        target.classList.remove("tasks-list__btn-main_pending");
        target.classList.add("tasks-list__btn-main_inprogress");
        target.textContent = "В процессе";
        objOfTasks[id].completed = "inprogress";
        localStorage.setItem("second-list", JSON.stringify(objOfTasks));
        break;
      case "tasks-list__btn-main_inprogress":
        target.classList.remove("tasks-list__btn-main_inprogress");
        target.classList.add("tasks-list__btn-main_done");
        target.textContent = "Выполнено";
        objOfTasks[id].completed = "done";
        localStorage.setItem("second-list", JSON.stringify(objOfTasks));
        completeTask(task);
        break;
    }
  }
}

// Functions
function renderAllTasks(tasksList) {
  if (
    !Object.values(tasksList).some((task) => task.completed !== "done") ||
    Object.keys(tasksList).length == 0
  ) {
    listContainer.parentElement.classList.add("tasks-block_hidden");
  }

  Object.values(tasksList).forEach((task) => {
    const li = renderOneLi(task);
    if (task.completed == "done") {
      completedListContainer.parentElement.classList.remove(
        "tasks-block_hidden"
      );
      completedListContainer.insertAdjacentHTML("beforeend", li);
    } else {
      listContainer.insertAdjacentHTML("beforeend", li);
    }
  });
}
function createNewObjTask(body, status) {
  const newTask = {
    body,
    status,
    completed: "pending",
    date: `${Date.now()}`,
    _id: `task${Date.now()}`,
  };
  objOfTasks[newTask._id] = newTask;
  localStorage.setItem("second-list", JSON.stringify(objOfTasks));
  return { ...newTask };
}
function renderOneLi({ body, status, date, _id, completed }) {
  let oneLiHTML = `
    <li class="tasks-list" data-task-id="${_id}">
              <div class="tasks-list__elem">
                <p class="tasks-list__text">
                  ${body}
                </p>
                <button class="tasks-list__btn-main tasks-list__btn-main_${completed}">
                  ${setBtnText(completed)}
                </button>
                <span class="tasks-list__status">
                <img src="images/Ellipse-${setStatusImg(
                  status
                )}.png" alt="иконка" />
                ${status}
                </span>
                <span class="tasks-list__time">${calcDuration(date)} дней</span>
                <div class="tasks-list__dropdown">
                  <img
                    src="images/edit-btn-icon.svg"
                    alt="Кнопка редактирования"
                    class="tasks-list__btn-edit"
                  />
                  <div id="myDropdown" class="dropdown-content">
                    <a href="#" data-type="delete">Удалить</a>
                    <a href="#" data-type="change">Изменить</a>
                  </div>
                </div>
              </div>
              <hr />
      </li>
  `;
  return oneLiHTML;
}
function calcDuration(date) {
  let currentDate = Date.now();
  // let lastDate = Date.parse(new Date(2023, 3, 1, 0, 0, 0, 0));
  let days = (currentDate - +date) / 86400000;
  return Math.floor(days);
}
function setStatusImg(status) {
  switch (status) {
    case "Низкий":
      return "green";
      break;
    case "Нормальный":
      return "yellow";
      break;
    case "Критичный":
      return "red";
      break;
  }
}
function setBtnText(completed) {
  switch (completed) {
    case "inprogress":
      return "В процессе";
      break;
    case "done":
      return "Выполнено";
      break;
    default:
      return "Ожидание";
  }
}
function setTasksSum() {
  let amount = Object.keys(objOfTasks).length;
  tasksSum.textContent = `${amount} задач${chooseEnd()}`;
  function chooseEnd() {
    switch (amount) {
      case 1:
        return "а";
        break;
      case 2:
      case 3:
      case 4:
        return "и";
        break;
      default:
        return "";
    }
  }
}
function deleteTask(target) {
  const task = target.closest("[data-task-id]");
  const id = task.dataset.taskId;
  const confirmed = deleteObjTask(id);
  if (confirmed) {
    task.remove();
    setTasksSum();
  }
  if (!Object.values(objOfTasks).some((task) => task.completed == "done")) {
    completedListContainer.parentElement.classList.add("tasks-block_hidden");
  }
}
function deleteObjTask(id) {
  const isConfirm = confirm("Вы точно хотите удалить эту задачу?");
  if (!isConfirm) return;
  delete objOfTasks[id];
  localStorage.setItem("second-list", JSON.stringify(objOfTasks));
  return isConfirm;
}
function completeTask(task) {
  if (
    completedListContainer.parentElement.classList.contains(
      "tasks-block_hidden"
    )
  ) {
    completedListContainer.parentElement.classList.remove("tasks-block_hidden");
  }
  task.querySelector("a[data-type='change']").remove();
  completedListContainer.insertAdjacentElement("beforeend", task);
  if (listContainer.children.length == 0) {
    listContainer.parentElement.classList.add("tasks-block_hidden");
  }
}
function changeTask(target) {
  const task = target.closest(".tasks-list");
  const id = task.dataset.taskId;
  task.querySelector(".dropdown-content").style.display = "none";
  formSection.classList.remove("form-section_hidden");
  formSection
    .querySelector(".create-task-btn")
    .classList.add("create-task-btn_hidden");
  formSection
    .querySelector(".change-task-btn")
    .classList.remove("change-task-btn_hidden");
  formSection.querySelector("input").value = objOfTasks[id].body;
  formSection.querySelector("select").value = objOfTasks[id].status;
  changedTask = task;
}
