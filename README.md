# Simple MQTT Web Client

A lightweight, zero-dependency web-based client for interacting with MQTT brokers. This tool allows you to connect, publish, and subscribe to MQTT topics directly from your web browser, making it ideal for quick testing and debugging of MQTT-based applications.

## Features

- **Connect & Disconnect**: Establish and close connections to any MQTT broker that supports WebSockets.
- **Publish**: Send messages to a specified topic.
- **Subscribe & Unsubscribe**: Subscribe to topics to receive messages and unsubscribe when done. Supports wildcards (`+`, `#`).
- **Message Log**: View real-time status updates, published messages, and incoming messages from subscribed topics.
- **Standalone**: Runs entirely in the browser with no installation or build process required.

## How to Use

1.  Clone or download this repository.
2.  Open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

That's it! The client is ready to use.

## Prerequisites

For this client to work, you need an MQTT broker that is configured to accept connections over the WebSocket protocol.

### Broker URL Format

The broker URL must start with `ws://` or `wss://` (for secure connections).

- **Example Public Broker**: `ws://broker.hivemq.com:8000/mqtt`
- **Example Local Broker**: `ws://localhost:9001/mqtt`

### Example Mosquitto Configuration

If you are using Mosquitto as your broker, ensure your configuration file (`mosquitto.conf`) includes a listener for WebSockets. For example:

```conf
# Default listener for standard MQTT
listener 1883

# Additional listener for WebSockets
listener 9001
protocol websockets
```

After adding this, restart your Mosquitto broker.

## File Structure

-   `index.html`: The main HTML file containing the structure of the web interface.
-   `style.css`: Provides the styling for a clean and user-friendly layout.
-   `script.js`: Contains all the client-side logic for handling MQTT connections, publishing, and subscribing using the [MQTT.js](https://github.com/mqttjs/MQTT.js) library (loaded from a CDN).
