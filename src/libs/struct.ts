import { Parser } from "binary-parser";
import { ParseableVariable } from "./parseable-variable";

export class Struct {
  valueDict: Record<string, ParseableVariable>;
  name: string;
  packetSize: number;
  parser: Parser | null;

  constructor(
    valueDict: Record<string, ParseableVariable>,
    name: string,
    packetSize: number,
  ) {
    this.valueDict = valueDict;
    this.name = name;
    this.packetSize = packetSize;
    this.parser = null;
  }

  getParser(otherStructs: Record<string, Struct>, nested?: boolean): Parser {
    if (this.parser) return this.parser;

    let p = new Parser();

    for (const varName in this.valueDict) {
      const variable = this.valueDict[varName];
      p = variable?.appendToParser(p, otherStructs);
      if (!p) throw new Error("Invalid parser returned " + p);
    }

    this.parser = p;
    return p;
  }
}
