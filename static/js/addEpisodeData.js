const SERVER_ADDR_BASE = `http://${window.location.hostname}:${window.location.port}`;

const docGetNextEpNo = document.querySelector("#get-next-episode-number");
const docEpisodeNo = document.querySelector("#episode-number");
const docRecordDate = document.querySelector("#record-date");

docGetNextEpNo.addEventListener("click", async e => {
    const episodeNoData = await fetch(`${SERVER_ADDR_BASE}/get-next-episode-number`);
    const episodeNo = await episodeNoData.json();

    docEpisodeNo.value = episodeNo.next_episode_no + 1;
});

docRecordDate.addEventListener("change", e => {
    console.log(docRecordDate.value);
})