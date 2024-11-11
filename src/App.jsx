import React, { useState } from 'react';
import './App.css';
import Pathfinding from './components/Pathfinding.jsx';

function App() {
  const [algorithm, setAlgorithm] = useState('A*');

  const buttonClass = (algo) => 
    `font-semibold px-4 py-2 rounded-lg transition-colors duration-300 ${algorithm === algo ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex space-x-4 pt-10">
        <button onClick={() => setAlgorithm('A*')} className={buttonClass('A*')}>A*</button>
        <button onClick={() => setAlgorithm('Dijkstra')} className={buttonClass('Dijkstra')}>Dijkstra</button>
        <button onClick={() => setAlgorithm('BFS')} className={buttonClass('BFS')}>BFS</button>
        <button onClick={() => setAlgorithm('DFS')} className={buttonClass('DFS')}>DFS</button>
      </div>
      <Pathfinding algorithm={algorithm} />
    </div>
  );
}

export default App;