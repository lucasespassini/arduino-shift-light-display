export interface TelemetryData {
  sGearNumGears: number;
  sRpm: number;
  sMaxRpm: number;
}

export interface RaceData {
  // Add specific race data fields based on your SMS_UDP_Definitions.hpp
  [key: string]: unknown;
}

export interface PacketStatistics {
  category: string;
  count: number;
  bytesReceived: number;
}

export interface DisplaySegments {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
  e: boolean;
  f: boolean;
  g: boolean;
  dp: boolean;
}

export enum GearState {
  REVERSE = -1,
  NEUTRAL = 0,
}
