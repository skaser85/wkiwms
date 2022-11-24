const SERVER_ADDR_BASE = `https://${window.location.hostname}:${window.location.port}`;

const docGetNextEpNo = document.querySelector("#get-next-episode-number");
const docEpisodeNo = document.querySelector("#episode-number");
const docRecordDate = document.querySelector("#record-date");
const docSubmitPastGuest = document.querySelector("#submit-past-guest");
const docSubmitNewGuest = document.querySelector("#submit-new-guest");
const docGuestSelect = document.querySelector("#guest-select");
const docGuestInput = document.querySelector("#guest-input");
const docGuestsBody = document.querySelector("#guests-body");

const docDeleteGuests = document.querySelector("#delete-guests");

docDeleteGuests.addEventListener("click", async e => {
  const delGuests = fetch(`${SERVER_ADDR_BASE}/delete-guests-on-episode?episodeid=${docEpisodeNo.value}`);
});

docSubmitNewGuest.addEventListener("click", async e => {
    const guest = docGuestInput.value;
    const guestData = await insertGuest(guest);
    const guests = await addGuestToEpisode(guestData);
    buildGuestRows(guests);
});

docSubmitPastGuest.addEventListener("click", async e => {
    const guest = docGuestSelect.options[docGuestSelect.selectedIndex].value;
    const guestData = await getGuest(guest);
    const guests = await addGuestToEpisode(guestData);
    buildGuestRows(guests);
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
  await fetch(`${SERVER_ADDR_BASE}/delete-guest-from-episode?guestid=?${guestID}&episodeid=${docEpisodeNo.value}`);
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