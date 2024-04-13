import init, * as wasm from "./wasm.js";

const WIDTH = 64;
const HEIGHT = 32;
const SCALE = 15;
const TICKS_PER_FRAME = 10;
let animationFrame;

const canvas = document.getElementById("canvas");
canvas.width = WIDTH * SCALE;
canvas.height = HEIGHT * SCALE;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);

const input = document.getElementById("fileinput");

async function run() {
  await init();
  let chip8 = new wasm.EmuWasm();

  document.addEventListener("keydown", function (event) {
    chip8.keypress(event, true);
  });

  document.addEventListener("keyup", function (event) {
    chip8.keypress(event, false);
  });

  input.addEventListener(
    "change",
    function (event) {
      // Stop prevous game from loading if it's present
      if (animationFrame != 0) {
        window.cancelAnimationFrame(animationFrame);
      }

      let file = event.target.files[0];
      if (!file) {
        alert("Failed to read file");
        return;
      }

      // Load in game as Uint8Array, send to .wasm, start main loo
      let fileReader = new FileReader();
      fileReader.onload = function(e) {
        let buffer = fileReader.result;
        const rom = new Uint8Array(buffer);
        chip8.reset();
        chip8.load_game(rom);
        mainloop(chip8);
      }
      fileReader.readAsArrayBuffer(file)
    },
    false
  );
}

function mainloop(chip8) {
    // Only draw after few ticks 
    for (let i = 0; i < TICKS_PER_FRAME; i++ ) {
        chip8.tick();
    }
    chip8.tick_timers();

    // Clear the canvas before drawing
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);

    // Set the draw color to black to white before we render our frame 
    ctx.fillStyle = "white"
    chip8.draw_screen(SCALE)

    animationFrame = window.requestAnimationFrame(() => {
        mainloop(chip8);
    })
}

run().catch(console.error);
