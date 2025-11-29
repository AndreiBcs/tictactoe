const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('reset');
const difficultySelect = document.getElementById('difficulty'); // optional dropdown

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;

// Difficulty: "easy", "medium", "hard"
let difficulty = "medium";

const winningCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// -------- AI Functions --------
function aiRandomMove(board) {
  const emptyCells = board
    .map((cell, index) => cell === "" ? index : null)
    .filter(i => i !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function aiMediumMove(board, aiPlayer="O", human="X") {
  // Try to win
  for (let combo of winningCombos) {
    const [a,b,c] = combo;
    const cells = [board[a], board[b], board[c]];
    if (cells.filter(x=>x===aiPlayer).length ===2 && cells.includes("")) {
      return combo[cells.indexOf("")];
    }
  }
  // Block human
  for (let combo of winningCombos) {
    const [a,b,c] = combo;
    const cells = [board[a], board[b], board[c]];
    if (cells.filter(x=>x===human).length===2 && cells.includes("")) {
      return combo[cells.indexOf("")];
    }
  }
  // Otherwise random
  return aiRandomMove(board);
}

function minimax(board, player) {
  const human = "X", ai="O";

  function checkWinner(b){
    for(let [a,b1,c] of winningCombos){
      if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
    }
    return b.every(c=>c!=="") ? "draw": null;
  }

  let winner = checkWinner(board);
  if(winner===human) return {score:-1};
  if(winner===ai) return {score:1};
  if(winner==="draw") return {score:0};

  const moves=[];
  board.forEach((cell,i)=>{
    if(cell===""){
      board[i]=player;
      const score = minimax(board, player===ai?human:ai).score;
      moves.push({index:i, score});
      board[i]="";
    }
  });

  return player===ai ? moves.reduce((best,m)=>m.score>best.score?m:best)
                     : moves.reduce((best,m)=>m.score<best.score?m:best);
}

function aiPerfectMove(board){
  return minimax(board,"O").index;
}

// -------- Game Functions --------
function handleCellClick(e){
  const index = e.target.dataset.index;

  if(board[index]!=="" || !gameActive || currentPlayer==="O") return;

  makeMove(index);

  // AI Turn
  if(gameActive && currentPlayer==="O"){
    setTimeout(()=>{
      let aiMove;
      if(difficulty==="easy") aiMove=aiRandomMove(board);
      else if(difficulty==="medium") aiMove=aiMediumMove(board);
      else aiMove=aiPerfectMove(board);

      makeMove(aiMove);
    },300);
  }
}

function makeMove(index){
  board[index]=currentPlayer;
  cells[index].textContent=currentPlayer;

  if(checkWin()){
    alert(currentPlayer + " wins!");
    gameActive=false;
    return;
  }

  if(board.every(c=>c!=="")){
    alert("Draw!");
    gameActive=false;
    return;
  }

  currentPlayer = currentPlayer==="X"?"O":"X";
}

function checkWin(){
  return winningCombos.some(combo=>{
    return combo.every(i=>board[i]===currentPlayer);
  });
}

function resetGame(){
  board=["","","","","","","","",""];
  currentPlayer="X";
  gameActive=true;
  cells.forEach(cell=>cell.textContent="");
}

// -------- Event Listeners --------
cells.forEach(cell=>cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);

if(difficultySelect){
  difficultySelect.addEventListener("change", e=>{
    difficulty=e.target.value;
  });
}

