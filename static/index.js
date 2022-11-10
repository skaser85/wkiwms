const SERVER_ADDR_BASE = `http://${window.location.hostname}:${window.location.port}`;

const docEpisodesContainer = document.querySelector("#episodes-container");

document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
      const $notification = $delete.parentNode;
  
      $delete.addEventListener('click', () => {
        // $notification.parentNode.removeChild($notification);
        $notification.classList.add("is-hidden");
      });
    });
    
    fetch(`${SERVER_ADDR_BASE}/get-episodes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(async response => {
            const data = await response.json();
            console.log(data);
            // if (data.error) {
            //     activateNotification(docReceipeNotif, data.error);
            //     return;
            // }
            loadEpisodes(data.episodes);
        })
        .catch(error => console.log(error));
  });

const loadEpisodes = episodes => {
    if (episodes.length === 0)
        return;
    docEpisodesContainer.innerHTML = "";
    let episodesH4 = document.createElement("h4");
    episodesH4.innerText = "Episodes";
    episodesH4.classList.add("subtitle");
    docEpisodesContainer.appendChild(episodesH4);
    for (let episode of episodes) {
        let episode_html = `
            <div class="card">
                <header class="card-header">
                <p class="card-header-title">
                    Episode <span id="episode-number">${episode.number}</span>&nbsp;-&nbsp; <span id="date-recorded">${episode.record_date}</span>
                </p>
                <button class="card-header-icon episode-details-btn" aria-label="more options">
                    <span class="icon">
                    <i class="fas fa-angle-up" aria-hidden="true"></i>
                    </span>
                </button>
                </header>
                <div class="content episode-content is-hidden">
                    <p class="guests-title">Guests</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Name</th>
                            </tr>
                        </thead>
                        ${addGuests(episode.guests)}
                    </table>
                </div>
            </div>
        `;
        let episode_node = document.createElement('div');
        episode_node.innerHTML = episode_html;
        docEpisodesContainer.appendChild(episode_node);
    }
    const docEpisodeDetailsBtns = document.querySelectorAll('.episode-details-btn');
    
    docEpisodeDetailsBtns.forEach(edb => {
        edb.addEventListener("click", e => {
            let indicator = edb.querySelector("i");
            let episodeContent = edb.parentElement.parentElement.querySelector(".episode-content");
            if (indicator.classList.contains("fa-angle-down")) {
                // hide the card contents
                indicator.classList.remove("fa-angle-down");
                indicator.classList.add("fa-angle-up");
                episodeContent.classList.add("is-hidden");
            } else if (indicator.classList.contains("fa-angle-up")) {
                // show the card contents
                indicator.classList.remove("fa-angle-up");
                indicator.classList.add("fa-angle-down");
                episodeContent.classList.remove("is-hidden");
            }
        });
    });   
}

const addGuests = guests => {
    let tbody = `<tbody>`;
    for (let guest of guests) {
        tbody += `
            <tr>
                <td>${guest.id}</td>
                <td>${guest.name}</td>
            </tr>
        `;
    }
    tbody += `</tbody>`;
    return tbody
}