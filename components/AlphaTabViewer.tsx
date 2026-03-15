"use client";

import { useEffect, useRef, useState } from "react";
import { PlayerControl } from "./tabs/Player/PlayerControls";
import EditBox from "./tabs/Editor/EditBox";
import '@/app/globals.css'
import { AlphaTabApi } from "@/types/alphaTab";

const TAB_FILE_URL = "https://www.alphatab.net/files/canon.gp";
const SOUNDFONT_URL =
  "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2";

export default function AlphaTabViewer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTabApi>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [position, setPosition] = useState({ current: "00:00", total: "00:00" });
  const [editorActive, setEditorActive] = useState(false);

  useEffect(() => {
    // AlphaTab must only run in the browser (no SSR)
    if (typeof window === "undefined") return;
    if (!mainRef.current || !viewportRef.current) return;

    // Dynamically import alphatab to ensure browser-only execution
    import("@coderline/alphatab").then((alphaTab) => {
      const settings = {
        file: TAB_FILE_URL,
        player: {
          enablePlayer: true,
          soundFont: SOUNDFONT_URL,
          scrollElement: viewportRef.current!,
          enableCursor: true,
          enableUserInteraction: true,
        },
        display: {
          scale: 1.0,
          layoutMode: alphaTab.LayoutMode.Horizontal,
        },
        // Point workers to the CDN so Next.js doesn't need to bundle them
        core: {
          scriptFile:
            "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/alphaTab.js",
          fontDirectory:
            "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/font/",
        },
      };

      const api = new alphaTab.AlphaTabApi(mainRef.current!, settings);
      apiRef.current = api;

      api.renderStarted.on(() => {
        setIsLoading(true);
      });

      api.renderFinished.on(() => {
        setIsLoading(false);
      });

      api.playerReady.on(() => {
        setIsPlayerReady(true);
        // Set initial count-in to 0 (off)
        if (apiRef.current) {
          apiRef.current.countInVolume = 0;
        }
      });

      api.playerStateChanged.on((e: any) => {
        setIsPlaying(e.state === 1); // 1 = Playing
      });

      api.soundFontLoad.on((e: any) => {
        setLoadProgress(Math.floor((e.loaded / e.total) * 100));
      });

      api.playerPositionChanged.on((e: any) => {
        setPosition({
          current: formatTime(e.currentTime),
          total: formatTime(e.endTime),
        });
      });
    });

    return () => {
      apiRef.current?.destroy();
    };
  }, []);

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  
  function showEditor() {
    const newValue = !editorActive;
    setEditorActive(newValue);
  }

  return (
    <div ref={wrapperRef} className="w-[90vw] h-[85vh]" style={styles.wrapper}>
      {/* Loading overlay */}
      {isLoading && (
        <div style={styles.overlay}>
          <div style={styles.overlayContent}>
            {loadProgress > 0 && loadProgress < 100
              ? `Loading soundfont… ${loadProgress}%`
              : "Rendering sheet music…"}
          </div>
        </div>
      )}

      {editorActive && <EditBox />}

      {/* Controls bar */}
      <div style={styles.controls}>
        <PlayerControl
          apiRef={apiRef.current}
          isPlayerReady={isPlayerReady}
          isPlaying={isPlaying}
          position={position}
          onShowEditor={showEditor}
        />
      </div>

      {/* Sheet music viewport */}
      <div style={styles.content}>
        <div ref={viewportRef} style={styles.viewport}>
          <div ref={mainRef} />
        </div>
      </div>
    </div>
  );
}

// ── Inline styles (no CSS module needed) ─────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e0e4e9",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    backdropFilter: "blur(3px)",
    background: "rgba(255,255,255,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  overlayContent: {
    marginTop: "24px",
    background: "#fff",
    padding: "16px 24px",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    fontSize: "14px",
    color: "#333",
    border: "1px solid #e8e8e8",
  },
  controls: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    background: "#f5f7fa",
    borderBottom: "1px solid #e0e4e9",
  },
  btn: {
    width: "38px",
    height: "38px",
    borderRadius: "6px",
    border: "1px solid #e0e4e9",
    background: "#fff",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  playBtn: {
    background: "#0078ff",
    borderColor: "#0078ff",
    color: "#fff",
    fontSize: "14px",
  },
  position: {
    fontSize: "13px",
    color: "#555",
    fontFamily: "monospace",
    marginLeft: "8px",
  },
  content: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  viewport: {
    position: "absolute",
    inset: 0,
    overflowY: "auto",
    padding: "16px 24px",
  },
};