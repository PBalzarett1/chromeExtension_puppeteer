document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateShortcutsList(); // Initialize table with current data
});

function initializeEventListeners() {
    setupButtonListener('keyConfigBtn', function() { toggleVisibility('keyConfigSection'); });
    setupButtonListener('cancelBtn', stopRecording);
}

function setupButtonListener(button, event) {
    const btn = document.getElementById(button + 'Btn');
    btž.addEventListener('click', event);
}

function updateShortcutsList() {
    const sh