import React, { useState } from 'react';
import './App.css';
import Pathfinding from './components/Pathfinding.jsx';

function App() {
  const [algorithm, setAlgorithm] = useState('A*');
  const [grid, setGrid] = useState(createGrid(200, 70)); 
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 49, y: 49 });

  const buttonClass = (algo) => 
    `font-semibold px-4 py-2 rounded-lg transition-colors duration-300 ${algorithm === algo ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`;

  const handleGenerateGrid = () => {
    setGrid(createGrid(200, 70));
  };

  const handleSetStart = (x, y) => {
    setStart({ x, y });
  };

  const handleSetEnd = (x, y) => {
    setEnd({ x, y });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mt-10">Pathfinding Visualization</h1>
      <div className="buttons-container">
        <button onClick={() => setAlgorithm('A*')} className={buttonClass('A*')}>A*</button>
        <button onClick={() => setAlgorithm('Dijkstra')} className={buttonClass('Dijkstra')}>Dijkstra</button>
        <button onClick={() => setAlgorithm('BFS')} className={buttonClass('BFS')}>BFS</button>
        <button onClick={() => setAlgorithm('DFS')} className={buttonClass('DFS')}>DFS</button>
        <button onClick={handleGenerateGrid} className="font-semibold px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600">Generate Grid</button>
      </div>
      <div className="grid-container" style={{zIndex: -1}}>
        <Pathfinding 
          algorithm={algorithm} 
          grid={grid} 
          setGrid={setGrid} 
          start={start} 
          end={end} 
          setStart={handleSetStart} 
          setEnd={handleSetEnd} 
        />
      </div>
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
        wall: Math.random() < 0.1,
        cube: null,
        visited: false,
        visitedTime: null,
        isPath: false,
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