import dgram from "dgram";
import type { UdpParser } from "../libs/udp-parser";
import { NetworkError } from "../utils/errors";
import { logger } from "../utils/logger";

export class UdpServer {
  private socket: dgram.Socket;
  private parser: UdpParser;

  constructor(parser: UdpParser) {
    this.parser = parser;
    this.socket = dgram.createSocket("udp4");
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.socket.on("error", (err) => {
      logger.error("UDP socket error", err);
      throw new NetworkError(`UDP socket error: ${err.message}`);
    });

    this.socket.on("message", (msg, info) => {
      logger.debug("Received UDP message", {
        from: info.address,
        port: info.port,
        size: msg.length,
      });
      this.parser.pushBuffer(msg);
    });

    this.socket.on("listening", () => {
      const address = this.socket.address();
      logger.info("UDP server listening", {
        address: address.address,
        port: address.port,
      });
    });
  }

  start(): void {
    const port = this.parser.port();
    logger.info(`Starting UDP server on port ${port}`);
    this.socket.bind(port);
  }

  stop(): void {
    logger.info("Stopping UDP server");
    this.socket.close();
  }
}
