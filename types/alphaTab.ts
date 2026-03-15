export interface AlphaTabApi {
  playPause: () => void;
  stop: () => void;
  print: () => void;
  render: () => void;
  updateSettings: () => void;
  destroy: () => void;
  countInVolume: number;
  metronomeVolume: number;
  isLooping: boolean;
  settings: {
    display: {
      scale: number;
      layoutMode: number;
      resources: {
        barNumberColor?: rgb
      }
    };
  };
}