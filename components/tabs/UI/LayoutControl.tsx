'use client';

import { Form } from "lucide-react";
import { useState } from "react";

interface AlphaTabApi {
  settings: {
    display: {
      layoutMode: number;
    };
  };
  updateSettings: () => void;
  render: () => void;
}

interface LayoutControlProps {
  apiRef: AlphaTabApi | null;
  isPlayerReady: boolean;
}

export default function LayoutControl({ apiRef, isPlayerReady }: LayoutControlProps) {
  const [layoutShow, setLayoutShow] = useState(false);
  const [selectValue, setSelectValue] = useState("horizontal");

  function onLayoutShow(): void {
    setLayoutShow(!layoutShow);
  }

  function handleLayout(event: React.ChangeEvent<HTMLSelectElement>): void {
    const value = event.target.value;
    setSelectValue(value);
    if (apiRef) {
      // AlphaTab LayoutMode: Page = 0, Horizontal = 1
      apiRef.settings.display.layoutMode = value === 'horizontal' ? 1 : 0;
      apiRef.updateSettings();
      apiRef.render();
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={onLayoutShow}
        disabled={!isPlayerReady}
        className="p-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Layout"
      >
        <Form />
      </button>

      {layoutShow && (
        <select
          value={selectValue}
          onChange={handleLayout}
          className="absolute top-full left-0 mt-1 p-2 border border-gray-200 rounded-md bg-white shadow-lg z-10 text-sm"
        >
          <option value="page">Page</option>
          <option value="horizontal">Horizontal</option>
        </select>
      )}
    </div>
  );
}