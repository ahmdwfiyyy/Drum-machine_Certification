const HEATER = "https://cdn.freecodecamp.org/curriculum/drum/";
const PIANO = "https://s3.amazonaws.com/freecodecamp/drums/";

const banks = {
  heater: {
    label: "Heater Kit",
    sounds: {
      Q: { id: "heater-1", name: "Heater 1", file: HEATER + "Heater-1.mp3" },
      W: { id: "heater-2", name: "Heater 2", file: HEATER + "Heater-2.mp3" },
      E: { id: "heater-3", name: "Heater 3", file: HEATER + "Heater-3.mp3" },
      A: { id: "heater-4", name: "Heater 4", file: HEATER + "Heater-4_1.mp3" },
      S: { id: "clap", name: "Clap", file: HEATER + "Heater-6.mp3" },
      D: { id: "open-hh", name: "Open HH", file: HEATER + "Dsc_Oh.mp3" },
      Z: { id: "kick-n-hat", name: "Kick n' Hat", file: HEATER + "Kick_n_Hat.mp3" },
      X: { id: "kick", name: "Kick", file: HEATER + "RP4_KICK_1.mp3" },
      C: { id: "closed-hh", name: "Closed HH", file: HEATER + "Cev_H2.mp3" },
    },
  },
  piano: {
    label: "Smooth Piano Kit",
    sounds: {
      Q: { id: "chord-1", name: "Chord 1", file: PIANO + "Chord_1.mp3" },
      W: { id: "chord-2", name: "Chord 2", file: PIANO + "Chord_2.mp3" },
      E: { id: "chord-3", name: "Chord 3", file: PIANO + "Chord_3.mp3" },
      A: { id: "shaker", name: "Shaker", file: PIANO + "Give_us_a_light.mp3" },
      S: { id: "open-hh-piano", name: "Open HH (Dry)", file: PIANO + "Dry_Ohh.mp3" },
      D: { id: "closed-hh-piano", name: "Closed HH (Bld)", file: PIANO + "Bld_H1.mp3" },
      Z: { id: "punchy-kick", name: "Punchy Kick", file: PIANO + "punchy_kick_1.mp3" },
      X: { id: "side-stick", name: "Side Stick", file: PIANO + "side_stick_1.mp3" },
      C: { id: "snare", name: "Snare", file: PIANO + "Brk_Snr.mp3" },
    },
  },
};

const machine = document.getElementById("drum-machine");
const display = document.getElementById("display");
const led = document.querySelector(".led");
const powerBtn = document.getElementById("power");
const volumeInput = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const bankButtons = {
  heater: document.getElementById("bank-heater"),
  piano: document.getElementById("bank-piano"),
};

let powered = true;
let currentBank = "heater";
let volume = parseFloat(volumeInput.value);
let displayTimer;

/* Show a message briefly, then go back to the current bank name */
function flash(text) {
  display.innerText = text;
  clearTimeout(displayTimer);
  displayTimer = setTimeout(() => {
    if (powered) display.innerText = banks[currentBank].label;
  }, 1200);
}

/* ---------- Pads ---------- */
function trigger(key) {
  if (!powered) return;
  const audio = document.getElementById(key);
  if (!audio || !audio.classList.contains("clip")) return;

  audio.volume = volume;
  audio.currentTime = 0;
  const playing = audio.play();
  if (playing && playing.catch) playing.catch(() => {});

  // Show the sound name. Not passed through flash(): it stays until the next hit
  clearTimeout(displayTimer);
  display.innerText = banks[currentBank].sounds[key].name;

  const pad = audio.parentElement;
  pad.classList.add("active");
  led.classList.add("on");
  setTimeout(() => {
    pad.classList.remove("active");
    led.classList.remove("on");
  }, 120);
}

document.querySelectorAll(".drum-pad").forEach((pad) => {
  pad.addEventListener("click", () => trigger(pad.querySelector(".clip").id));
});

document.addEventListener("keydown", (e) => {
  if (e.target === volumeInput && e.key.startsWith("Arrow")) return;
  const key = (e.key || String.fromCharCode(e.keyCode || 0)).toUpperCase();
  if (banks[currentBank].sounds[key]) trigger(key);
});

/* ---------- Bank switch ---------- */
function setBank(name) {
  if (!powered || name === currentBank) return;
  currentBank = name;

  document.querySelectorAll(".clip").forEach((audio) => {
    const sound = banks[name].sounds[audio.id];
    audio.src = sound.file;
    audio.parentElement.id = sound.id; // pad id still describes its clip
  });

  for (const [key, btn] of Object.entries(bankButtons)) {
    const on = key === name;
    btn.classList.toggle("selected", on);
    btn.setAttribute("aria-pressed", on);
  }
  machine.dataset.bank = name;
  flash(banks[name].label);
}

bankButtons.heater.addEventListener("click", () => setBank("heater"));
bankButtons.piano.addEventListener("click", () => setBank("piano"));

/* ---------- Volume ---------- */
volumeInput.addEventListener("input", () => {
  volume = parseFloat(volumeInput.value);
  const pct = Math.round(volume * 100);
  volumeValue.textContent = pct;
  volumeInput.style.setProperty("--fill", pct + "%");
  document.querySelectorAll(".clip").forEach((a) => (a.volume = volume));
  if (powered) flash("Volume " + pct);
});
volumeInput.style.setProperty("--fill", Math.round(volume * 100) + "%");

/* ---------- Power ---------- */
powerBtn.addEventListener("click", () => {
  powered = !powered;
  powerBtn.classList.toggle("on", powered);
  powerBtn.setAttribute("aria-pressed", powered);
  machine.classList.toggle("off", !powered);
  volumeInput.disabled = !powered;
  Object.values(bankButtons).forEach((b) => (b.disabled = !powered));

  clearTimeout(displayTimer);
  if (powered) {
    flash("Power On");
  } else {
    document.querySelectorAll(".clip").forEach((a) => a.pause());
    display.innerText = "";
  }
});