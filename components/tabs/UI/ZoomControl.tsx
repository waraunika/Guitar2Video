"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface AlphaTabApi {
  settings: {
    display: {
      scale: number;
    };
  };
  updateSettings: () => void;
  render: () => void;
}

interface ZoomControlProps {
  apiRef: AlphaTabApi | null;
  isPlayerReady: boolean;
}

export default function ZoomControl({ apiRef, isPlayerReady }: ZoomControlProps) {
  const [zoomShow, setZoomShow] = useState(false);
  const [selectValue, setSelectValue] = useState("100");

  function onZoomShow(): void {
    setZoomShow(!zoomShow);
  }

  function handleZoom(event: React.ChangeEvent<HTMLSelectElement>): void {
    const value = parseInt(event.target.value) / 100;
    setSelectValue(event.target.value);
    if (apiRef) {
      apiRef.settings.display.scale = value;
      apiRef.updateSettings();
      apiRef.render();
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={onZoomShow}
        disabled={!isPlayerReady}
        className="p-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        title="Zoom"
      >
        <Search size={18} />
        <span className="text-xs">{selectValue}%</span>
      </button>

      {zoomShow && (
        <select
          value={selectValue}
          onChange={handleZoom}
          className="absolute top-full left-0 mt-1 p-2 border border-gray-200 rounded-md bg-white shadow-lg z-10 text-sm"
        >
          <option value="25">25%</option>
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="90">90%</option>
          <option value="100">100%</option>
          <option value="110">110%</option>
          <option value="125">125%</option>
          <option value="150">150%</option>
          <option value="200">200%</option>
        </select>
      )}
    </div>
  );
}