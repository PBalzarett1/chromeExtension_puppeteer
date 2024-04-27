// Updated devtoolsPanel.js for ShurtcutExtension
(async () => {
    // Create a DevTools view that's more appropriately named for the ShurtcutExtension
    const view = await chrome.devtools.recorder.createView(
        'ShortcutReplay', 'Replay.html'
    );

    let latestRecording;

    // When the custom view is shown, send the latest recording to it if available
    view.onShown.addListener(() => {
        if (latestRecording) {
            chrome.runtime.sendMessage({latestRecording: JSON.stringify(latestRecording)});
        }
    });

    // Log when the view is hidden, no further action required
    view.onHidden.addListener(() => {
        console.log('ShortcutReplay view has been hidden');
    });

    // Define a RecorderPlugin class to manage recordings
    class RecorderPlugin {
        replay(recording) {
            latestRecording = recording;
            view.show();  // Show the custom view when replaying a recording
        }
    }

    // Register the plugin with a name that matches the extension's functionality
    chrome.devtools.recorder.registerRecorderExtensionPlugin(
        new RecorderPlugin(), 'ShortcutReplay'
    );
})();
