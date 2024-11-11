import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';

const Pathfinding = ({ algorithm, grid, setGrid, start, end, setStart, setEnd }) => {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const sceneRef = useRef(null);

  useEffect(() => {
    let renderer;
    try {
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xffffff); 
      mountRef.current.appendChild(renderer.domElement);

      const handleMouseClick = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          if (intersectedObject.userData.node) {
            const node = intersectedObject.userData.node;
            if (event.shiftKey) {
              setEnd(node.x, node.y);
            } else {
              setStart(node.x, node.y);
            }
          }
        }
      };

      const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', onWindowResize);
      window.addEventListener('click', handleMouseClick);

      visualizeGrid(scene, grid, start, end);

      const gridCenterX = (grid.length - 1) * 1.5 / 2;
      const gridCenterY = (grid[0].length - 1) * 1.5 / 2;
      camera.position.set(gridCenterX, gridCenterY, 75); 
      camera.lookAt(gridCenterX, gridCenterY, 0);

      const animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('click', handleMouseClick);
        if (renderer) {
          mountRef.current.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (error) {
      console.error('Error creating WebGL context:', error);
    }
  }, [grid]);

  useEffect(() => {
    if (sceneRef.current) {
      visualizeGrid(sceneRef.current, grid, start, end);
    }
  }, [start, end]);

  useEffect(() => {
    if (sceneRef.current) {
      runAlgorithm(sceneRef.current, grid, algorithm, start, end);
    }
  }, [algorithm, start, end]);

  const handleCubeClick = (node) => {
    const newGrid = grid.map(row => row.map(cell => {
      if (cell.x === node.x && cell.y === node.y) {
        return { ...cell, wall: !cell.wall };
      }
      return cell;
    }));
    setGrid(newGrid);
  };

  const runAlgorithm = (scene, grid, algorithm, start, end) => {
    switch (algorithm) {
      case 'A*':
        dynamicAStar(scene, grid, grid[start.x][start.y], grid[end.x][end.y]);
        break;
      case 'Dijkstra':
        dynamicDijkstra(scene, grid, grid[start.x][start.y], grid[end.x][end.y]);
        break;
      case 'BFS':
        dynamicBFS(scene, grid, grid[start.x][start.y], grid[end.x][end.y]);
        break;
      case 'DFS':
        dynamicDFS(scene, grid, grid[start.x][start.y], grid[end.x][end.y]);
        break;
      default:
        dynamicAStar(scene, grid, grid[start.x][start.y], grid[end.x][end.y]);
    }
  };

  const visualizeGrid = (scene, grid, start, end, closedSet = [], openSet = []) => {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const node = grid[i][j];
        if (!node.cube) {
          const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
          const material = new THREE.MeshBasicMaterial({ color: node.wall ? 0x000000 : 0xffffff });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(node.x * 1.5, node.y * 1.5, 0); 
          cube.userData = { node };
          scene.add(cube);
          node.cube = cube;
        } else {
          node.cube.material.color.set(node.wall ? 0x000000 : 0xffffff);
        }
      }
    }

    closedSet.forEach((node, index) => {
      const color = d3.interpolateYlOrBr(index / closedSet.length);
      node.cube.material.color.set(color);
    });

    openSet.forEach(node => {
      node.cube.material.color.set(0xd3d3d3); // Light gray for traversal
    });

    // Highlight start and end points
    grid[start.x][start.y].cube.material.color.set(0x00ff00); // Green for start
    grid[end.x][end.y].cube.material.color.set(0xff0000); // Red for end
  };

  const dynamicAStar = async (scene, grid, start, end) => {
    const openSet = [];
    const closedSet = [];
    openSet.push(start);

    while (openSet.length > 0) {
      let lowestIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openSet[lowestIndex];

      if (current === end) {
        const path = [];
        let temp = current;
        while (temp.previous) {
          path.push(temp);
          temp = temp.previous;
        }
        path.push(start); 
        visualizePath(scene, path.reverse());
        return;
      }

      openSet.splice(lowestIndex, 1);
      closedSet.push(current);

      const neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          const tempG = current.g + 1;

          let newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }

          if (newPath) {
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }

      closedSet.forEach(node => {
        node.visitedTime = Date.now();
      });

      visualizeGrid(scene, grid, start, end, closedSet, openSet);
      await new Promise((resolve) => setTimeout(resolve, 1)); // Faster traversal
    }
  };

  const dynamicDijkstra = async (scene, grid, start, end) => {
    const openSet = [];
    const closedSet = [];
    openSet.push(start);

    while (openSet.length > 0) {
      let lowestIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].g < openSet[lowestIndex].g) {
          lowestIndex = i;
        }
      }

      const current = openSet[lowestIndex];

      if (current === end) {
        const path = [];
        let temp = current;
        while (temp.previous) {
          path.push(temp);
          temp = temp.previous;
        }
        path.push(start); 
        visualizePath(scene, path.reverse());
        return;
      }

      openSet.splice(lowestIndex, 1);
      closedSet.push(current);

      const neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          const tempG = current.g + 1;

          let newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }

          if (newPath) {
            neighbor.previous = current;
          }
        }
      }

      closedSet.forEach(node => {
        node.visitedTime = Date.now();
      });

      visualizeGrid(scene, grid, start, end, closedSet, openSet);
      await new Promise((resolve) => setTimeout(resolve, 1)); // Faster traversal
    }
  };

  const dynamicBFS = async (scene, grid, start, end) => {
    const queue = [];
    const closedSet = [];
    queue.push(start);

    while (queue.length > 0) {
      const current = queue.shift();

      if (current === end) {
        const path = [];
        let temp = current;
        while (temp.previous) {
          path.push(temp);
          temp = temp.previous;
        }
        path.push(start); 
        visualizePath(scene, path.reverse());
        return;
      }

      closedSet.push(current);

      const neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (!closedSet.includes(neighbor) && !neighbor.wall && !queue.includes(neighbor)) {
          neighbor.previous = current;
          queue.push(neighbor);
        }
      }

      closedSet.forEach(node => {
        node.visitedTime = Date.now();
      });

      visualizeGrid(scene, grid, start, end, closedSet, queue);
      await new Promise((resolve) => setTimeout(resolve, 1)); // Faster traversal
    }
  };

  const dynamicDFS = async (scene, grid, start, end) => {
    const stack = [];
    const closedSet = [];
    stack.push(start);

    while (stack.length > 0) {
      const current = stack.pop();

      if (current === end) {
        const path = [];
        let temp = current;
        while (temp.previous) {
          path.push(temp);
          temp = temp.previous;
        }
        path.push(start); 
        visualizePath(scene, path.reverse());
        return;
      }

      closedSet.push(current);

      const neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (!closedSet.includes(neighbor) && !neighbor.wall && !stack.includes(neighbor)) {
          neighbor.previous = current;
          stack.push(neighbor);
        }
      }

      closedSet.forEach(node => {
        node.visitedTime = Date.now();
      });

      visualizeGrid(scene, grid, start, end, closedSet, stack);
      await new Promise((resolve) => setTimeout(resolve, 1)); // Faster traversal
    }
  };

  const heuristic = (a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  const visualizePath = (scene, path) => {
    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      node.cube.material.color.set(0x32CD32); // Lime green for the optimal path
    }
  };

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Pathfinding;