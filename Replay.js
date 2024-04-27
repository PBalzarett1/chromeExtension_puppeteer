// Replay.js - Script to handle the replay of recorded actions in the ShurtcutExtension

// Retrieve initial HTML to restore it later
let initialHTML = document.body.innerHTML;

// Listen for messages from the extension background or popup script
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'replay') {
            replayActions(JSON.parse(message.data));
        }
    });
});
// Function to reset the HTML and start replaying the recorded steps
function replayRecording(recording) {
    const initialHTML = document.body.innerHTML;  // Move it here to capture the latest state before replay
    document.body.innerHTML = initialHTML;  // Reset the HTML to its original state
    const recordingElement = document.getElementById('recording');
    if (!recordingElement) {
        console.error('Recording element not found.');
        return;
    }
    if (message.action === 'replay') {
        try {
            replayRecording(JSON.parse(message.data));
        } catch (error) {
            console.error('Failed to parse recording data:', error);
        }
    }
    
    recordingElement.innerHTML = `Running ${recording.title}<br>`;
    replaySteps(recording.steps, recordingElement);
}

// Asynchronous function to replay each step with a delay
async function replaySteps(steps, recordingElement) {
    let content = '';
    for (let i = 0; i < steps.length; i++) {
        content += `Running step ${i}: ${JSON.stringify(steps[i])}<br>`;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    recordingElement.innerHTML = content; // Update once after all steps
}
