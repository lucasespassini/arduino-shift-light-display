import events from "events";
import fs from "fs";
import { PacketCategoryStatistics } from "./packet-category-statistics";
import { ParseableVariable } from "./parseable-variable";
import { Struct } from "./struct";

export class UdpParser extends events.EventEmitter {
  globalDefineDict: Record<string, number>;
  allStructsDict: Record<string, Struct>;
  packetSizeToStruct: Record<number, Struct>;
  categoryStatistics: Record<string, PacketCategoryStatistics>;
  packetIdToStruct: string[];

  constructor(definitionsFile: string) {
    super();

    if (!fs.existsSync(definitionsFile)) {
      throw new Error("Definitions file does not exist");
    }

    const fileContent = fs.readFileSync(definitionsFile, { encoding: "utf-8" });
    const lineSplitted = fileContent.split(/\r?\n/);

    // read global defines
    const globalDefineLines = lineSplitted
      .filter((value) => {
        return value.match(/\s*#define/);
      }) // get all lines with #define
      .map((value) => {
        return value.replace(/\s+/g, " ");
      }) // removed multiple spaces
      .map((value) => {
        return value.split(/\s/);
      }) // split to #define NAME VALUE
      .filter((value) => {
        return value.length > 2;
      }); // omit defines without value

    this.globalDefineDict = {};

    globalDefineLines.forEach((line) => {
      this.globalDefineDict[line[1] || ""] = parseInt(line[2] || "");
    });

    // get structs
    const allStructs = fileContent.match(/struct \w+\s*\{[^\}]*\};/g);
    let allStructsDict: Record<string, Struct> = {};

    allStructs?.map((struct) => {
      const structLines = struct.split(/\r?\n/);
      const structName = structLines[0]?.replace(/\s*struct\s*/g, "").trim();
      const varLines = structLines.filter((line) => {
        return !line.match(/struct \w+\s*/) && !line.match("[^]*[\}|\{}][^]*");
      });
      const varLinesWithoutComments = varLines.map((line) => {
        return line.replace(/\/\/[^]*/g, "");
      });
      const varLinesSplitted = varLinesWithoutComments.map((line) => {
        return (" " + line)
          .replace(/\s+/g, " ")
          .replace(/;/, "")
          .trim()
          .split(" ");
      });
      let packetSize = -1;

      let structDict: Record<string, ParseableVariable> = {};

      varLinesSplitted.forEach((line) => {
        if (!line[0]) return;

        if (!line[1]) return;

        if (
          line[0] === "static" &&
          line[1] === "const" &&
          line[2] === "unsigned"
        ) {
          packetSize = parseInt(line[line.length - 1] || "");
          return;
        }

        const doubleNameType = line[0] === "unsigned" || line[0] === "signed";
        let type = line[0];
        if (doubleNameType) {
          type = type + " " + line[1];
        }

        const rawVarName = doubleNameType ? line[2] : line[1];

        const splitVarName = rawVarName?.split("[") || [];
        const clearVarName = splitVarName[0];
        const arrayDepths: number[] = [];
        for (let i = 1; i < splitVarName.length; i++) {
          const arrayDepth =
            parseInt(splitVarName[i]?.replace(/\]/, "") || "") ||
            this.globalDefineDict[splitVarName[i]?.replace(/\]/, "") || ""];
          if (!arrayDepth) continue;
          arrayDepths.push(arrayDepth);
        }

        structDict[clearVarName || ""] = new ParseableVariable(
          clearVarName || "",
          type,
          arrayDepths,
        );
      });

      if (structName) {
        allStructsDict[structName] = new Struct(
          structDict,
          structName,
          packetSize,
        );
      }
    });
    this.allStructsDict = allStructsDict;

    this.packetSizeToStruct = {};
    this.categoryStatistics = {};

    for (const structName in allStructsDict) {
      const struct = allStructsDict[structName];
      if (struct?.packetSize && struct.packetSize > 0) {
        this.packetSizeToStruct[struct.packetSize] = struct;
        struct.getParser(allStructsDict);
        this.categoryStatistics[structName] = new PacketCategoryStatistics(
          structName,
        );
      }
    }

    this.packetIdToStruct = [
      "sTelemetryData",
      "sRaceData",
      "sParticipantsData",
      "sTimingsData",
      "sGameStateData",
      "",
      "",
      "sTimeStatsData",
      "sParticipantVehicleNamesData",
    ];

    setInterval(() => this.sendStatistics(), 1000);
  }

  pushBuffer(buffer: Buffer): void {
    const base = this.parseBase(buffer);
    // TODO add new definitions file
    // there is something wrong with version since patch 4
    if (true) {
      const structName = this.packetIdToStruct[base.mPacketType];
      this.categoryStatistics[structName || ""]?.push(
        base.mCategoryPacketNumber,
      );
      // this.emit('statistics',this.categoryStatistics);
      const parsed = this.parseType(buffer, structName || "");
      this.emit(structName + "_raw", parsed);

      if (structName === "sTelemetryData") {
        // console.log(parsed);
        // console.log(buffer.length)
      }
    }
  }

  sendStatistics(): void {
    this.emit("statistics", this.categoryStatistics);
  }

  parseBase(buffer: Buffer): any {
    return this.parseType(buffer, "PacketBase");
  }

  parseType(buffer: Buffer, type: string): any {
    return this.allStructsDict[type]
      ?.getParser(this.allStructsDict)
      .parse(buffer);
  }

  port(): number {
    return this.globalDefineDict["SMS_UDP_PORT"] || 5606;
  }
}
