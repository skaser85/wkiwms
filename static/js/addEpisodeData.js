const SERVER_ADDR_BASE = `http://${window.location.hostname}:${window.location.port}`;

const docGetNextEpNo = document.querySelector("#get-next-episode-number");
const docEpisodeNo = document.querySelector("#episode-number");
const docRecordDate = document.querySelector("#record-date");
const docSubmitPastGuest = document.querySelector("#submit-past-guest");
const docSubmitNewGuest = document.querySelector("#submit-new-guest");
const docGuestSelect = document.querySelector("#guest-select");
const docGuestInput = document.querySelector("#guest-input");

docSubmitNewGuest.addEventListener("click", async e => {
    const guest = docGuestInput.value;
    const guestData = await getGuestData(guest, true);
    console.log(guestData);
});

docSubmitPastGuest.addEventListener("click", async e => {
    const guest = docGuestSelect.options[docGuestSelect.selectedIndex].value;
    const guestData = await getGuestData(guest, false);
    console.log(guestData);
});

docGetNextEpNo.addEventListener("click", async e => {
    const episodeNoData = await fetch(`${SERVER_ADDR_BASE}/get-next-episode-number`);
    const episodeNo = await episodeNoData.json();

    docEpisodeNo.value = episodeNo.next_episode_no + 1;
});

docRecordDate.addEventListener("change", e => {
    console.log(docRecordDate.value);
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

  const getGuestData = async (guestName, needsInserted) => {
    if (needsInserted) {
        return await insertGuest(guestName);
    } else {
        return await getGuest(guestName);
    }
  }

  const addGuestToEpisode = async (guestData) => {

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