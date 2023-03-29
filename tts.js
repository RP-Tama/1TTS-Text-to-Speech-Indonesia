// const fullScreenButton=document.querySelector('#full-screen-button');
const inputText = document.querySelector('#input-text');
const inputRate = document.querySelector('#input-rate');
const inputPitch = document.querySelector('#input-pitch');
const inputVoice = document.querySelector('#input-voice');
const resetButton = document.querySelector('#reset-button');
const speakButton = document.querySelector('#speak-button');
const pauseButton = document.querySelector('#pause-button');
const resumeButton = document.querySelector('#resume-button');
const stopButton = document.querySelector('#stop-button');
const prevButton = document.querySelector('#prev-button');
const nextButton = document.querySelector('#next-button');
const readingText = document.querySelector('#reading-text');
const animation = document.querySelector('.animation-wrapper');
const inputTxt = document.querySelector('#input-fileTxt');
const txtButton = document.querySelector('#fileTxt-button');
const inputURL = document.querySelector('#input-url');
const fetchButton = document.querySelector('#fetch-button');
const fetchAnimation = document.querySelector('#fetch-animation');
const progressBar = document.querySelector('#progress-bar');
const a2hsButton = document.querySelector('#a2hs');
const lizen = document.querySelector('#lizen');
const playerContainer = document.querySelector('.player-container');
const eyes = document.querySelector('#eyes');
const playingDiv = document.querySelector('#playing-div');
const playingNav = document.querySelector('nav');
const scrollCTA = document.querySelector('#scroll-cta');
const appSection = document.querySelector('#app');
const refershVoices = document.querySelector('#refresh-voices');
const cardCTAs = document.querySelectorAll('.card-cta');



//Setting Variables
let voices = [];
let date = new Date();
let stopAll = false;
let pause = false;
let prev = false;
let next = false;
// pauseButton.disabled=true;
// resumeButton.disabled=true;
prevButton.disabled = true;
nextButton.disabled = true;
pauseButton.style.display = 'none';
resumeButton.style.display = 'none';
animation.style.display = 'none';
playingDiv.style.display = 'none';
playingNav.style.display = 'none';
playerContainer.style.display = 'flex';

const synthObj = window.speechSynthesis;


//Execution Statements and Event Handlers
populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

scrollCTA.addEventListener('click', function () {
  appSection.scrollIntoView();
})

// https://stackoverflow.com/a/40956816
cardCTAs.forEach(function (elem) {
  elem.addEventListener("click", function () {
    appSection.scrollIntoView();
  });
});

txtButton.addEventListener('click', fetchFile);
fetchButton.addEventListener('click', fetchArticle);

resetButton.addEventListener('click', function () {
  inputText.value = "";
  inputText.focus();
});

refershVoices.addEventListener('click', function () { location.reload(); })

speakButton.addEventListener('click', function () {
  parseSentences();
  lizen.disabled = true;
  
  if (scrollCTA.offsetHeight > 0)
    readingText.scrollIntoView();
});

lizen.addEventListener('click', function () {
  parseSentences();
  lizen.disabled = true;
  playerContainer.style.display = 'block';
  eyes.style.display = 'none';
  playingDiv.style.display = 'block';
  playingNav.style.display = 'block';
  if (scrollCTA.offsetHeight > 0)
    readingText.scrollIntoView();
});

stopButton.addEventListener('click', stopAllFunction);

pauseButton.addEventListener('click', function () {
  pauseFunction();
});

prevButton.addEventListener('click', function () {
  speechSynthesis.cancel();
  prev = true;
});

nextButton.addEventListener('click', function () {
  speechSynthesis.cancel();
  next = true;
});

window.addEventListener('blur', function () {
  if (scrollCTA.offsetHeight > 0)
    pauseFunction();
});










//FUNCTIONS SECTION

//Fetches and Populates the Voices Array in Alphabetical Order
function populateVoices() {
  voices = synthObj.getVoices().sort(function (a, b) {
    if (a.name.toUpperCase() < b.name.toUpperCase())
      return -1;
    else if (a.name.toUpperCase() > b.name.toUpperCase())
      return 1;
    else
      return 0;
  });


  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement('option');
    option.textContent = `${voices[i].name} (${voices[i].lang})`;
    option.setAttribute('data-voice-name', voices[i].name);
    option.setAttribute('data-voice-lang', voices[i].lang);
    inputVoice.appendChild(option);
  }
}

async function fetchFile(){
  inputText.value = '';
  fetchAnimation.style.display = 'block';
  const file = inputTxt.files[0];
  const reader = new FileReader();
  if (file.type === 'text/plain') {
    reader.onload = function() {
      inputText.value = reader.result;
    }
    reader.readAsText(file);
    fetchAnimation.style.display = 'none';
  } 
  else {
    alert('File harus berformat .txt!');
  }
}

async function fetchArticle() {
  let result = '';
  inputText.value = '';
  fetchAnimation.style.display = 'block';
  website = 'https://extract-article.deta.dev/?url=' + inputURL.value;
  console.log(website);

  console.log(`Fetching from ${website}`);
  await fetch(website).then(function (response) {
    // The API call was successful!
    return response.text();
  }).then(function (responseJSON) {
    articleRaw = JSON.parse(responseJSON)
    // Convert the HTML string into a document object
    const parser = new DOMParser();
    let doc = parser.parseFromString(articleRaw.data.content, 'text/html');
    // Get the article content tags
    let array = doc.querySelectorAll('h1, h2, h3, h4, h5, p, li');
    for (element of array) {
      console.log(element.textContent);
      result += element.textContent + `.
        `;
    }
  }).catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });
  // console.log(result);

  inputText.value = result;
  // inputText.scrollIntoView(); 
  fetchAnimation.style.display = 'none';
}

async function parseSentences() {
  const selectedVoice = inputVoice.selectedOptions[0].getAttribute('data-voice-name');

  if (selectedVoice === '') {
    alert("Please select Voice from the list");
    pauseButton.style.display = 'none';
    speakButton.style.display = 'inline';
    return;
  }

  if (inputText.value === '') {
    alert("Text Box is empty! Add some content or fetch from a URL.");
    return;
  }


  // Function Analytics
  speakButton.style.display = 'none';
  pauseButton.style.display = 'inline';
  animation.style.display = 'flex';

  prevButton.disabled = false;
  nextButton.disabled = false;

  let sentences = inputText.value.split(/[.|!|?]+/g);

  console.log("Finished parsing sentences!")
  for (let i = 0; i < sentences.length; i++) {

    if (pause === true) {
      await pausedResume();
      resumeButton.style.display = 'none';
      pauseButton.style.display = 'inline';
      animation.style.display = 'flex';
      i--;
      pause = false;
    }

    if (prev === true) {
      i = i - 2;
      prev = false;
    }

    if (stopAll === true) {
      stopAll = false;
      break;
    }
    console.log(`Sentence ${i + 1} sent for reading...`);
    progressBar.style.width = `${(i / (sentences.length - 1)) * 100}%`;
    await showReadingText(sentences[i]);
  }


  console.log('Flushing Buttons');
  prevButton.disabled = true;
  nextButton.disabled = true;
  speakButton.style.display = 'inline';
  pauseButton.style.display = 'none';
  resumeButton.style.display = 'none';
  readingText.textContent = '👀';
  animation.style.display = 'none';
  lizen.disabled = false;
}

//Displays Reading text and calls speaker
//Waits until speaking is over
//Returns promise after completion
async function showReadingText(textPart) {
  // let screenLock = new NoSleep();
  // screenLock.enable();
  // console.log('Screen Locked!');
  readingText.textContent = textPart;
  // inputVoice.scrollIntoView();
  await speaker(textPart);
  // screenLock.disable();
  // console.log('Screen Unlocked.');
  return new Promise(resolve => { resolve(); });
}

//TTS Speaking function
//Returns promise after completing or cancelling TTS speak
function speaker(textPart) {
  const speakObj = new SpeechSynthesisUtterance(textPart);
  const selectedVoice = inputVoice.selectedOptions[0].getAttribute('data-voice-name');

  for (let i = 0; i < voices.length; i++) {
    if (selectedVoice === voices[i].name)
      speakObj.voice = voices[i];
  }
  //For blank and undefined text inputs
  if (textPart === '' || textPart === undefined)
    return new Promise(resolve => { resolve(); });

  speakObj.rate = inputRate.value;
  speakObj.pitch - inputPitch.value;
  synthObj.speak(speakObj);
  console.log('Reading: ' + textPart);

  return new Promise(resolve => { speakObj.onend = resolve; });
}

//Called by Pause Button
//Stops TTS and sets variable values
function pauseFunction() {
  speechSynthesis.cancel();
  pause = true;
}

//Called by Stop Button
//Stops TTS and sets variable values
function stopAllFunction() {
  speakButton.style.display = 'inline';
  animation.style.display = 'none';
  speechSynthesis.cancel();
  readingText.textContent = '👀';
  progressBar.style.width = `${0}%`;
  lizen.disabled = false;

  stopAll = true;
}

//Called by Resume Button
//Resolves promises for pause wait
function pausedResume() {
  resumeButton.style.display = 'inline';
  pauseButton.style.display = 'none';
  animation.style.display = 'none';
  return new Promise(resolve => {
    resumeButton.onclick = resolve;
    stopButton.onclick = resolve;
    prevButton.onclick = resolve;
    nextButton.onclick = resolve;
  });
}
