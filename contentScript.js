// contentScript.js for the Puppeteer Shortcut Chrome Extension

// Function to modify the DOM of the current page
function modifyDOM() {
    // Example: Change the background color of the page to light grey
    document.body.style.backgroundColor = "lightgrey";

    // Log to console
    console.log("DOM has been modified by the Puppeteer Shortcut Extension");

    // You can expand this function to perform more complex operations
    // such as inserting or modifying content, altering styles, etc.
}

// Function to display a custom notification within the webpage
function displayCustomNotification(message) {
    // Create notification container
    const notificationDiv = document.createElement('div');
    notificationDiv.style.position = 'fixed';
    notificationDiv.style.bottom = '20px';
    notificationDiv.style.right = '20px';
    notificationDiv.style.backgroundColor = '#f8d7da';
    notificationDiv.style.color = '#721c24';
    notificationDiv.style.border = '1px solid #f5c6cb';
    notificationDiv.style.padding = '10px';
    notificationDiv.style.borderRadius = '5px';
    notificationDiv.style.zIndex = '1000';
    notificationDiv.innerText = message;

    // Append to body
    document.body.appendChild(notificationDiv);

    // Automatically remove the notification after 3 seconds
    setTimeout(() => {
        document.body.removeChild(notificationDiv);
    }, 3000);
}

// Listening for messages from the background script or popup
chrome.storage.local.get(['modifyDOMOnLoad'], function(result) {
    if (result.modifyDOMOnLoad) {
        modifyDOM();
        displayCustomNotification("Puppeteer Shortcut Extension is active");
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        try {
            if (request.action === "modifyDOM") {
                modifyDOM();
                sendResponse({result: "DOM modified"});
            } else if (request.action === "notify") {
                displayCustomNotification(request.message);
                sendResponse({result: "Notification displayed"});
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({result: "Error", message: error.message});
        }
        return true;  // Will respond asynchronously
    }
);