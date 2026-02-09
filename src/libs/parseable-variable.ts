import { Parser } from "binary-parser";

const typesDict = {
  "signed char": (parser: Parser, name: string) => {
    return parser.int8(name);
  },
  "unsigned char": (parser: Parser, name: string) => {
    return parser.uint8(name);
  },
  char: (parser: Parser, name: string) => {
    return parser.int8(name);
  },

  "signed short": (parser: Parser, name: string) => {
    return parser.int16le(name);
  },
  "unsigned short": (parser: Parser, name: string) => {
    return parser.uint16le(name);
  },

  "signed int": (parser: Parser, name: string) => {
    return parser.int32le(name);
  },
  "unsigned int": (parser: Parser, name: string) => {
    return parser.uint32le(name);
  },

  float: (parser: Parser, name: string) => {
    return parser.floatle(name);
  },
};

export class ParseableVariable {
  varName: string;
  varType: string;
  arraySize: number[];

  constructor(varName: string, varType: string, arraySize: number[]) {
    this.varName = varName;
    this.varType = varType;
    this.arraySize = arraySize;
  }

  appendToParser(parser: Parser, otherStructs: Record<string, any>): any {
    if (!parser) throw new Error("Parser missing");

    if (this.varType === "char" && this.arraySize.length === 1) {
      return parser.string(this.varName, {
        encoding: "utf8",
        length: this.arraySize[0],
      });
    }

    if (this.varType === "char" && this.arraySize.length === 2) {
      return parser.array(this.varName, {
        type: new Parser().string("", {
          encoding: "utf8",
          length: this.arraySize[1],
        }),
        length: this.arraySize[0],
      });
    }

    // e.g. unsigned int
    if (
      typesDict[this.varType as keyof typeof typesDict] &&
      this.arraySize.length === 0
    ) {
      return typesDict[this.varType as keyof typeof typesDict].call(
        null,
        parser,
        this.varName,
      );
    }

    if (
      typesDict[this.varType as keyof typeof typesDict] &&
      this.arraySize.length === 1
    ) {
      return parser.array(this.varName, {
        type: typesDict[this.varType as keyof typeof typesDict](
          new Parser().endianness("little"),
          "",
        ),
        length: this.arraySize[0],
      });
    }

    // e.g. sBase
    if (this.arraySize.length === 0) {
      return parser.nest(this.varName, {
        type: otherStructs[this.varType].getParser(otherStructs, true),
      });
    }

    if (this.arraySize.length === 1) {
      return parser.array(this.varName, {
        type: otherStructs[this.varType].getParser(otherStructs, true),
        length: this.arraySize[0],
      });
    }

    throw new Error("Variable could not be parsed");
  }
}
