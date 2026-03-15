'use client'

import { Hourglass, Metronome, Pause, Pencil, Play, Printer, Repeat, StepBack } from "lucide-react";
import { useState } from "react";
import ZoomControl from "../UI/ZoomControl";
import LayoutControl from "../UI/LayoutControl";
import { AlphaTabApi } from "@/types/alphaTab";

interface Position {
  current: string;
  total: string;
}

interface PlayerControlProps {
  apiRef: AlphaTabApi | null;
  isPlayerReady: boolean;
  isPlaying: boolean;
  position: Position;
  onShowEditor: () => void;
}

export function PlayerControl({
  apiRef,
  isPlayerReady,
  isPlaying,
  position,
  onShowEditor
}: PlayerControlProps) {
  const [countInActive, setCountInActive] = useState(false);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [loopActive, setLoopActive] = useState(false);

  function togglePlay(): void {
    if (apiRef) {
      apiRef.playPause();
    }
  }

  function stop(): void {
    if (apiRef) {
      apiRef.stop();
    }
  }

  function toggleCountIn(): void {
    const newValue = !countInActive;
    setCountInActive(newValue);
    if (apiRef) {
      apiRef.countInVolume = newValue ? 1 : 0;
    }
  }

  function toggleMetronome(): void {
    const newValue = !metronomeActive;
    setMetronomeActive(newValue);
    if (apiRef) {
      apiRef.metronomeVolume = newValue ? 1 : 0;
    }
  }

  function toggleLoop(): void {
    const newValue = !loopActive;
    setLoopActive(newValue);
    if (apiRef) {
      apiRef.isLooping = newValue;
    }
  }

  const buttonBaseClass = "p-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const activeButtonClass = "bg-gray-200 border-gray-300 text-gray-900";

  return (
    <div className="flex items-center justify-between w-full">
      {/* Far left: Playback controls */}
      <div className="flex items-center gap-2">
        <button
          className={buttonBaseClass}
          onClick={stop}
          disabled={!isPlayerReady}
          title="Stop / Reset"
        >
          <StepBack size={18} />
        </button>

        <button
          className={`${buttonBaseClass} ${isPlaying ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}
          onClick={togglePlay}
          disabled={!isPlayerReady}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>

      {/* Time display */}
      <div className="flex items-center">
        <span className="text-sm font-mono text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200">
          {position.current} / {position.total}
        </span>
      </div>

      {/* Slight right of center: Settings controls */}
      <div className="flex items-center gap-2">
        <button
          className={`${buttonBaseClass} ${countInActive ? activeButtonClass : ''}`}
          onClick={toggleCountIn}
          disabled={!isPlayerReady}
          title="Count-in"
        >
          <Hourglass size={18} />
        </button>

        <button
          className={`${buttonBaseClass} ${metronomeActive ? activeButtonClass : ''}`}
          onClick={toggleMetronome}
          disabled={!isPlayerReady}
          title="Metronome"
        >
          <Metronome size={18} />
        </button>

        <button
          className={`${buttonBaseClass} ${loopActive ? activeButtonClass : ''}`}
          onClick={toggleLoop}
          disabled={!isPlayerReady}
          title="Loop"
        >
          <Repeat size={18} />
        </button>
      </div>

      {/* Far right: Utilities */}
      <div className="flex items-center gap-2">
        <button
          className={buttonBaseClass}
          onClick={() => apiRef?.print()}
          disabled={!isPlayerReady}
          title="Print"
        >
          <Printer size={18} />
        </button>

        <button
          className={buttonBaseClass}
          onClick={onShowEditor}
          disabled={!isPlayerReady}
          title="Edit"
        >
          <Pencil size={18} />
        </button>

        <ZoomControl apiRef={apiRef} isPlayerReady={isPlayerReady} />
        <LayoutControl apiRef={apiRef} isPlayerReady={isPlayerReady} />
      </div>
    </div>
  );
}