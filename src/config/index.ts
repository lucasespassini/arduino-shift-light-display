import { config } from "dotenv";
import { resolve } from "path";

config();

interface Config {
  udp: {
    port: number;
  };
  arduino: {
    port?: string;
  };
  pins: {
    segmentA: number;
    segmentB: number;
    segmentC: number;
    segmentD: number;
    segmentE: number;
    segmentF: number;
    segmentG: number;
    segmentDP: number;
    ledBuiltin: number;
  };
  logging: {
    level: "error" | "warn" | "info" | "debug";
  };
  performance: {
    rpmShiftThreshold: number;
  };
  paths: {
    definitionsFile: string;
  };
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const appConfig: Config = {
  udp: {
    port: getEnvNumber("UDP_PORT", 5606),
  },
  arduino: {
    port: process.env.ARDUINO_PORT || undefined,
  },
  pins: {
    segmentA: getEnvNumber("PIN_SEGMENT_A", 9),
    segmentB: getEnvNumber("PIN_SEGMENT_B", 3),
    segmentC: getEnvNumber("PIN_SEGMENT_C", 8),
    segmentD: getEnvNumber("PIN_SEGMENT_D", 2),
    segmentE: getEnvNumber("PIN_SEGMENT_E", 6),
    segmentF: getEnvNumber("PIN_SEGMENT_F", 7),
    segmentG: getEnvNumber("PIN_SEGMENT_G", 4),
    segmentDP: getEnvNumber("PIN_SEGMENT_DP", 5),
    ledBuiltin: getEnvNumber("PIN_LED_BUILTIN", 13),
  },
  logging: {
    level: getEnvString("LOG_LEVEL", "info") as Config["logging"]["level"],
  },
  performance: {
    rpmShiftThreshold: parseFloat(process.env.RPM_SHIFT_THRESHOLD || "0.95"),
  },
  paths: {
    definitionsFile: resolve(process.cwd(), "./SMS_UDP_Definitions.hpp"),
  },
};
