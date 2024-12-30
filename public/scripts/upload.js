const uploadButton = document.getElementById('uploadButton'); // Visible button
const imageInput = document.getElementById('imageInput'); // Hidden file input
const uploadStatus = document.getElementById('uploadStatus'); // Status message

// Utility function to set status with color
function setStatus(message, type) {
    uploadStatus.innerText = message; // Set the text
    uploadStatus.className = type; // Set the class (success or error)
}

// Trigger hidden file input when button is clicked
uploadButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form submission
    imageInput.click(); // Open file picker
});

// Automatically upload after file selection
imageInput.addEventListener('change', () => {
    // **Early Return if No File is Selected**
    if (imageInput.files.length === 0) {
        setStatus('No file selected.', 'error'); // Show error immediately
        return;
    }

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    // Update button text and status
    uploadButton.innerText = 'Uploading...';
    setStatus('Uploading...', ''); // No color during upload

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (!data.message) {
            throw new Error('Upload failed without a specific message.');
        }

        setStatus('Upload successful!', 'success');
        uploadButton.innerText = 'Upload a new image!';
        setTimeout(() => {
            location.reload(); // Refresh gallery
        }, 1000);
    })
    .catch((err) => {
        console.error('Error uploading the file:', err);
        setStatus(`Error uploading the file: ${err.message}`, 'error');
        uploadButton.innerText = 'Upload a new image!';
    });
});
