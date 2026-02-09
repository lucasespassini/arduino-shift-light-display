import { appConfig } from "./config";
import { DisplayController } from "./controllers/display-controller";
import { UdpParser } from "./libs/udp-parser";
import { UdpServer } from "./services/udp-server";
import type { PacketStatistics, RaceData, TelemetryData } from "./types";
import { logger } from "./utils/logger";

/**
 * Arduino Shift Light Display
 *
 * Receives UDP telemetry data from racing simulators and displays
 * gear position on a seven-segment display with shift indicator.
 */
class Application {
  private parser: UdpParser;
  private displayController: DisplayController;
  private udpServer: UdpServer;

  constructor() {
    logger.info("Initializing Arduino Shift application");

    try {
      // Initialize UDP parser
      this.parser = new UdpParser(appConfig.paths.definitionsFile);
      logger.info("UDP parser initialized", {
        definitionsFile: appConfig.paths.definitionsFile,
      });

      // Initialize display controller
      this.displayController = new DisplayController();

      // Initialize UDP server
      this.udpServer = new UdpServer(this.parser);

      // Setup event handlers
      this.setupEventHandlers();
    } catch (error) {
      logger.error("Failed to initialize application", error);
      process.exit(1);
    }
  }

  private setupEventHandlers(): void {
    // Telemetry data handler
    this.parser.on("sTelemetryData_raw", (data: TelemetryData) => {
      try {
        this.displayController.updateFromTelemetry(data);
      } catch (error) {
        logger.error("Error processing telemetry data", error);
      }
    });

    // Race data handler (optional logging)
    this.parser.on("sRaceData_raw", (data: RaceData) => {
      logger.debug("Race data received", { data });
    });

    // Statistics handler (optional logging)
    this.parser.on("statistics", (data: PacketStatistics) => {
      logger.debug("Packet statistics", { data });
    });

    // Process error handlers
    process.on("SIGINT", () => {
      this.shutdown();
    });

    process.on("SIGTERM", () => {
      this.shutdown();
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception", error);
      this.shutdown(1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection", reason);
      this.shutdown(1);
    });
  }

  start(): void {
    logger.info("Starting application");
    this.udpServer.start();
    logger.info("Application started successfully");
  }

  private shutdown(exitCode = 0): void {
    logger.info("Shutting down application");
    try {
      this.udpServer.stop();
      logger.info("Application stopped successfully");
    } catch (error) {
      logger.error("Error during shutdown", error);
    }
    process.exit(exitCode);
  }
}

// Start the application
const app = new Application();
app.start();
