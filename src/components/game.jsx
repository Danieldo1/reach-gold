"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { isMobile } from "react-device-detect";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";

const GRID_SIZE = 4;
const COLORS = [
  "lightblue",
  "darkblue",
  "lightpurple",
  "purple",
  "lightorange",
  "orange",
  "yellow",
];
const TARGET_COLOR = COLORS[COLORS.length - 1];

// Color progression
const COLOR_PROGRESSION = {};
for (let i = 0; i < COLORS.length - 1; i++) {
  COLOR_PROGRESSION[COLORS[i]] = COLORS[i + 1];
}

const ReachGold = () => {
  const [grid, setGrid] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [goldTiles, setGoldTiles] = useState(0);
  const [score, setScore] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showGoldAnimation, setShowGoldAnimation] = useState(false);
  const [nickname, setNickname] = useState("");
  const [highScores, setHighScores] = useState([]);
  const [showHighScores, setShowHighScores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openHighScoresModal, setOpenHighScoresModal] = useState(false);

  const initializeGrid = () => {
    const newGrid = Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(null));
    addNewBlock(newGrid);
    addNewBlock(newGrid);
    setGrid(newGrid);
    setShowModal(true);
    setGoldTiles(0);
    setScore(0);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  useEffect(() => {
    fetchHighScores();
  }, []);

  const saveScore = async () => {
    if (nickname.trim() === "" || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/highscores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: nickname,
          score: score,
          goldTiles: goldTiles,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save score");
      }

      await fetchHighScores();
      setShowHighScores(true);
    } catch (error) {
      console.error("Error saving score:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHighScores = async () => {
    try {
      const response = await fetch("/api/highscores");
      if (!response.ok) {
        throw new Error("Failed to fetch high scores");
      }
      const scores = await response.json();
      setHighScores(scores);
    } catch (error) {
      console.error("Error fetching high scores:", error);
    }
  };

  const addNewBlock = (currentGrid) => {
    const emptySpaces = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!currentGrid[i][j]) {
          emptySpaces.push([i, j]);
        }
      }
    }
    if (emptySpaces.length > 0) {
      const [row, col] =
        emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
      currentGrid[row][col] = COLORS[0];
    } else {
      checkGameOver(currentGrid);
    }
  };

  const checkGameOver = (currentGrid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          (j < GRID_SIZE - 1 && currentGrid[i][j] === currentGrid[i][j + 1]) ||
          (i < GRID_SIZE - 1 && currentGrid[i][j] === currentGrid[i + 1][j])
        ) {
          return;
        }
      }
    }
    setShowGameOver(true);
  };

  const moveBlocks = (direction) => {
    let newGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    let newScore = score;
    let goldCollected = false;

    const move = (row, col, rowStep, colStep) => {
      if (!newGrid[row][col]) return false;

      let newRow = row + rowStep;
      let newCol = col + colStep;

      while (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE
      ) {
        if (!newGrid[newRow][newCol]) {
          newGrid[newRow][newCol] = newGrid[newRow - rowStep][newCol - colStep];
          newGrid[newRow - rowStep][newCol - colStep] = null;
          newRow += rowStep;
          newCol += colStep;
          moved = true;
        } else if (
          newGrid[newRow][newCol] ===
          newGrid[newRow - rowStep][newCol - colStep]
        ) {
          if (newGrid[newRow][newCol] === TARGET_COLOR) {
            newGrid[newRow][newCol] = null;
            setGoldTiles((prev) => prev + 1);
            newScore += 100;
            goldCollected = true;
          } else {
            newGrid[newRow][newCol] =
              COLOR_PROGRESSION[newGrid[newRow][newCol]];
            newScore += 10;
          }
          newGrid[newRow - rowStep][newCol - colStep] = null;
          moved = true;
          break;
        } else {
          break;
        }
      }
    };

    const processGrid = () => {
      if (direction === "up" || direction === "down") {
        const start = direction === "up" ? 1 : GRID_SIZE - 2;
        const end = direction === "up" ? GRID_SIZE : -1;
        const step = direction === "up" ? 1 : -1;
        for (let col = 0; col < GRID_SIZE; col++) {
          for (let row = start; row !== end; row += step) {
            move(row, col, direction === "up" ? -1 : 1, 0);
          }
        }
      } else {
        const start = direction === "left" ? 1 : GRID_SIZE - 2;
        const end = direction === "left" ? GRID_SIZE : -1;
        const step = direction === "left" ? 1 : -1;
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = start; col !== end; col += step) {
            move(row, col, 0, direction === "left" ? -1 : 1);
          }
        }
      }
    };

    processGrid();

    if (moved) {
      addNewBlock(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      if (goldCollected) {
        setShowGoldAnimation(true);
        setTimeout(() => setShowGoldAnimation(false), 1500);
      }
    } else {
      checkGameOver(newGrid);
    }
  };

  const handleKeyDown = (e) => {
    if (showGameOver) return;
    switch (e.key) {
      case "ArrowDown":
        moveBlocks("down");
        break;
      case "ArrowUp":
        moveBlocks("up");
        break;
      case "ArrowLeft":
        moveBlocks("left");
        break;
      case "ArrowRight":
        moveBlocks("right");
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [grid, showGameOver, score]);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const dx = touchStart.x - touchEnd.x;
    const dy = touchStart.y - touchEnd.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      if (absDx > absDy) {
        moveBlocks(dx > 0 ? "left" : "right");
      } else {
        moveBlocks(dy > 0 ? "up" : "down");
      }
    }
  };

  const getColorStyle = (color) => {
    switch (color) {
      case "lightblue":
        return "bg-blue-300";
      case "darkblue":
        return "bg-blue-700";
      case "lightpurple":
        return "bg-purple-300";
      case "purple":
        return "bg-purple-700";
      case "lightorange":
        return "bg-orange-300";
      case "orange":
        return "bg-orange-500";
      case "yellow":
        return "bg-yellow-400";
      default:
        return "bg-gray-200";
    }
  };

  const restartGame = () => {
    setShowGameOver(false);
    setShowHighScores(false);
    setNickname("");
    initializeGrid();
  };

  return (
    <div className="flex  flex-col items-center justify-center min-h-screen max-w-7xl mx-auto container">
      <div className=" flex items-center mb-4 justify-center gap-5">
        <h1 className="text-4xl font-bold  text-center">Reach Gold</h1>
        <button onClick={() => setOpenHighScoresModal(true)}>
          <Image
            src="/gold.png"
            alt="gold"
            width={30}
            height={30}
            className="animate-wiggle"
          />
        </button>
      </div>
      <div className="mb-4 text-xl">
        <span className="mr-4">Gold Tiles: {goldTiles}</span>
        <span>Score: {score}</span>
      </div>
      <div
        className="grid grid-cols-4 gap-2 bg-white p-4 rounded-lg shadow-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {grid.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 rounded-md ${getColorStyle(color)}`}
              animate={{ scale: color ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))
        )}

        {/* Gold Animation     */}
        <AnimatePresence>
          {showGoldAnimation && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 2, rotate: 180, opacity: 0, y: -200 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <motion.div
                  className="w-full h-full rounded-full bg-yellow-300"
                  animate={{
                    boxShadow: [
                      "0 0 0 0px rgba(250, 204, 21, 0.4)",
                      "0 0 0 20px rgba(250, 204, 21, 0)",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
                <span className="absolute text-4xl">🏆</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* High Scores Modal */}
      <AlertDialog
        open={openHighScoresModal}
        onOpenChange={setOpenHighScoresModal}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-center">
              High Scores
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-center">
              <div className="mt-4 min-h-60 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Nickname</th>
                      <th className="px-4 py-2 text-center">Gold Tiles</th>
                      <th className="px-4 py-2 text-right">Score</th>
                    </tr>
                  </thead>

                  <tbody>
                    {highScores.map((hs, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className=" px-4 py-2 text-left rounded-l-md">
                          {hs.nickname}
                        </td>
                        <td className=" px-4 py-2 text-center">
                          {hs.goldTiles}
                        </td>
                        <td className=" px-4 py-2 text-right rounded-r-md">
                          {hs.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenHighScoresModal(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog */}
      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-center">
              How to Play
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-center">
              {isMobile
                ? "Swipe to move blocks. "
                : "Use arrow keys to shift blocks. "}{" "}
              <br />
              Combine blocks to progress through colors:{" "}
              <div className="flex justify-center items-center gap-2 mt-4">
                <div className="size-5 rounded-sm bg-blue-300" />→{" "}
                <div className="size-5 rounded-sm bg-blue-600" />→{" "}
                <div className="size-5 rounded-sm bg-purple-300" />→{" "}
                <div className="size-5 rounded-sm bg-purple-600" />→{" "}
                <div className="size-5 rounded-sm bg-orange-300" />→{" "}
                <div className="size-5 rounded-sm bg-orange-600" />→{" "}
                <div className="size-5 rounded-sm bg-yellow-400" />
                <br />
              </div>
              <br />
              <div className="flex justify-center items-center gap-2 my-2">
              <div className="size-5 rounded-sm bg-yellow-400" /> + <div className="size-5 rounded-sm bg-yellow-400" /> = 🏆
              </div>
             
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowModal(false)}>
            Close
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Game Over Modal */}
      <AlertDialog open={showGameOver} onOpenChange={setShowGameOver}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Game Over
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              No more moves available.
              <br />
              <div className="grid grid-cols-2 w-full gap-2 mt-2 text-lg">
                <p>Your final score: {score}</p>
                <p> Gold tiles collected: {goldTiles}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!showHighScores ? (
            <>
              <Input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-4"
              />
              <Button onClick={saveScore} className="mt-2">
                Save Score
              </Button>
            </>
          ) : (
            <AlertDialogAction onClick={restartGame} className="mt-4">
              Play Again
            </AlertDialogAction>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReachGold;
