import React, { useState } from 'react';
import './App.css';
import Pathfinding from './components/Pathfinding.jsx';

function App() {
  const [algorithm, setAlgorithm] = useState('A*');
  const [grid, setGrid] = useState(createGrid(20, 20));

  const buttonClass = (algo) => 
    `font-semibold px-4 py-2 rounded-lg transition-colors duration-300 ${algorithm === algo ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`;

  const handleGenerateGrid = () => {
    setGrid(createGrid(20, 20)); 
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex space-x-4 pt-10">
        <button onClick={() => setAlgorithm('A*')} className={buttonClass('A*')}>A*</button>
        <button onClick={() => setAlgorithm('Dijkstra')} className={buttonClass('Dijkstra')}>Dijkstra</button>
        <button onClick={() => setAlgorithm('BFS')} className={buttonClass('BFS')}>BFS</button>
        <button onClick={() => setAlgorithm('DFS')} className={buttonClass('DFS')}>DFS</button>
        <button onClick={handleGenerateGrid} className="font-semibold px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600">Generate Grid</button>
      </div>
      <Pathfinding algorithm={algorithm} grid={grid} setGrid={setGrid} />
    </div>
  );
}

const createGrid = (rows, cols) => {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        x: i,
        y: j,
        f: 0,
        g: 0,
        h: 0,
        neighbors: [],
        previous: undefined,
        wall: Math.random() < 0.3 ? true : false,
        cube: null,
      });
    }
    grid.push(row);
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i > 0) grid[i][j].neighbors.push(grid[i - 1][j]);
      if (i < rows - 1) grid[i][j].neighbors.push(grid[i + 1][j]);
      if (j > 0) grid[i][j].neighbors.push(grid[i][j - 1]);
      if (j < cols - 1) grid[i][j].neighbors.push(grid[i][j + 1]);
    }
  }

  return grid;
};

export default App;