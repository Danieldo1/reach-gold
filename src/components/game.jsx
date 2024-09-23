'use client'

import React, { useState, useEffect } from 'react';

const GRID_SIZE = 4;
const EMPTY_CELL = 0;

const Game = () => {
  const [grid, setGrid] = useState([]);

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
    addNewTile(newGrid);
    addNewTile(newGrid);
    setGrid(newGrid);
  };

  const addNewTile = (currentGrid) => {
    const emptycélulas = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === EMPTY_CELL) {
          emptycélulas.push({ i, j });
        }
      }
    }
    if (emptycélulas.length > 0) {
      const { i, j } = emptycélulas[Math.floor(Math.random() * emptycélulas.length)];
      currentGrid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const renderGrid = () => {
    return grid.map((row, i) => (
      <div key={i} style={{ display: 'flex' }}>
        {row.map((cell, j) => (
          <div key={`${i}-${j}`} style={cellStyle}>
            {cell !== EMPTY_CELL ? cell : ''}
          </div>
        ))}
      </div>
    ));
  };

  const cellStyle = {
    width: '60px',
    height: '60px',
    border: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '2px',
  };

  return (
    <div>
      <h1>Number Slide</h1>
      <div>{renderGrid()}</div>
    </div>
  );
};

export default Game;