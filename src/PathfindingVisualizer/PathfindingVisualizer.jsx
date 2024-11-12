import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';

import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      startNode: {row: START_NODE_ROW, col: START_NODE_COL},
      finishNode: {row: FINISH_NODE_ROW, col: FINISH_NODE_COL},
      draggingNode: null,
    };
  }

  componentDidMount() {
    const {startNode, finishNode} = this.state;
    const grid = getInitialGrid(startNode, finishNode);
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    const {startNode, finishNode} = this.state;
    if (row === startNode.row && col === startNode.col) {
      this.setState({draggingNode: 'start'});
    } else if (row === finishNode.row && col === finishNode.col) {
      this.setState({draggingNode: 'finish'});
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid, mouseIsPressed: true});
    }
  }

  handleMouseEnter(row, col) {
    const {draggingNode, grid, mouseIsPressed} = this.state;
    if (draggingNode) {
      const newGrid = grid.slice();
      if (draggingNode === 'start') {
        newGrid[this.state.startNode.row][this.state.startNode.col].isStart = false;
        newGrid[row][col].isStart = true;
        this.setState({startNode: {row, col}, grid: newGrid});
      } else if (draggingNode === 'finish') {
        newGrid[this.state.finishNode.row][this.state.finishNode.col].isFinish = false;
        newGrid[row][col].isFinish = true;
        this.setState({finishNode: {row, col}, grid: newGrid});
      }
    } else if (mouseIsPressed) {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState({grid: newGrid});
    }
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false, draggingNode: null});
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const {grid, startNode, finishNode} = this.state;
    const start = grid[startNode.row][startNode.col];
    const finish = grid[finishNode.row][finishNode.col];
    const visitedNodesInOrder = dijkstra(grid, start, finish);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finish);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  resetGrid() {
    window.location.reload();
  }

  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <div>
        <div className="controls">
          <button onClick={() => this.visualizeDijkstra()}>Visualize Dijkstra's Algorithm</button>
          <button onClick={() => this.resetGrid()}>Reset Grid</button>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="row">
                {row.map((node, nodeIdx) => {
                  const {row, col, isStart, isFinish, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const getInitialGrid = (startNode, finishNode) => {
  const grid = [];
  for (let row = 0; row < 30; row++) {
    const currentRow = [];
    for (let col = 0; col < 70; col++) {
      currentRow.push(createNode(col, row, startNode, finishNode));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startNode, finishNode) => {
  return {
    col,
    row,
    isStart: row === startNode.row && col === startNode.col,
    isFinish: row === finishNode.row && col === finishNode.col,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};