import five from "johnny-five";
import { appConfig } from "../config";

interface SevenSegmentDisplayProps {
  a: five.Led;
  b: five.Led;
  c: five.Led;
  d: five.Led;
  e: five.Led;
  f: five.Led;
  g: five.Led;
  dp: five.Led;
}

/**
 * Seven Segment Display Controller
 *
 * Segment layout:
 *    ___
 *     A
 *  |F   B|
 *     G
 *  |E   C|
 *     D   DP
 */
export class SevenSegmentDisplay {
  private readonly LED_BUILTIN: five.Led;

  private a!: five.Led;
  private b!: five.Led;
  private c!: five.Led;
  private d!: five.Led;
  private e!: five.Led;
  private f!: five.Led;
  private g!: five.Led;
  private dp!: five.Led;

  private digitToSegmentsMap: Record<number, () => void> = {
    0: this.display_0,
    1: this.display_1,
    2: this.display_2,
    3: this.display_3,
    4: this.display_4,
    5: this.display_5,
    6: this.display_6,
    7: this.display_7,
    8: this.display_8,
    9: this.display_9,
  };

  constructor(segments: SevenSegmentDisplayProps) {
    Object.assign(this, segments);
    this.LED_BUILTIN = new five.Led(appConfig.pins.ledBuiltin);
    this.LED_BUILTIN.off();
  }

  public displayDigit(digit: number): void {
    this.digitToSegmentsMap[digit]?.call(this);
  }

  public turnOffAllSegments(): void {
    this.a.off();
    this.b.off();
    this.c.off();
    this.d.off();
    this.e.off();
    this.f.off();
    this.g.off();
    this.dp.off();
  }

  private display_0(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.c.on();
    this.d.on();
    this.e.on();
    this.f.on();
  }

  private display_1(): void {
    this.turnOffAllSegments();
    this.b.on();
    this.c.on();
  }

  private display_2(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.d.on();
    this.e.on();
    this.g.on();
  }

  private display_3(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.c.on();
    this.d.on();
    this.g.on();
  }

  private display_4(): void {
    this.turnOffAllSegments();
    this.b.on();
    this.c.on();
    this.f.on();
    this.g.on();
  }

  private display_5(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.c.on();
    this.d.on();
    this.f.on();
    this.g.on();
  }

  private display_6(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.c.on();
    this.d.on();
    this.e.on();
    this.f.on();
    this.g.on();
  }

  private display_7(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.c.on();
  }

  private display_8(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.c.on();
    this.d.on();
    this.e.on();
    this.f.on();
    this.g.on();
  }

  private display_9(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.c.on();
    this.d.on();
    this.f.on();
    this.g.on();
  }

  public activate_blink_dp(): void {
    if (!this.dp.isRunning) {
      this.dp.blink();
      this.LED_BUILTIN.blink();
    }
  }

  public deactivate_blink_dp(): void {
    this.dp.stop().off();
    this.LED_BUILTIN.stop().off();
  }

  public display_P(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.e.on();
    this.f.on();
    this.g.on();
  }

  public display_N(): void {
    this.turnOffAllSegments();
    this.a.on();
    this.b.on();
    this.c.on();
    this.e.on();
    this.f.on();
  }
}
