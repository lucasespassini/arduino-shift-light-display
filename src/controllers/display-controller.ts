import five from "johnny-five";
import { appConfig } from "../config";
import { SevenSegmentDisplay } from "../hardware/seven-segment-display";
import type { TelemetryData } from "../types";
import { HardwareError } from "../utils/errors";
import { logger } from "../utils/logger";

export class DisplayController {
  private display?: SevenSegmentDisplay;
  private board: five.Board;

  constructor() {
    const boardOptions = appConfig.arduino.port
      ? { port: appConfig.arduino.port }
      : {};
    this.board = new five.Board(boardOptions);
    this.setupBoard();
  }

  private setupBoard(): void {
    this.board.on("ready", () => {
      logger.info("Arduino board ready");
      try {
        this.display = new SevenSegmentDisplay({
          a: new five.Led(appConfig.pins.segmentA),
          b: new five.Led(appConfig.pins.segmentB),
          c: new five.Led(appConfig.pins.segmentC),
          d: new five.Led(appConfig.pins.segmentD),
          e: new five.Led(appConfig.pins.segmentE),
          f: new five.Led(appConfig.pins.segmentF),
          g: new five.Led(appConfig.pins.segmentG),
          dp: new five.Led(appConfig.pins.segmentDP),
        });
        logger.info("Seven segment display initialized");
      } catch (error) {
        logger.error("Failed to initialize display", error);
        throw new HardwareError("Failed to initialize seven segment display");
      }
    });

    this.board.on("error", (error) => {
      logger.error("Arduino board error", error);
      throw new HardwareError(`Arduino board error: ${error}`);
    });
  }

  updateFromTelemetry(data: TelemetryData): void {
    if (!this.display) {
      logger.warn("Display not initialized yet");
      return;
    }

    const raw = data.sGearNumGears & 0x0f;
    const gear = raw === 15 ? -1 : raw;
    const maxGear = (data.sGearNumGears & 0xf0) >> 4;

    logger.debug("Updating display", { gear, maxGear });

    if (gear === -1) {
      this.display.display_N();
    } else if (gear === 0) {
      this.display.display_P();
    } else if (gear !== undefined) {
      this.display.displayDigit(gear);
    } else {
      this.display.turnOffAllSegments();
    }

    const ratio = data.sRpm / data.sMaxRpm;

    if (ratio >= appConfig.performance.rpmShiftThreshold) {
      this.display.activate_blink_dp();
    } else {
      this.display.deactivate_blink_dp();
    }
  }

  isReady(): boolean {
    return this.display !== undefined;
  }
}
