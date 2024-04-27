document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadRecordings(); // This will now correctly populate the shortcuts table
    setupButtonListener('recordBtn', startRecording);
    setupButtonListener('resetBtn', resetRecording, true); // Initially disabled
    setupButtonListener('saveBtn', handleFormSubmit);
});

function initializeEventListeners() {
    setupButtonListener('keyConfigBtn', () => toggleVisibility('keyConfigSection'));
    setupButtonListener('cancelBtn', stopRecording);

    const scriptFile = document.getElementById('scriptFile');
    if (scriptFile) {
        scriptFile.setAttribute('accept', '.json');
    } else {
        console.error('scriptFile element not found');
    }
}
function setupButtonListener(id, action, disable = false) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('click', action);
        if (disable) element.disabled = true;
    } else {
        console.error(`Element with ID '${id}' not found.`);
    }
}

// Include all other functions as before, ensuring to add error checks as demonstrated above.

let currentKeys = [];
let isRecording = false;
const maxKeys = 3; // Maximum number of keys to record


function startRecording() {
    if (!isRecording) {
        isRecording = true;
        currentKeys = []; // Reset keys array whenever recording starts
        document.getElementById('recordBtn').disabled = true;
        document.getElementById('resetBtn').disabled = false;
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }
}
function stopRecording() {
    isRecording = false;
    document.getElementById('recordPrompt').classList.add('hidden');
    document.getElementById('recordBtn').disabled = false;
    document.getElementById('resetBtn').disabled = true;
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
}

function resetRecording() {
    currentKeys = [];
    updateRecordedKeys();
    document.getElementById('recordBtn').disabled = false;
    document.getElementById('resetBtn').disabled = true;
    isRecording = false; // Ensure recording is stopped
}

function updateRecordedKeys() {
    const recordedKeyElement = document.getElementById('recordedShortcutKey');
    const redDotElement = document.getElementById('redDot'); // Ensure this is defined in HTML or handled if absent.
    
    if (recordedKeyElement && redDotElement) {
        recordedKeyElement.textContent = currentKeys.join(' + ') || 'None';
        redDotElement.style.color = currentKeys.length ? 'red' : 'black';
    } else {
        console.error('Essential UI elements for displaying recorded keys not found');
    }
}


function checkStopCondition() {
    // Implement logic to determine if recording should stop
    // For example, check if a specific key combination like Ctrl+Shift is released
    return currentKeys.length === 0; // Simple condition: stop if no keys are pressed
}

function handleKeyDown(event) {
    if (isRecording && currentKeys.length < maxKeys && !currentKeys.includes(event.key)) {
        currentKeys.push(event.key);
        updateRecordedKeys();
        if (currentKeys.length === maxKeys) {
            stopRecording(); // Stop recording if maximum keys are recorded
        }
    }
    event.preventDefault(); // Prevent default action to avoid any browser shortcut conflicts
}

function handleKeyUp(event) {
    const index = currentKeys.indexOf(event.key);
    if (index !== -1) {
        currentKeys.splice(index, 1);  // Remove the key from the list when it is released
    }
    updateRecordedKeys();

    // Check if all keys that were down have been released
    let allReleased = currentKeys.length === 0;  // This checks if the array is empty after removing the released key
    if (allReleased && isRecording) {
        stopRecording();  // Stop recording if all keys are released
    }
}

function updateRecordedKeys() {
    const recordedKeyElement = document.getElementById('recordedShortcutKey');
    if (recordedKeyElement) {
        recordedKeyElement.textContent = currentKeys.join(' + ') || 'None';
        document.getElementById('redDot').style.color = currentKeys.length ? 'red' : 'black';
    }
}
function loadRecordings() {
    chrome.storage.local.get('shortcuts', (result) => {
        if (chrome.runtime.lastError) {
            console.error('Failed to fetch shortcuts:', chrome.runtime.lastError);
            return;
        }

        const shortcuts = result.shortcuts || {};
        const tableBody = document.getElementById('shortcutsTable').querySelector('tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        // Iterate over each shortcut and add it to the table
        for (const key in shortcuts) {
            addShortcutToTable(key, shortcuts[key]);
        }
    });
}

function handleFileSelection(event) {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.json')) {
        alert('Please select a valid JSON (.json) file.');
        event.target.value = '';
        return false;
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    saveShortcut();
}

function saveShortcut() {
    const shortcutKeyElement = document.getElementById('recordedShortcutKey');
    const actionsJsonElement = document.getElementById('actionsJson');
    if (shortcutKeyElement && actionsJsonElement) {
        const actionsJson = actionsJsonElement.value;
        try {
            const actions = JSON.parse(actionsJson);
            chrome.storage.local.get({shortcuts: {}}, function(data) {
                const shortcuts = data.shortcuts;
                shortcuts[shortcutKeyElement.textContent] = actions;
                chrome.storage.local.set({shortcuts: shortcuts}, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving the shortcut:', chrome.runtime.lastError.message);
                        alert('Failed to save the shortcut.');
                    } else {
                        alert('Shortcut configuration saved successfully!');
                        addShortcutToTable(shortcutKeyElement.textContent, actions);
                    }
                });
            });
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            alert('Failed to parse JSON. Please check your input.');
        }
    } else {
        console.error('Essential elements for saving shortcuts not found');
    }
}

function addShortcutToTable(key, actions) {
    const tableBody = document.getElementById('shortcutsTable').querySelector('tbody');
    const row = tableBody.insertRow(-1);
    row.insertCell(0).textContent = key;
    row.insertCell(1).textContent = JSON.stringify(actions);
    row.insertCell(2).textContent = 'Enabled'; // Assuming the shortcut is enabled by default
    const modifyCell = row.insertCell(3);
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editShortcut(key));
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => confirmDelete(key));
    modifyCell.appendChild(editButton);
    modifyCell.appendChild(deleteButton);
}
function updateShortcutsList() {
    chrome.storage.local.get(['shortcuts'], function(result) {
        const shortcuts = result.shortcuts || {};
        const tableBody = document.getElementById('shortcutsTable').querySelector('tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        for (const [key, details] of Object.entries(shortcuts)) {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = key;
            
            // Check if 'script' is available and if it's in the expected format before accessing
            let scriptDisplay = 'No script available'; // Default text if script is undefined or not properly formatted
            if (details && details.script && typeof details.script === 'string') {
                scriptDisplay = details.script.substring(0, 50) + '...';
            } else if (details && typeof details === 'string') {
                // This condition handles cases where details directly contain the script as a string
                scriptDisplay = details.substring(0, 50) + '...';
            }

            row.insertCell(1).textContent = scriptDisplay;
            row.insertCell(2).textContent = details && details.enabled ? 'Enabled' : 'Disabled'; // Check if 'enabled' property exists

            const modifyCell = row.insertCell(3);
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editShortcut(key));
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => confirmDelete(key));
            modifyCell.appendChild(editButton);
            modifyCell.appendChild(deleteButton);
        }
    });
}

function editShortcut(key) {
    chrome.storage.local.get(['shortcuts'], function(result) {
        const shortcut = result.shortcuts[key];
        currentKeys = key.split(' + ');
        document.getElementById('enableShortcut').checked = shortcut.enabled;
        updateRecordedKeys();
        toggleVisibility(document.getElementById('keyConfigSection'));
    });
}

function confirmDelete(key) {
    if (confirm(`Are you sure you want to delete the shortcut "${key}"?`)) {
        chrome.storage.local.get(['shortcuts'], function(result) {
            const shortcuts = result.shortcuts;
            delete shortcuts[key];
            chrome.storage.local.set({shortcuts: shortcuts}, () => {
                updateShortcutsList();
                alert('Shortcut deleted successfully.');
            });
        });
    }
}

function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('open');
    }
}

document.getElementById('loadJsonBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('scriptFile'); // Ensure this is the correct ID for the file input element
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();

            reader.onload = function(event) {
                document.getElementById('actionsJson').value = event.target.result;
            };

            reader.onerror = function() {
                alert('Error reading file. Please try again.');
            };

            reader.readAsText(file);
        } else {
            alert('Please select a valid JSON file.');
        }
    } else {
        alert('No file selected or file input not found.');
    }
});
