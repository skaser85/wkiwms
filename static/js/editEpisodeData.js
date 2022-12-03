const SERVER_ADDR_BASE = `http://${window.location.hostname}:${window.location.port}`;

const docTabs = document.querySelectorAll(".tab");
const docTabsContainer = document.querySelector(".tabs");

const docGeneralTab = document.querySelector("#general-tab");
const docNotifGeneral = document.querySelector("#general-notif");
const docEpisodeNo = document.querySelector("#episode-number");
const docRecordDate = document.querySelector("#record-date");
const docRecordDateBtn = document.querySelector("#update-date-btn");

const docGuestsTab = document.querySelector("#guests-tab");
const docNotifGuests = document.querySelector("#guests-notif");
const docGuestSelect = document.querySelector("#guest-select");
const docGuestInput = document.querySelector("#guest-input");
const docGuestsBody = document.querySelector("#guests-body");
const docAddGuestBtn = document.querySelector("#add-guest");
const docDeleteGuests = document.querySelector("#delete-guests");
const docGuestTrashIcons = document.querySelectorAll(".guest-trash");

const docQuestionsTab = document.querySelector("#questions-tab");
const docNotifQuestions = document.querySelector("#questions-notif");
const docAddQuestion = document.querySelector("#add-question");
const docQuestionText = document.querySelector("#question-text");
const docQuestionCat = document.querySelector("#category-select");
const docContributor = document.querySelector("#contributor-name");
const docLocation = document.querySelector("#location-text");
const docQuestionsBody = document.querySelector("#questions-body");
const docGetAllQuestions = document.querySelector("#get-all-questions");
const docQuestionTrashIcons = document.querySelectorAll("#question-trash");
const docDeleteQuestions = document.querySelector("#delete-all-questions");
const docQuestionArrows = document.querySelectorAll(".question-arrow-to-answers");

const docAnswersTab = document.querySelector("#answers-tab");
const docNotifAnswers = document.querySelector("#answers-notif");
const docQuestionsSelect = document.querySelector("#question-select");
const docAnswersBody = document.querySelector("#answers-body");
const docAnswerText = document.querySelector("#answer-text");
const docAnswerTypes = document.querySelector("#type-select");
const docAnswerGuest = document.querySelector("#guest-select-on-episode");
const docAnswerLink = document.querySelector("#link");
const docAnswerFunFact = document.querySelector("#fun-fact");
const docAddAnswerBtn = document.querySelector("#add-answer");
const docGetAnswersBtn = document.querySelector("#get-all-answers");

let docActiveNotif = docNotifGeneral;

const docModal = document.querySelector("#modal");
const docModalTitle = document.querySelector("#modal-title")
const docModalContent = document.querySelector("#modal-content")
const docModalLeftBtn = document.querySelector("#left-button");
const docModalRightBtn = document.querySelector("#right-button");

docQuestionsSelect.addEventListener("change", async e => {
  if (!getSelectedOption(docQuestionsSelect))
    return;
  let questionSelect = getSelectedOption(docQuestionsSelect);
  let questionID = questionSelect.dataset.id;
  await populateAnswersTab(questionID);
});

const populateAnswersTab = async (questionID) => {
  const answersDB = await fetch(`${SERVER_ADDR_BASE}/get-answers-for-question?questionid=${questionID}`);
  const answers = await answersDB.json();
  buildAnswerRows(answers.answers);
}

docDeleteGuests.addEventListener("click", async e => {
  setupModal('Delete guests', 'Are you sure you want to delete all guests from the episode?', 'Confirm', deleteAllGuests, 'Cancel', closeActiveModal);
  openModal(docModal);
});

docRecordDateBtn.addEventListener("click", async e => {
    const response = await fetch(`${SERVER_ADDR_BASE}/add-record-date?date=${docRecordDate.value}&episodeid=${docEpisodeNo.value}`);
    if (!response.ok) {
        activateNotification(docActiveNotif, `There was an issue contacting the server. Status: ${response.status}. Message: ${response.statusText}`);
        return;
    }
});

docTabs.forEach(t => {
    t.addEventListener("click", e => {
        let active = document.querySelector(".tab.is-active");
        toggleTabContainer(active.querySelector("a").innerText);
        active.classList.remove("is-active");
        t.classList.toggle("is-active");
        toggleTabContainer(t.querySelector("a").innerText);
    });
});

docAddGuestBtn.addEventListener("click", async e => {
    if (getSelectedOption(docGuestSelect).value && docGuestInput.value) {
      activateNotification(docActiveNotif, "The dropdown and the text input cannot both contain a guest!");
      return;
    }
    let guestData;
    if (getSelectedOption(docGuestSelect).value) {
        guestData = await getGuest(getSelectedOption(docGuestSelect).value);
        docGuestSelect.selectedIndex = 0;
        docGuestInput.value = "";
    } else if (docGuestInput.value) {
        guestData = await insertGuest(docGuestInput.value);
        docGuestSelect.selectedIndex = 0;
        docGuestInput.value = "";
    } else {
        activateNotification(activateNotification(docActiveNotif, "Neither the dropdown nor the text input have a value!"));
        return
    }
    const guests = await addGuestToEpisode(guestData);
    buildGuestRows(guests);
});

const toggleTabContainer = (tabText) => {
    switch(tabText.toLowerCase()) {
        case "general": {
            docGeneralTab.classList.toggle("is-hidden");
            docActiveNotif = docNotifGeneral;
            break;
        }
        case "guests": {
            docGuestsTab.classList.toggle("is-hidden");
            docActiveNotif = docNotifGuests;
            break;
        }
        case "questions": {
            docQuestionsTab.classList.toggle("is-hidden");
            docActiveNotif = docNotifQuestions;
            break;
        }
        case "answers": {
            docAnswersTab.classList.toggle("is-hidden");
            docActiveNotif = docNotifAnswers;
            break;
        }
    }
}

const activateNotification = (notifEl, notifText) => {
    notifEl.querySelector("span").innerText = notifText;
    notifEl.classList.remove("is-hidden");
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

const addGuestToEpisode = async (guestData) => {
    const guestsData = await fetch(`${SERVER_ADDR_BASE}/add-guest-to-episode?guestid=${guestData.guest.id}&episodeid=${docEpisodeNo.value}`);
    return await guestsData.json();
}

const getSelectedOption = (select) => {
  return select.options[select.selectedIndex];
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

const deleteGuestFromEpisode = async (guestID) => {
    console.log(guestID);
    await fetch(`${SERVER_ADDR_BASE}/delete-guest-from-episode?guestid=${guestID}&episodeid=${docEpisodeNo.value}`);
}

const deleteAllGuests = async () => {
  const delGuests = await fetch(`${SERVER_ADDR_BASE}/delete-guests-on-episode?episodeid=${docEpisodeNo.value}`);
  const guests = await delGuests.json();
  buildGuestRows(guests);
}

const deleteQuestionFromEpisode = async (questionID) => {
  await fetch(`${SERVER_ADDR_BASE}/delete-question-from-episode?questionid=${questionID}&episodeid=${docEpisodeNo.value}`);
}

const deleteAllQuestions = async () => {
  const delQuestions = await fetch(`${SERVER_ADDR_BASE}/delete-questions-from-episode?episodeid=${docEpisodeNo.value}`);
  const questions = await delQuestions.json();
  buildQuestionRows(questions.questions);
}

const addQuestionToEpisode = async (question, categoryID, contributor, location) => {
  const questionDB = await fetch(`${SERVER_ADDR_BASE}/add-question-to-episode?episodeid=${docEpisodeNo.value}&question=${question}&categoryid=${categoryID}&contributor=${contributor}&location=${location}`);
  const data = await questionDB.json();
  return data;
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
      <td>
        <span class="icon question-arrow-to-answers" data-question="{{ question.number }}">
          <i class="fas fa-arrow-up-right-from-square"></i>
        </span>
      </td>
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
    let arrow = q.querySelector(".question-arrow-to-answers");
    arrow.addEventListener("click", async e => {
      let row = arrow.parentElement.parentElement;
      let questionID = row.children[1].innerText;
      await populateAnswersTab(questionID);
      
      toggleTabContainer('questions');
      active.classList.remove("is-active");
      docGuestsTab.classList.toggle("is-active");
      toggleTabContainer('guests');
    });
    docQuestionsBody.appendChild(q);
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

const setSelected = (select, selectedText) => {
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value === selectedText) {
      select.selectedIndex = i;
    }
  }
}

docQuestionTrashIcons.forEach(t => {
    t.addEventListener("click", async e => {
        let row = t.parentElement.parentElement;
        let questionID = row.children[1].innerText;
        await deleteQuestionFromEpisode(questionID);
        row.remove();
    });
})

docGuestTrashIcons.forEach(t => {
    t.addEventListener("click", async e => {
        console.log(t);
        let row = t.parentElement.parentElement;
        let guestID = row.children[1].innerText;
        await deleteGuestFromEpisode(guestID);
        row.remove();
    });
});

docQuestionArrows.forEach(arrow => {
  arrow.addEventListener("click", async e => {
    let row = arrow.parentElement.parentElement;
    let questionID = row.children[1].innerText;
    await populateAnswersTab(questionID);
    
    toggleTabContainer('questions');
    docQuestionsTab.classList.remove("is-active");
    docAnswersTab.classList.toggle("is-active");
    toggleTabContainer('answers');
  });
});

docGetAllQuestions.addEventListener("click", async e => {
  const questionsDB = await fetch(`${SERVER_ADDR_BASE}/get-questions-for-episode?episodeid=${docEpisodeNo.value}`);
  const questions = await questionsDB.json();
//   const guestsDB = await fetch(`${SERVER_ADDR_BASE}/get-guests-for-episode?episodeid=${docEpisodeNo.value}`);
//   const guests = await guestsDB.json();
//   buildGuestOnEpisodeForAnswer(guests.guests);
//   buildQuestionSelectForAnswer(questions.questions);
  buildQuestionRows(questions.questions);
});

docAddQuestion.addEventListener("click", async e => {
  const questions = await addQuestionToEpisode(docQuestionText.value, docQuestionCat.options[docQuestionCat.selectedIndex].dataset.id, docContributor.value, docLocation.value);
//   const guestsDB = await fetch(`${SERVER_ADDR_BASE}/get-guests-for-episode?episodeid=${docEpisodeNo.value}`);
//   const guests = await guestsDB.json();
//   buildGuestOnEpisodeForAnswer(guests.guests);
//   buildQuestionSelectForAnswer(questions.questions);
  buildQuestionRows(questions.questions);
});

docDeleteQuestions.addEventListener("click", async e => {
  setupModal('Delete questions', 'Are you sure you want to delete all questions from the episode?', 'Confirm', deleteAllQuestions, 'Cancel', closeActiveModal);
  openModal(docModal);
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
