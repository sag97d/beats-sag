console.log("welcome back Js");
let currentSong = new Audio();
let songs;
let currFolder;

// javascript program to convert seconds tominute:seconds
function secondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {

    currFolder = folder;
    // let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let a = await fetch(`/songs/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }



    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName('ul')[0]
    songUL.innerHTML = "";
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + `<li>
                             <img class="invert" src="img/music.svg" alt="music">
                             <div class="info">
                                 <div>${song.replaceAll("%20", " ")}</div>
                                 <div>Unknown</div>
                             </div>
                             <div class="playnow">
                                 <span>Play now</span>
                                 <img src="img/play.svg" alt="play">
                             </div>
                         </li>`;


    }


    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName('li')).forEach(e => {

        e.addEventListener("click", element => {

            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());


        })
    })

    return songs;

}


// Play track music function
const playMusic = (track, pause = false) => {

    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {

        currentSong.play()
        play.src = "img/pause.svg";

    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    // http://127.0.0.1:5500/songs/

    console.log("displaying albums")
    let a = await fetch(`/songs/`)

    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")


    let cardContainer = document.querySelector(".cards-container")
    let array = Array.from(anchors)


    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {

            let folder = e.href.split("/").slice(-2)[1]


            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="cards">
                        <div  class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="play-button" width="55"
                                height="55">
                                <path fill="#10ff9e"
                                    d="M16,1A15,15,0,1,0,31,16,15,15,0,0,0,16,1Zm6.13,17.6L14.54,23a2.95,2.95,0,0,1-3,0,3,3,0,0,1-1.5-2.6V11.62A3,3,0,0,1,14.54,9l7.59,4.38a3,3,0,0,1,0,5.2Z">
                                </path>
                            </svg>

                        </div>

                        <img src="/songs/${folder}/cover.jpg" alt="cover photo">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>


                    </div>`
        }
    }

    // Load the playlist whenever clicked
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener("click", async item => {

            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);


        })
    })


}




async function main() {

    // get the songs array
    await getSongs("songs/party");

    playMusic(songs[0], true);

    // Display all the albums in the folder as a cards dynamically
    displayAlbums()





    // Attach an event listener to previous play next

    // 1. Play btn
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector('.songtime').innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)} / ${secondsToMinutesAndSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // Add an event listener to the seekbar
    document.querySelector('.seekbar').addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })


    // Add an event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-125%";
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })


    // Add an event listener to next
    next.addEventListener("click", () => {
        // console.log(currentSong.src)
        // console.log(currentSong.src.split('/'))
        // console.log(currentSong.src.split('/').slice(-1))
        // console.log(currentSong.src.split('/').slice(-1)[0])

        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    // Add an event listener to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to: " + e.target, e.target.value + "/100")
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume>0)
        {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }

    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .70;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 70;
        }

    })






}

main();