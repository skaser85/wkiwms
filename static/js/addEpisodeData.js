const SERVER_ADDR_BASE = `http://${window.location.hostname}:${window.location.port}`;

const docGetNextEpNo = document.querySelector("#get-next-episode-number");
const docEpisodeNo = document.querySelector("#episode-number");
const docRecordDate = document.querySelector("#record-date");

const docSubmitPastGuest = document.querySelector("#submit-past-guest");
const docSubmitNewGuest = document.querySelector("#submit-new-guest");
const docGuestSelect = document.querySelector("#guest-select");
const docGuestInput = document.querySelector("#guest-input");
const docGuestsBody = document.querySelector("#guests-body");

const docAddQuestion = document.querySelector("#add-question");
const docQuestionText = document.querySelector("#question-text");
const docQuestionCat = document.querySelector("#category-select");
const docContributor = document.querySelector("#contributor-name");
const docLocation = document.querySelector("#location-text");
const docQuestionsBody = document.querySelector("#questions-body");
const docGetAllQuestions = document.querySelector("#get-all-questions");

const docModal = document.querySelector("#modal");
const docModalTitle = document.querySelector("#modal-title")
const docModalContent = document.querySelector("#modal-content")
const docModalLeftBtn = document.querySelector("#left-button");
const docModalRightBtn = document.querySelector("#right-button");

const docQuestionsSelect = document.querySelector("#question-select");
const docAnswersBody = document.querySelector("#answers-body");
const docAnswerText = document.querySelector("#answer-text");
const docAnswerTypes = document.querySelector("#type-select");
const docAnswerGuest = document.querySelector("#guest-select-on-episode");
const docAnswerLink = document.querySelector("#link");
const docAnswerFunFact = document.querySelector("#fun-fact");
const docAddAnswerBtn = document.querySelector("#add-answer");
const docGetAnswersBtn = document.querySelector("#get-all-answers");

const docDeleteGuests = document.querySelector("#delete-guests");
const docDeleteQuestions = document.querySelector("#delete-all-questions");
const docDeleteAnswers = document.querySelector("#delete-all-answers");

docDeleteGuests.addEventListener("click", async e => {
  setupModal('Delete guests', 'Are you sure you want to delete all guests from the episode?', 'Confirm', deleteAllGuests, 'Cancel', closeActiveModal);
  openModal(docModal);
});

docDeleteQuestions.addEventListener("click", async e => {
  setupModal('Delete questions', 'Are you sure you want to delete all questions from the episode?', 'Confirm', deleteAllQuestions, 'Cancel', closeActiveModal);
  openModal(docModal);
});

docDeleteAnswers.addEventListener("click", async e => {
  setupModal('Delete answers', 'Are you sure you want to delete all answers for the question?', 'Confirm', deleteAllAnswers, 'Cancel', closeActiveModal);
  openModal(docModal);
});

docGetAnswersBtn.addEventListener("click", async e => {
  if (!getSelectedOption(docQuestionsSelect))
    return;
  let questionSelect = getSelectedOption(docQuestionsSelect);
  let questionID = questionSelect.dataset.id;
  const answersDB = await fetch(`${SERVER_ADDR_BASE}/get-answers-for-question?questionid=${questionID}`);
  const answers = await answersDB.json();
  buildAnswerRows(answers.answers);
});

docGetAllQuestions.addEventListener("click", async e => {
  const questionsDB = await fetch(`${SERVER_ADDR_BASE}/get-questions-for-episode?episodeid=${docEpisodeNo.value}`);
  const questions = await questionsDB.json();
  const guestsDB = await fetch(`${SERVER_ADDR_BASE}/get-guests-for-episode?episodeid=${docEpisodeNo.value}`);
  const guests = await guestsDB.json();
  buildGuestOnEpisodeForAnswer(guests.guests);
  buildQuestionSelectForAnswer(questions.questions);
  buildQuestionRows(questions.questions);
});

docAddQuestion.addEventListener("click", async e => {
  const questions = await addQuestionToEpisode(docQuestionText.value, docQuestionCat.options[docQuestionCat.selectedIndex].dataset.id, docContributor.value, docLocation.value);
  const guestsDB = await fetch(`${SERVER_ADDR_BASE}/get-guests-for-episode?episodeid=${docEpisodeNo.value}`);
  const guests = await guestsDB.json();
  buildGuestOnEpisodeForAnswer(guests.guests);
  buildQuestionSelectForAnswer(questions.questions);
  buildQuestionRows(questions.questions);
});

docAddAnswerBtn.addEventListener("click", async e => {
  console.log(getSelectedOption(docQuestionsSelect));
  if (!getSelectedOption(docQuestionsSelect))
    return;
  let selectedType = getSelectedOption(docAnswerTypes);
  let typeID = selectedType.hasAttribute("data-id") ? selectedType.dataset.id : "";
  let selectedGuest = getSelectedOption(docAnswerGuest);
  console.log(selectedGuest);
  let guestID = selectedGuest.hasAttribute("data-id") ? selectedGuest.dataset.id : "";
  console.log("guest id = ", guestID);
  const answers = await addAnswerToQuestion(docAnswerText.value, typeID, guestID, docAnswerLink.value, docAnswerFunFact.value);
  buildAnswerRows(answers.answers);
});

docSubmitNewGuest.addEventListener("click", async e => {
    const guest = docGuestInput.value;
    const guestData = await insertGuest(guest);
    const guests = await addGuestToEpisode(guestData);
    buildGuestRows(guests);
    docGuestInput.value = '';
});

docSubmitPastGuest.addEventListener("click", async e => {
    const guest = docGuestSelect.options[docGuestSelect.selectedIndex].value;
    const guestData = await getGuest(guest);
    const guests = await addGuestToEpisode(guestData);
    buildGuestRows(guests);
    docGuestSelect.selectedIndex = 0;
});

docGetNextEpNo.addEventListener("click", async e => {
    const episodeNoData = await fetch(`${SERVER_ADDR_BASE}/get-next-episode-number`);
    const episodeNo = await episodeNoData.json();

    docEpisodeNo.value = episodeNo.next_episode_no;
});

docRecordDate.addEventListener("change", async e => {
    await fetch(`${SERVER_ADDR_BASE}/add-record-date?date=${docRecordDate.value}&episodeid=${docEpisodeNo.value}`);
});

document.addEventListener('DOMContentLoaded', () => {
  (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
    const $notification = $delete.parentNode;

    $delete.addEventListener('click', () => {
      // $notification.parentNode.removeChild($notification);
      $notification.classList.add("is-hidden");
    });
  });  
  
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Add a click event on each of them
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

    });
  });
});

const addGuestToEpisode = async (guestData) => {
  const guestsData = await fetch(`${SERVER_ADDR_BASE}/add-guest-to-episode?guestid=${guestData.guest.id}&episodeid=${docEpisodeNo.value}`);
  return await guestsData.json();
}

const deleteGuestFromEpisode = async (guestID) => {
  await fetch(`${SERVER_ADDR_BASE}/delete-guest-from-episode?guestid=${guestID}&episodeid=${docEpisodeNo.value}`);
}

const deleteQuestionFromEpisode = async (questionID) => {
  await fetch(`${SERVER_ADDR_BASE}/delete-question-from-episode?questionid=${questionID}&episodeid=${docEpisodeNo.value}`);
}

const insertGuest = async (guestName) => {
  const insertGuest = await fetch(`${SERVER_ADDR_BASE}/insert-guest?guest=${guestName}`);
  const data = await insertGuest.json();
  return data;
}

const getGuest = async (guestName) => {
  const guestDB = await fetch(`${SERVER_ADDR_BASE}/get-guest?guest=${guestName}`)
  const data = await guestDB.json();
  return data;
}

const addQuestionToEpisode = async (question, categoryID, contributor, location) => {
  const questionDB = await fetch(`${SERVER_ADDR_BASE}/add-question-to-episode?episodeid=${docEpisodeNo.value}&question=${question}&categoryid=${categoryID}&contributor=${contributor}&location=${location}`);
  const data = await questionDB.json();
  return data;
}

const addAnswerToQuestion = async (text, typeID, guestID, link, funFact) => {
  console.log(`question id = ${getSelectedOption(docQuestionsSelect).dataset.id}`);
  const answerDB = await fetch(`${SERVER_ADDR_BASE}/add-answer-to-question?questionid=${getSelectedOption(docQuestionsSelect).dataset.id}&answer=${text}&typeid=${typeID}&guestid=${guestID}&link=${link}&funfact=${funFact}`)
  const data = await answerDB.json();
  return data;
}

const buildQuestionRows = (questions) => {
  docQuestionsBody.innerHTML = "";
  for (let question of questions) {
    let questionHTMl = `
      <td>
        <span class="icon trash" data-guest="${question.id}">
          <i class="fas fa-trash"></i>
        </span>
      </td>
      <td>${question.number}</td>
      <td>${question.question}</td>
      <td>${question.category}</td>
      <td>${question.contributor}</td>
      <td>${question.location}</td>
    `;
    let q = document.createElement('tr');
    q.innerHTML = questionHTMl;
    let trash = q.querySelector(".trash");
    trash.addEventListener("click", async e => {
      let row = trash.parentElement.parentElement;
      let questionID = row.children[1].innerText;
      await deleteQuestionFromEpisode(questionID);
      row.remove();
    });
    docQuestionsBody.appendChild(q);
  }
}

const buildGuestRows = (guests) => {
  docGuestsBody.innerHTML = "";
  for (let guest of guests.guestsOnEpisode) {
    guestHTML = `
      <td>
        <span class="icon trash" data-guest="${guest.id}">
          <i class="fas fa-trash"></i>
        </span>
      </td>
      <td>${guest.id}</td>
      <td>${guest.name}</td>
    `;
    let g = document.createElement('tr');
    g.innerHTML = guestHTML;
    let trash = g.querySelector(".trash");
    trash.addEventListener("click", async e => {
      let row = trash.parentElement.parentElement;
      let guestID = row.children[1].innerText;
      await deleteGuestFromEpisode(guestID);
      row.remove();
    });
    docGuestsBody.appendChild(g);
  }
}

const buildAnswerRows = (answers) => {
  console.log(answers);
  docAnswersBody.innerHTML = "";
  for (let answer of answers) {
    let answerHTML = `
      <tr>
      <td>
        <span class="icon trash" data-id="${answer.id}">
          <i class="fas fa-trash"></i>
        </span>
      </td>
      <td>${answer.id}</td>
      <td contenteditable="true">${answer.answer}</td>
      <td>
        <div class="control">
          <div class="select">
            <select class="type-select">
            ${addTypeOptions(answer.type)}
            </select>
          </div>
        </div>
      </td>
      <td>
        <div class="control">
          <div class="select">
            <select class="guest-select">
            ${addGuestsOnEpisode(answer.guest)}
            </select>
          </div>
        </div>
      </td>
      <td contenteditable="true">${answer.link}</td>
      <td contenteditable="true">${answer.fun_fact}</td>
    </tr>
    `;
    let a = document.createElement('tr');
    a.innerHTML = answerHTML;
    let trash = a.querySelector(".trash");
    trash.addEventListener("click", async e => {
      let row = trash.parentElement.parentElement;
      let answerID = row.children[1].innerText;
      await deleteAnswerFromQuestion(answerID);
      row.remove();
    });
    let types = a.querySelector(".type-select");
    let guests = a.querySelector(".guest-select");
    setSelected(types, answer.type);
    setSelected(guests, answer.guest);
    docAnswersBody.appendChild(a);
  }
}

const setSelected = (select, selectedText) => {
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value === selectedText) {
      select.selectedIndex = i;
    }
  }
}

const addTypeOptions = () => {
  let typeOptions = "";
  for (let type of docAnswerTypes.options) {
    typeOptions += `<option ${type.hasAttribute("data-id") ? `data-id="${type.dataset.id}"` : ""}>${type.value}</option>`;
  }
  return typeOptions;
}

const addGuestsOnEpisode = () => {
  let guestOptions = "<option></option>";
  for (let guestRow of docGuestsBody.querySelectorAll('tr')) {
    let guestTDs = guestRow.querySelectorAll('td');
    let id = guestTDs[0].querySelector('span').dataset.guest;
    let name = guestTDs[2].innerText;
    guestOptions += `<option data-id="${id}">${name}</option>`
  }
  return guestOptions;
}

const setupModal = (title, content, leftBtnText, leftBtnAction, rightBtnText, rightBtnAction) => {
  docModalTitle.innerText = title;
  docModalContent.innerText = content;
  docModalLeftBtn.innerText = leftBtnText;
  docModalRightBtn.innerText = rightBtnText;
  docModalLeftBtn.addEventListener("click", leftBtnAction);
  docModalRightBtn.addEventListener("click", rightBtnAction);
}

const openModal = ($el) => {
  $el.classList.add('is-active');
}

const closeModal = ($el) => {
  $el.classList.remove('is-active');
}

const closeActiveModal = () => {
  closeModal(docModal);
}

const closeAllModals = () => {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
    closeModal($modal);
  });
}

(document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
  const $target = $close.closest('.modal');

  $close.addEventListener('click', () => {
    closeModal($target);
  });
});

// Add a keyboard event to close all modals
document.addEventListener('keydown', (event) => {
  const e = event || window.event;

  if (e.key === "Escape") { // Escape key
    closeAllModals();
  }
});

const deleteAnswerFromQuestion = async (answerID) => {
  if (!getSelectedOption(docQuestionsSelect))
    return;
  let questionSelect = getSelectedOption(docQuestionsSelect);
  let questionID = questionSelect.dataset.id;
  const answersDB = await fetch(`${SERVER_ADDR_BASE}/delete-answer-from-question?answerid=${answerID}&questionid=${questionID}`);
  const answers = await answersDB.json();
  buildAnswerRows(answers.answers);
}

const deleteAllGuests = async () => {
  const delGuests = await fetch(`${SERVER_ADDR_BASE}/delete-guests-on-episode?episodeid=${docEpisodeNo.value}`);
  const guests = await delGuests.json();
  buildGuestRows(guests);
}

const deleteAllQuestions = async () => {
  const delQuestions = await fetch(`${SERVER_ADDR_BASE}/delete-questions-from-episode?episodeid=${docEpisodeNo.value}`);
  const questions = await delQuestions.json();
  buildQuestionRows(questions.questions);
}

const deleteAllAnswers = async () => {
  const delAnswers = await fetch(`${SERVER_ADDR_BASE}/delete-answers-for-question?questionid=${getSelectedOption(docQuestionsSelect).value}`);
  const answers = await delAnswers.json();
  buildAnswerRows(answers.answers);
}

const getSelectedOption = (select) => {
  return select.options[select.selectedIndex];
}

const buildQuestionSelectForAnswer = (questions) => {
  docQuestionsSelect.innerHTML = "";
  let questionHTML = "<option></option>";
  for (let question of questions) {
    questionHTML += `<option data-id=${question.number}>${question.question}</option>`;
  }
  docQuestionsSelect.innerHTML = questionHTML;
}

const buildGuestOnEpisodeForAnswer = (guests) => {
  docAnswerGuest.innerHTML = "";
  let guestHTML = "<option></option>";
  for (let guest of guests) {
    guestHTML += `<option data-id=${guest.id}>${guest.name}</option>`;
  }
  docAnswerGuest.innerHTML = guestHTML;
}