"use client";

import * as three from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ModelViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const scrubbingRef = useRef(false); // track whether user is actively dragging the slider.

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // render
    const renderer = new three.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = three.PCFSoftShadowMap;
    renderer.toneMapping = three.NoToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = three.SRGBColorSpace;

    // scene and light
    const scene = new three.Scene();
    scene.add(new three.AmbientLight(0xffffff, 1));

    // state
    const clock = new three.Timer();
    let mixer: three.AnimationMixer | null = null;
    let action: three.AnimationAction | null = null;
    let clip: three.AnimationClip | null = null;
    let controls: OrbitControls | null = null;
    let camera: three.Camera | null = null;
    let animFrameId: number;
    let isPlaying = false;

    // animation loop
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      clock.update();
      const delta = clock.getDelta();

      if (mixer && isPlaying) {
        mixer.update(delta);
      }

      if (action && clip && !scrubbingRef.current) {
        setCurrentTime(action.time);
        // push current time to react state, unless the user is scrubbing
        // action.time is the raw time within the clip
      }

      if (controls) controls.update();
      if (camera) renderer.render(scene, camera);
    }

    // camera setup (called after model loads)
    function setUpCamera() {
      const cameras: three.Camera[] = [];
      scene.traverse((obj) => {
        if ((obj as three.Camera).isCamera) cameras.push(obj as three.Camera);
      });

      camera =
        cameras[0] ??
        (() => {
          const cam = new three.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
          );
          cam.position.set(0, 1, 3);
          scene.add(cam);
          return cam;
        })();

      if ((camera as three.PerspectiveCamera).isPerspectiveCamera) {
        (camera as three.PerspectiveCamera).aspect =
          window.innerWidth / window.innerHeight;
        (camera as three.PerspectiveCamera).updateProjectionMatrix();
      }

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const box = new three.Box3().setFromObject(scene);
      controls.target.copy(box.getCenter(new three.Vector3()));
      controls.update();

      animate();
    }

    // load model
    const loader = new GLTFLoader();
    loader.load(
      "/models/Tab2Vid.glb",
      (gltf) => {
        scene.add(gltf.scene);

        if (gltf.animations.length > 0) {
          clip = gltf.animations[0];
          mixer = new three.AnimationMixer(gltf.scene);
          action = mixer.clipAction(gltf.animations[0]);
          action.play();
          isPlaying = true;

          // expose clip duration to react
          setDuration(clip.duration);
        }

        setUpCamera();
      },
      undefined,
      (err) => console.error("GLB load error: ", err),
    );

    // resize handler
    function onResize() {
      if (camera && (camera as three.PerspectiveCamera).isPerspectiveCamera) {
        (camera as three.PerspectiveCamera).aspect =
          window.innerWidth / window.innerHeight;
        (camera as three.PerspectiveCamera).updateProjectionMatrix();
      }
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    // play/pause buttons exposed via callbacks/refs
    (canvas as any).__playPause = () => {
      if (!action) return;
      isPlaying = !isPlaying;
      action.paused = !isPlaying;
    };

    (canvas as any).__restart = () => {
      if (!action) return;
      action.reset();
      action.play();
      isPlaying = true;
    };

    // seek: jump action to an arbitrary time
    (canvas as any).__seek = (time: number) => {
      if (!action || !mixer) return;
      // pauseing the action, manually setting time, then pauseing if needed
      action.paused = true;
      action.time = time;
      mixer.update(0);
      if (isPlaying) action.paused = false;
    }

    // cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", onResize);
      controls?.dispose();
      renderer.dispose();
    };
  }, []);

  // button handlers
  const handleRestart = useCallback(() => {
    (canvasRef.current as any)?.__restart?.();
    setPlaying(true);
  }, []);

  const handlePlayPause = useCallback(() => {
    (canvasRef.current as any)?.__playPause?.();
    setPlaying((p) => !p);
  }, []);

  // if dragging, update local display, but don't call seek yet:
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      setCurrentTime(time);
    },
    [],
  );

  // on mouse down, flag that we're scrubbing so the animate loop stops overwriting
  const handleSliderMouseDown = useCallback(() => {
    scrubbingRef.current = true;
  }, []);

  // on release, actually seek the animation
  const handleSliderMouseUp = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      const time = parseFloat((e.target as HTMLInputElement).value);
      (canvasRef.current as any)?.__seek?.(time);
      scrubbingRef.current = false;
    },
    [],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0 }} />

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.75)",
          color: "white",
          padding: "12px 20px",
          borderRadius: 8,
          fontFamily: "sans-serif",
          fontSize: 13,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          minWidth: 340,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          <span style={{ minWidth: 36, textAlign: "right" }}>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={handleSliderChange}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
            style={{ flex: 1, accentColor: "#4CAF50", cursor: "pointer" }}
          />
          <span style={{ minWidth: 36 }}>
            {formatTime(duration)}
          </span>
        </div>

        <button
          onClick={handlePlayPause}
          style={{
            padding: "5px 15px",
            cursor: "pointer",
            border: "none",
            borderRadius: 3,
            background: "#4CAF50",
            color: "white",
          }}
        >
          {playing ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <button
          onClick={handleRestart}
          style={{
            padding: "5px 15px",
            cursor: "pointer",
            border: "none",
            borderRadius: 3,
            background: "#2196F3",
            color: "white",
          }}
        >
          ↺ Restart
        </button>
      </div>
    </div>
  );
}
