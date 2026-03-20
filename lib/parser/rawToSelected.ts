import { alphaTab } from "@coderline/alphatab/vite";

interface ParserConfig {
  verbose?: boolean;
  customKeywords?: string[];
}

interface TrackInfo {
  number: number;
  name: string;
  instrument: string;
}

interface ParsedTrack {
  name: string;
  instrument: string;
  lines: string[];
  startLine: number;
}

class AlphaTexGuitarParser {
  private readonly guitarKeywords: string[];
  private config: ParserConfig;

  constructor(config: ParserConfig = {}) {
    this.config = {
      verbose: true,
      ...config,
    };

    this.guitarKeywords = [
      "guitar",
      "e-gt",
      "s-gt",
      "distortion",
      "overdriven",
      "clean",
      "distortionguitar",
      "electric",
      "acoustic",
      "steel",
      "nylon",
      "jazz",
      "rock",
      "metal",
      "lead",
      "rhythm",
      "muted",
      "harmonics",
      "feedback",
      "chorus",
      "funk",
      "hawaiian",
      "mid tone",
      "pinch",
      "overdrive",
      "bass",
      "ukulele",
      "mandolin",
      "banjo",
      ...(config.customKeywords || []),
    ];
  }

  /**
   * Get list of all guitar tracks with their details
   */
  public listGuitarTracks(alphaTexString: string): TrackInfo[] {
    const tracks = this.parseTracks(alphaTexString);
    const guitarTracks = tracks.filter((track) =>
      this.isGuitarTrack(track.lines),
    );

    return guitarTracks.map((track, idx) => ({
      number: idx + 1,
      name: track.name,
      instrument: track.instrument,
    }));
  }

  /**
   * Extract a specific guitar track
   */
  public extractGuitarTrack(
    alphaTexString: string,
    selection: number | string,
  ): { success: boolean; content?: string; error?: string; trackName?: string } {
    try {
      const tracks = this.parseTracks(alphaTexString);
      const guitarTracks = tracks.filter((track) =>
        this.isGuitarTrack(track.lines),
      );

      if (guitarTracks.length === 0) {
        return { success: false, error: "No guitar tracks found in the AlphaTex content" };
      }

      // Find selected track
      let selectedTrack: ParsedTrack | undefined;

      if (typeof selection === "number") {
        // Selection by number (1-based)
        if (selection >= 1 && selection <= guitarTracks.length) {
          selectedTrack = guitarTracks[selection - 1];
        }
      } else {
        // Selection by name (case-insensitive partial match)
        const lowerSel = selection.toLowerCase();
        selectedTrack = guitarTracks.find(
          (track) =>
            track.name.toLowerCase().includes(lowerSel) ||
            track.instrument.toLowerCase().includes(lowerSel),
        );
      }

      if (!selectedTrack) {
        const availableTracks = guitarTracks
          .map((t, i) => `${i + 1}. ${t.name} (${t.instrument})`)
          .join("\n");
        return {
          success: false,
          error: `Could not find guitar track matching: ${selection}\n\nAvailable tracks:\n${availableTracks}`,
        };
      }

      if (this.config.verbose) {
        console.log(
          `\n✅ Extracted: ${selectedTrack.name} (${selectedTrack.instrument})`,
        );
      }

      // Extract header (everything before first track)
      const header = this.extractHeader(alphaTexString);

      // Combine header with selected track
      const content = [...header, ...selectedTrack.lines].join("\n");

      return {
        success: true,
        content,
        trackName: selectedTrack.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }

  // Private methods
  private parseTracks(alphaTexString: string): ParsedTrack[] {
    const lines = alphaTexString.split("\n");
    const tracks: ParsedTrack[] = [];

    let inTrack = false;
    let currentTrack: string[] = [];
    let currentTrackName = "";
    let currentTrackStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      const trimmed = line.trim();

      if (this.isTrackStart(trimmed)) {
        if (inTrack && currentTrack.length > 0) {
          tracks.push({
            name: currentTrackName,
            instrument: this.extractInstrumentInfo(currentTrack),
            lines: [...currentTrack],
            startLine: currentTrackStartLine,
          });
        }

        inTrack = true;
        currentTrack = [line];
        currentTrackStartLine = i;
        currentTrackName = this.extractTrackName(line);
      } else if (inTrack) {
        currentTrack.push(line);

        if (trimmed === "}") {
          tracks.push({
            name: currentTrackName,
            instrument: this.extractInstrumentInfo(currentTrack),
            lines: [...currentTrack],
            startLine: currentTrackStartLine,
          });
          inTrack = false;
          currentTrack = [];
        }
      }
    }

    return tracks;
  }

  private extractHeader(alphaTexString: string): string[] {
    const lines = alphaTexString.split("\n");
    const header: string[] = [];

    for (const line of lines) {
      if (line === undefined) continue;
      if (this.isTrackStart(line.trim())) {
        break;
      }
      header.push(line);
    }

    return header;
  }

  private isTrackStart(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      lowerLine.startsWith("\\track") ||
      lowerLine.startsWith("[track]") ||
      lowerLine.startsWith("track")
    );
  }

  private isGuitarTrack(trackLines: string[]): boolean {
    return trackLines.some((line) => this.isGuitarInstrument(line));
  }

  private isGuitarInstrument(text: string): boolean {
    const lowerText = text.toLowerCase();

    // Check for explicit guitar
    if (lowerText.includes("guitar") && !lowerText.includes("piano")) {
      return true;
    }

    // Check keywords
    return this.guitarKeywords.some(
      (keyword) =>
        lowerText.includes(keyword) &&
        !lowerText.includes("piano") &&
        !lowerText.includes("drum") &&
        !lowerText.includes("flute") &&
        !lowerText.includes("violin"),
    );
  }

  private extractTrackName(line: string): string {
    const match = line.match(/\("([^"]+)"\s+"([^"]+)"\)/);
    if (match) {
      return `${match[1]} (${match[2]})`;
    }

    const simpleMatch = line.match(/track\s+"([^"]+)"/i);
    if (simpleMatch) {
      return simpleMatch[1];
    }

    return "Unknown Track";
  }

  private extractInstrumentInfo(trackLines: string[]): string {
    for (const line of trackLines) {
      if (line.toLowerCase().includes("instrument")) {
        const match = line.match(/instrument\s+([^\s{]+)/i);
        if (match) {
          return match[1];
        }
      }
    }
    return "Unknown";
  }
}

/**
 * Main parser function
 * @param text - The AlphaTex content string
 * @param name - Track name or number to extract (e.g., "Lead", "Acoustic", or "1")
 * @returns Extracted guitar track content or error message
 */
export default function parser(text: string, name: string): string {
  console.log("\n🎸 AlphaTex Guitar Track Extractor\n");

  const parser = new AlphaTexGuitarParser({ verbose: true });

  try {
    // First, check if it's a number or string selection
    let selection: number | string = name;
    
    // Try to parse as number if it's a numeric string
    if (!isNaN(Number(name)) && name.trim() !== "") {
      selection = Number(name);
    }

    // List available tracks for debugging
    console.log("Available guitar tracks:");
    const tracks = parser.listGuitarTracks(text);
    
    if (tracks.length === 0) {
      throw new Error("No guitar tracks found in the AlphaTex content");
    }
    
    tracks.forEach((track) => {
      console.log(`  ${track.number}. ${track.name} (${track.instrument})`);
    });

    // Extract the selected track
    console.log(`\n--- Extracting track: ${name} ---`);
    const result = parser.extractGuitarTrack(text, selection);
    
    if (result.success && result.content) {
      console.log(`✅ Successfully extracted: ${result.trackName}`);
      return result.content;
    } else {
      throw new Error(result.error || "Unknown error occurred");
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Error:", errorMessage);
    return `Error: ${errorMessage}`;
  }
}

// Optional: Export the class for more advanced usage
export { AlphaTexGuitarParser, type ParserConfig, type TrackInfo };