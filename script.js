document.addEventListener('DOMContentLoaded', () => {
    const brokerInput = document.getElementById('broker');
    const connectBtn = document.getElementById('btn-connect');
    const disconnectBtn = document.getElementById('btn-disconnect');
    const statusSpan = document.getElementById('status');

    const pubTopicInput = document.getElementById('pub-topic');
    const pubPayloadTextarea = document.getElementById('pub-payload');
    const publishBtn = document.getElementById('btn-publish');

    const subTopicInput = document.getElementById('sub-topic');
    const subscribeBtn = document.getElementById('btn-subscribe');
    const unsubscribeBtn = document.getElementById('btn-unsubscribe');

    const messagesDiv = document.getElementById('messages');

    let client = null;
    let subscribedTopics = {};

    function logMessage(message, type = '') {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.className = `message ${type}`;
        messagesDiv.appendChild(p);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function setConnectionStatus(connected) {
        if (connected) {
            statusSpan.textContent = 'Connected';
            statusSpan.className = 'connected';
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            publishBtn.disabled = false;
            subscribeBtn.disabled = false;
        } else {
            statusSpan.textContent = 'Disconnected';
            statusSpan.className = 'disconnected';
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
            publishBtn.disabled = true;
            subscribeBtn.disabled = true;
            unsubscribeBtn.disabled = true;
            subscribedTopics = {};
        }
    }

    connectBtn.addEventListener('click', () => {
        const brokerUrl = brokerInput.value;
        if (!brokerUrl) {
            logMessage('Broker URL is required.', 'error');
            return;
        }

        logMessage(`Connecting to ${brokerUrl}...`);
        client = mqtt.connect(brokerUrl);

        client.on('connect', () => {
            logMessage('Successfully connected to broker.');
            setConnectionStatus(true);
        });

        client.on('message', (topic, payload) => {
            const message = `Received on topic '${topic}': ${payload.toString()}`;
            logMessage(message, 'received');
        });

        client.on('error', (err) => {
            logMessage(`Connection error: ${err}`, 'error');
            client.end();
            setConnectionStatus(false);
        });

        client.on('close', () => {
            logMessage('Connection closed.');
            setConnectionStatus(false);
        });
    });

    disconnectBtn.addEventListener('click', () => {
        if (client) {
            client.end();
        }
    });

    publishBtn.addEventListener('click', () => {
        const topic = pubTopicInput.value;
        const payload = pubPayloadTextarea.value;
        if (!topic) {
            logMessage('Publish topic is required.', 'error');
            return;
        }
        client.publish(topic, payload, (err) => {
            if (err) {
                logMessage(`Publish error: ${err}`, 'error');
            } else {
                logMessage(`Published to '${topic}': ${payload}`, 'published');
            }
        });
    });

    subscribeBtn.addEventListener('click', () => {
        const topic = subTopicInput.value;
        if (!topic) {
            logMessage('Subscribe topic is required.', 'error');
            return;
        }
        client.subscribe(topic, (err) => {
            if (err) {
                logMessage(`Subscribe error: ${err}`, 'error');
            } else {
                logMessage(`Subscribed to '${topic}'.`);
                subscribedTopics[topic] = true;
                unsubscribeBtn.disabled = false;
            }
        });
    });

    unsubscribeBtn.addEventListener('click', () => {
        const topic = subTopicInput.value;
        if (!topic) {
            logMessage('Unsubscribe topic is required.', 'error');
            return;
        }
        client.unsubscribe(topic, (err) => {
            if (err) {
                logMessage(`Unsubscribe error: ${err}`, 'error');
            } else {
                logMessage(`Unsubscribed from '${topic}'.`);
                delete subscribedTopics[topic];
                if (Object.keys(subscribedTopics).length === 0) {
                    unsubscribeBtn.disabled = true;
                }
            }
        });
    });
});
