# Arduino Shift Light Display 🏎️

Arduino-based gear shift display system that receives UDP telemetry data from racing simulators and shows the current gear on a 7-segment display with a shift indicator light.

## 🔧 Requirements

- Node.js 18+
- Arduino Uno/Nano (or compatible)
- 7-segment display (common cathode or common anode)
- Jumper wires and appropriate resistors

## 📦 Installation

1. Clone the repository:

```bash
git clone <your-repository>
cd arduino-shift-light-display
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific settings.

## 🔌 Arduino Configuration

### Arduino IDE

1. Open Arduino IDE
2. Verify the correct port and board are selected
3. Navigate to `File > Examples > Firmata > StandardFirmataPlus`
4. Upload the sketch to the board

### Hardware Connections

Connect the 7-segment display to Arduino pins as configured in the `.env` file:

```
Segment A → Pin 9
Segment B → Pin 3
Segment C → Pin 8
Segment D → Pin 2
Segment E → Pin 6
Segment F → Pin 7
Segment G → Pin 4
Decimal Point → Pin 5
```

**Important:** Use appropriate resistors (220Ω - 1kΩ) in series with each LED to prevent damage.

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

This mode automatically restarts when you make code changes.

### Production Mode

```bash
npm start
```

## 🎮 Game Compatibility

This project has been tested with:

- Automobilista 2

Configure the game to send telemetry to `localhost:5606` (or the port configured in `.env`).

## 🐛 Troubleshooting

### Arduino Not Detected

- Verify that Firmata is installed on the Arduino
- Try specifying the port manually in `.env` (e.g., `ARDUINO_PORT=COM3` on Windows or `/dev/ttyUSB0` on Linux)

### Display Not Working Correctly

- Check pin connections
- Confirm you're using appropriate resistors
- Verify the display type (common cathode/anode) is correct

### Not Receiving UDP Data

- Confirm the game is configured to send telemetry
- Verify the UDP port is correct
- Check if a firewall is blocking the port

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
