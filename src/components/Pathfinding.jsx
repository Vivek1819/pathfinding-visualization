import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Pathfinding = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff); // Set background color to white
    mountRef.current.appendChild(renderer.domElement);

    const grid = createGrid(50, 50); // Larger grid
    const start = grid[0][0];
    const end = grid[49][49];

    visualizeGrid(scene, grid);
    dynamicAStar(scene, grid, start, end);

    // Center the camera
    const gridCenterX = (grid.length - 1) * 1.5 / 2;
    const gridCenterY = (grid[0].length - 1) * 1.5 / 2;
    camera.position.set(gridCenterX, gridCenterY, 75); // Adjust camera position for larger grid
    camera.lookAt(gridCenterX, gridCenterY, 0);

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    return () => {
      window.removeEventListener('resize', onWindowResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

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
        path.push(start); // Include the start node in the path
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

      visualizeGrid(scene, grid, closedSet, openSet);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Delay for visualization
    }
  };

  const heuristic = (a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  const visualizeGrid = (scene, grid, closedSet = [], openSet = []) => {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const node = grid[i][j];
        if (!node.cube) {
          const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // Adjust cube size as needed
          const material = new THREE.MeshBasicMaterial({ color: node.wall ? 0x000000 : 0xffffff });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(node.x * 1.5, node.y * 1.5, 0); // Adjust position scaling as needed
          scene.add(cube);
          node.cube = cube;
        } else {
          node.cube.material.color.set(node.wall ? 0x000000 : 0xffffff);
        }
      }
    }

    closedSet.forEach(node => {
      node.cube.material.color.set(0x0000ff); // Blue for closed set
    });

    openSet.forEach(node => {
      node.cube.material.color.set(0xff0000); // Red for open set
    });
  };

  const visualizePath = (scene, path) => {
    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      node.cube.material.color.set(0x00ff00); // Green for the path
    }
  };

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Pathfinding;