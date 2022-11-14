const SERVER_ADDR_BASE = `http://${window.location.hostname}:${window.location.port}`;

const docEpisodesContainer = document.querySelector("#episodes-container");
const docEpisodeDetailsBtns = document.querySelectorAll('.episode-details-btn');

docEpisodeDetailsBtns.forEach(edb => {
    edb.addEventListener("click", e => {
        let indicator = edb.querySelector("i");
        let episodeContent = edb.parentElement.parentElement.querySelector(".episode-content");
        if (indicator.classList.contains("fa-angle-down")) {
            // show the card contents
            indicator.classList.remove("fa-angle-down");
            indicator.classList.add("fa-angle-up");
            episodeContent.classList.remove("is-hidden");
        } else if (indicator.classList.contains("fa-angle-up")) {
            // hide the card contents
            indicator.classList.remove("fa-angle-up");
            indicator.classList.add("fa-angle-down");
            episodeContent.classList.add("is-hidden");
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
      const $notification = $delete.parentNode;
  
      $delete.addEventListener('click', () => {
        // $notification.parentNode.removeChild($notification);
        $notification.classList.add("is-hidden");
      });
    });
  });