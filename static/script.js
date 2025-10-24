document.addEventListener('DOMContentLoaded', () => {
    const brokerInput = document.getElementById('broker');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const connectBtn = document.getElementById('btn-connect');
    const disconnectBtn = document.getElementById('btn-disconnect');
    const statusSpan = document.getElementById('status');

    const pubTopicInput = document.getElementById('pub-topic');
    const pubPayloadTextarea = document.getElementById('pub-payload');
    const publishBtn = document.getElementById('btn-publish');

    const subTopicInput = document.getElementById('sub-topic');
    const subscribeBtn = document.getElementById('btn-subscribe');

    const messagesDiv = document.getElementById('messages');
    const subscriptionsList = document.getElementById('subscriptions-list');
    const clearMessagesBtn = document.getElementById('btn-clear-messages');

    let client = null;
    let subscribedTopics = {}; // To keep track of active subscriptions

    function logMessage(message, type = '') {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.className = `message ${type}`;
        messagesDiv.appendChild(p);
        // Ensure scroll to bottom after DOM update
        setTimeout(() => {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 0); // Small delay to allow rendering
    }

    clearMessagesBtn.addEventListener('click', () => {
        messagesDiv.innerHTML = '';
        logMessage('Message log cleared.', 'info');
    });

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
            // Clear all subscriptions from UI and internal state on disconnect
            subscribedTopics = {};
            subscriptionsList.innerHTML = '';
        }
    }

    function addSubscriptionToUI(topic) {
        if (subscribedTopics[topic]) {
            logMessage(`Already subscribed to '${topic}'.`, 'info');
            return;
        }

        const subscriptionItem = document.createElement('div');
        subscriptionItem.className = 'subscription-item';
        // Use a base64 encoded topic as ID for uniqueness and valid HTML ID
        subscriptionItem.id = `sub-${btoa(topic).replace(/=/g, '')}`;

        const topicSpan = document.createElement('span');
        topicSpan.textContent = topic;
        subscriptionItem.appendChild(topicSpan);

        const unsubscribeBtnItem = document.createElement('button');
        unsubscribeBtnItem.textContent = 'Unsubscribe';
        unsubscribeBtnItem.addEventListener('click', () => {
            client.unsubscribe(topic, (err) => {
                if (err) {
                    logMessage(`Unsubscribe error from '${topic}': ${err}`, 'error');
                } else {
                    logMessage(`Unsubscribed from '${topic}'.`);
                    delete subscribedTopics[topic];
                    subscriptionItem.remove(); // Remove from UI
                }
            });
        });
        subscriptionItem.appendChild(unsubscribeBtnItem);

        subscriptionsList.appendChild(subscriptionItem);
        subscribedTopics[topic] = true;
    }

    connectBtn.addEventListener('click', () => {
        const brokerUrl = brokerInput.value;
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!brokerUrl) {
            logMessage('Broker URL is required.', 'error');
            return;
        }

        logMessage(`Connecting to ${brokerUrl}...`);
        const options = {};
        if (username) {
            options.username = username;
        }
        if (password) {
            options.password = password;
        }

        client = mqtt.connect(brokerUrl, options);

        client.on('connect', () => {
            logMessage('Successfully connected to broker.');
            setConnectionStatus(true);
            // Optionally re-subscribe to previously active topics here if desired for better UX
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
        if (subscribedTopics[topic]) {
            logMessage(`Already subscribed to '${topic}'.`, 'info');
            return;
        }
        client.subscribe(topic, (err) => {
            if (err) {
                logMessage(`Subscribe error: ${err}`, 'error');
            } else {
                logMessage(`Subscribed to '${topic}'.`);
                addSubscriptionToUI(topic); // Add to UI list
                subTopicInput.value = ''; // Clear input
            }
        });
    });
});