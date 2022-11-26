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

const docModal = document.querySelector("#modal");
const docModalTitle = document.querySelector("#modal-title")
const docModalContent = document.querySelector("#modal-content")
const docModalLeftBtn = document.querySelector("#left-button");
const docModalRightBtn = document.querySelector("#right-button");

const docAnswersBody = document.querySelector("#answers-body");
const docAnswerText = document.querySelector("#answer-text");
const docAnswerTypes = document.querySelector("#type-select");
const docAnswerGuest = document.querySelector("#guest-select");
const docAnswerLink = document.querySelector("#link");
const docAnswerFunFact = document.querySelector("#fun-fact");

const docDeleteGuests = document.querySelector("#delete-guests");
const docDeleteQuestions = document.querySelector("#delete-all-questions");

docDeleteGuests.addEventListener("click", async e => {
  setupModal('Delete guests', 'Are you sure you want to delete all guests from the episode?', 'Confirm', deleteAllGuests, 'Cancel', closeActiveModal);
  openModal(docModal);
});

docDeleteQuestions.addEventListener("click", async e => {
  setupModal('Delete questions', 'Are you sure you want to delete all questions from the episode?', 'Confirm', deleteAllQuestions, 'Cancel', closeActiveModal);
  openModal(docModal);
});

docAddQuestion.addEventListener("click", async e => {
  const questions = await addQuestionToEpisode(docQuestionText.value, docQuestionCat.options[docQuestionCat.selectedIndex].dataset.id, docContributor.value, docLocation.value);
  buildQuestionRows(questions.questions);
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
  const data = questionDB.json();
  return data;
}

const buildQuestionRows = (questions) => {
  docQuestionsBody.innerHTML = "";
  for (let question of questions) {
    questionHTMl = `
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
  docAnswersBody.innerHTML = "";
  for (let answer of answers) {
    let answerHTML = `
      <tr>
      <td>
        <span class="icon trash" data-id="${answer.id}">
          <i class="fas fa-trash"></i>
        </span>
      </td>
      <td contenteditable="true"></td>
      <td>
        <div class="control">
          <div class="select">
            <select>
            ${addTypeOptions()}
            </select>
          </div>
        </div>
      </td>
      <td>
        <div class="control">
          <div class="select">
            <select>
            ${addGuestsOnEpisode()}
            </select>
          </div>
        </div>
      </td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
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