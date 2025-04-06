// script.js

const board = document.getElementById("sudoku-board");
const getClueBtn = document.getElementById("get-clue");
const undoBtn = document.getElementById("undo-btn");
const timerElement = document.getElementById("timer");
const modal = document.getElementById("difficulty-modal");
const diffButtons = document.querySelectorAll(".diff-btn");

let history = [];
let timer = 0;
let interval;
let currentSolution = "";
let currentLevel = "easy";

const puzzlesByDifficulty = {
  easy: [
    {
      puzzle: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
      solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179"
    },
    {
      puzzle: "006100007070002000000600030800000020060070090020000003040001000000300060100004500",
      solution: "386159247175432689294687135813946725465273891729518463547821396652397418138764952"
    },
    {
      puzzle: "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
      solution: "245986371169273584837541269673125498918364752452796831391657842726438915584219637"
    }
  ],
  medium: [
    {
      puzzle: "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
      solution: "483621957765429183291735426176934852359812647842567319928148765634259871517386294"
    }
  ],
  hard: [
    {
      puzzle: "100007090030020008009600500005300900010080002600004000300000010040000007007000300",
      solution: "145837692236925178789641523875362941913789452624514839358296714491753267267418395"
    }
  ]
};

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("input");
    cell.type = "text";
    cell.maxLength = 1;
    cell.classList.add("cell");

    const row = Math.floor(i / 9);
    const col = i % 9;

    if (row % 3 === 0) cell.style.borderTop = "2px solid black";
    if (col % 3 === 0) cell.style.borderLeft = "2px solid black";
    if (col === 8) cell.style.borderRight = "2px solid black";
    if (row === 8) cell.style.borderBottom = "2px solid black";

    cell.addEventListener("input", () => {
      const value = cell.value;
      if (!/^[1-9]$/.test(value)) {
        cell.value = "";
      } else {
        saveToHistory();
        checkMistake(cell, value);
        animateCell(cell);
        checkIfPuzzleSolved();
      }
    });

    cell.addEventListener("paste", (e) => e.preventDefault());
    board.appendChild(cell);
  }
}

function loadPuzzleByDifficulty(level) {
  const pool = puzzlesByDifficulty[level];
  const puzzleData = pool[Math.floor(Math.random() * pool.length)];
  currentSolution = puzzleData.solution;

  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < 81; i++) {
    cells[i].value = "";
    cells[i].disabled = false;
    cells[i].classList.remove("prefilled");
    cells[i].style.color = "black";
  }

  for (let i = 0; i < 81; i++) {
    const value = puzzleData.puzzle[i];
    if (value !== "0") {
      cells[i].value = value;
      cells[i].disabled = true;
      cells[i].classList.add("prefilled");
    }
  }

  timer = 0;
  clearInterval(interval);
  startTimer();
}

function saveToHistory() {
  const snapshot = Array.from(document.querySelectorAll(".cell")).map((cell) => cell.value);
  history.push(snapshot);
}

function undoMove() {
  if (history.length === 0) return;
  const last = history.pop();
  const cells = document.querySelectorAll(".cell");
  last.forEach((val, i) => {
    if (!cells[i].disabled) {
      cells[i].value = val;
    }
  });
}

function checkMistake(cell, value) {
  const cells = document.querySelectorAll(".cell");
  const index = Array.from(cells).indexOf(cell);
  const row = Math.floor(index / 9);
  const col = index % 9;

  let isCorrect = true;

  for (let i = 0; i < 9; i++) {
    const rowCell = cells[row * 9 + i];
    const colCell = cells[i * 9 + col];
    if ((rowCell !== cell && rowCell.value === value) ||
        (colCell !== cell && colCell.value === value)) {
      isCorrect = false;
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const boxCell = cells[r * 9 + c];
      if (boxCell !== cell && boxCell.value === value) {
        isCorrect = false;
      }
    }
  }

  cell.style.borderColor = isCorrect ? "green" : "red";
}

function animateCell(cell) {
  cell.classList.add("animate");
  setTimeout(() => {
    cell.classList.remove("animate");
  }, 300);
}

function startTimer() {
  interval = setInterval(() => {
    timer++;
    const min = String(Math.floor(timer / 60)).padStart(2, '0');
    const sec = String(timer % 60).padStart(2, '0');
    timerElement.textContent = `${min}:${sec}`;
  }, 1000);
}

function checkIfPuzzleSolved() {
  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < 81; i++) {
    if (cells[i].value !== currentSolution[i]) {
      return false;
    }
  }
  clearInterval(interval);
celebrateVictory();
return true;

}

getClueBtn.addEventListener("click", () => {
  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < 81; i++) {
    if (!cells[i].disabled && cells[i].value === "") {
      cells[i].value = currentSolution[i];
      cells[i].style.color = "blue";
      animateCell(cells[i]);
      saveToHistory();
      checkIfPuzzleSolved();
      break;
    }
  }
});

undoBtn.addEventListener("click", undoMove);

createBoard();

diffButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentLevel = button.getAttribute("data-level");
    modal.style.display = "none";
    loadPuzzleByDifficulty(currentLevel);
  });
});
const newGameBtn = document.getElementById("new-game-btn");

newGameBtn.addEventListener("click", () => {
  loadPuzzleByDifficulty(currentLevel);
});
function celebrateVictory() {
  const duration = 4 * 1000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, 250);

  setTimeout(() => {
    alert("🎉 Congratulations! You solved the puzzle!");
  }, duration);
}
