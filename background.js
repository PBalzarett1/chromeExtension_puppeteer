chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ extensionEnabled: true, shortcuts: {} });
    console.log('Extension successfully installed and initialized.');
});

chrome.commands.onCommand.addListener((command) => {
    chrome.storage.local.get(['shortcuts', 'extensionEnabled'], (result) => {
        if (!result.extensionEnabled) {
            console.log('Extension is disabled. Enable the extension to execute scripts.');
            return;
        }
        const scriptDetails = result.shortcuts[command];
        if (scriptDetails && scriptDetails.enabled) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {action: "replay", data: JSON.stringify(scriptDetails)});
            });
        }
    });
});