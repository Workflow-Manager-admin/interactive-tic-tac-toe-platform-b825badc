import React, { useState, useEffect } from 'react';
import './App.css';

// Color variables for the modern, minimalistic, light-themed UI
const PALETTE = {
  primary: '#1976D2',
  secondary: '#FFC107',
  accent: '#D32F2F',
  boardBg: '#ffffff',
  cellHover: '#f4f6fa',
  boardBorder: '#e0e0e0',
  statusBg: '#f7fafc',
  controlBg: '#fafbff',
};

// -- DATA MODEL --
const emptyBoard = () => Array(9).fill(null);

// Check if any player has won; returns ['X'/'O', cells] or null
function calculateWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diags
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return [board[a], [a,b,c]];
    }
  }
  return null;
}

// -- AI LOGIC STUB ONLY --
// PUBLIC_INTERFACE
function getAIMove(board) {
  // Returns a random empty cell (simple stub, not optimal)
  const available = [];
  board.forEach((cell, idx) => { if (!cell) available.push(idx); });
  if (available.length === 0) return null;
  const randIdx = Math.floor(Math.random() * available.length);
  return available[randIdx];
}

// PUBLIC_INTERFACE
function TicTacToe() {
  // gameMode: 'twoplayer' | 'vsai'
  const [gameMode, setGameMode] = useState('twoplayer');
  const [board, setBoard] = useState(emptyBoard());
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState('Next player: X');
  const [winnerInfo, setWinnerInfo] = useState(null); // [winner, [a,b,c]]
  const [aiThinking, setAIThinking] = useState(false);

  useEffect(() => {
    // Update status after each board move
    const winner = calculateWinner(board);
    if (winner) {
      setStatus(`Winner: ${winner[0]}`);
      setWinnerInfo(winner);
    } else if (board.every(cell => cell !== null)) {
      setStatus('Draw! No one wins.');
      setWinnerInfo(null);
    } else {
      setStatus(`Next player: ${xIsNext ? 'X' : 'O'}`);
      setWinnerInfo(null);
    }
  }, [board, xIsNext]);

  // AI makes a move if it's vs. AI and correct turn
  useEffect(() => {
    if (gameMode === 'vsai' && !winnerInfo && !board.every(cell=>cell !== null)) {
      if (!xIsNext) { // Human: X, AI: O
        setAIThinking(true);
        // Simulate AI thinking delay
        const timeout = setTimeout(() => {
          const move = getAIMove(board);
          if (move !== null) {
            makeMove(move);
          }
          setAIThinking(false);
        }, 550);
        return () => clearTimeout(timeout);
      }
    }
    // eslint-disable-next-line
  }, [gameMode, board, xIsNext, winnerInfo]);

  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (aiThinking) return; // Disable clicks while AI is "thinking"
    if (board[idx] || calculateWinner(board)) return; // already filled or finished
    if (gameMode === 'vsai' && !xIsNext) return; // Only allow X (human) clicks
    makeMove(idx);
  }

  // Place mark and advance game
  function makeMove(idx) {
    setBoard(prev => {
      const next = [...prev];
      next[idx] = xIsNext ? 'X' : 'O';
      return next;
    });
    setXIsNext(prev => !prev);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(emptyBoard());
    setXIsNext(true);
    setWinnerInfo(null);
    setStatus('Next player: X');
    setAIThinking(false);
  }

  // PUBLIC_INTERFACE
  function handleModeChange() {
    const next = gameMode === 'twoplayer' ? 'vsai' : 'twoplayer';
    setGameMode(next);
    handleRestart(); // Always restart on mode switch
  }

  // UI Rendering Functions

  function renderCell(idx) {
    const isWinningCell = winnerInfo && winnerInfo[1].includes(idx);
    return (
      <button
        key={idx}
        className="ttt-cell"
        style={{
          color: board[idx] === 'X' ? PALETTE.primary :
                 board[idx] === 'O' ? PALETTE.accent : '#bdbdbd',
          background: isWinningCell ? '#e3f2fd' : PALETTE.boardBg,
          borderColor: PALETTE.boardBorder
        }}
        onClick={() => handleCellClick(idx)}
        disabled={!!board[idx] || !!winnerInfo || (gameMode === 'vsai' && !xIsNext) || aiThinking}
        aria-label={`cell ${idx} ${board[idx] || ''}`}
      >
        {board[idx] || ''}
      </button>
    );
  }

  return (
    <div className="ttt-outer-container" style={{background: PALETTE.boardBg, minHeight: '100vh'}}>
      {/* Status Bar */}
      <div className="ttt-status-bar" style={{
        background: PALETTE.statusBg,
        color: '#222',
        borderBottom: `2px solid ${PALETTE.primary}`,
        padding: '1.2rem 0 0.75rem 0',
        fontWeight: 500,
        letterSpacing: '0.02em',
        fontSize: '1.15rem'
      }}>{status}</div>
      {/* Board */}
      <div className="ttt-board-container">
        <div className="ttt-board" role="grid" aria-label="tic tac toe board">
          {Array(9).fill(null).map((_, idx) => renderCell(idx))}
        </div>
      </div>
      {/* Controls */}
      <div className="ttt-controls-container" style={{
        marginTop: 24,
        paddingBottom: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}>
        <div>
          <button
            className="ttt-ctrl-btn"
            onClick={handleRestart}
            style={{
              background: PALETTE.primary,
              color: '#fff',
              marginRight: 8
            }}
            aria-label="Restart game"
          >Restart</button>
          <button
            className="ttt-ctrl-btn"
            onClick={handleModeChange}
            style={{
              background: gameMode === 'twoplayer' ? PALETTE.secondary : PALETTE.accent,
              color: '#222'
            }}
            aria-label="Toggle AI/human opponent"
          >{gameMode === 'twoplayer' ? "Play vs AI" : "Two Player"}</button>
        </div>
        <div className="ttt-mode-label"
          style={{
            fontSize: 13,
            color: '#727272',
            background: '#f9fbe7',
            padding: '2.5px 10px',
            borderRadius: '100px',
            fontWeight: 500,
            letterSpacing: '0.015em'
          }}>
          Mode: {gameMode === 'twoplayer' ? "Two-Player" : "Player vs AI"}
        </div>
      </div>
      {aiThinking ?
        <div className="ttt-ai-status" style={{
          color: PALETTE.accent,
          paddingBottom: '1rem',
          fontSize: '1rem',
          fontWeight: 450
        }}>AI is thinking...</div> : null}
      <footer style={{
        marginTop: 33,
        fontSize: 12.5,
        color: '#999',
        textAlign: 'center'
      }}>
        Tic Tac Toe React – modern, minimal UI.
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Theme switch uses the provided dark/light logic
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return (
    <div className="App" style={{
      background: theme === 'light' ? PALETTE.boardBg : '#171c26',
      color: '#1a2027',
      minHeight: '100vh'
    }}>
      <header style={{ position: "relative", minHeight: '0px' }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 style={{
          textAlign: 'center',
          margin: '0.75rem 0 0.45rem 0',
          color: PALETTE.primary,
          letterSpacing: 0.035,
          fontWeight: 700,
          fontSize: '2.0rem',
        }}>
          Tic Tac Toe
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#6d7587',
          fontSize: '1rem'
        }}>
          Challenge a friend or play against AI.
        </p>
      </header>
      <main>
        <TicTacToe />
      </main>
    </div>
  );
}

export default App;
