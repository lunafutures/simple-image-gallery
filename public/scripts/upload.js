const uploadButton = document.getElementById('uploadButton'); // Button that users sees for file input
const imageInput = document.getElementById('imageInput'); // Actual hidden file input
const uploadStatus = document.getElementById('uploadStatus'); // Status message of file upload

// Set the class of the status text based on good or bad status
function setStatus(message, type) {
    uploadStatus.innerText = message;
    uploadStatus.className = type;
}

// Trigger hidden file input when button is clicked, the user-visible button is a proxy for the real hidden input
uploadButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form submission
    imageInput.click(); // Open file picker
});

const ORIGINAL_TEXT = uploadButton.innerText;

// Automatically upload after file selection
imageInput.addEventListener('change', () => {
    // **Early Return if No File is Selected**
    if (imageInput.files.length === 0) {
        setStatus('No file selected.', 'error'); // Show error immediately
        return;
    }

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    uploadButton.innerText = 'Uploading...';
    setStatus('Uploading...', ''); // No color during upload

    fetch('upload', {
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
        uploadButton.innerText = ORIGINAL_TEXT;
        setTimeout(() => {
            location.reload(); // Refresh page
        }, 1000);
    })
    .catch((err) => {
        console.error('Error uploading the file:', err);
        setStatus(`Error uploading the file: ${err.message}`, 'error');
        uploadButton.innerText = ORIGINAL_TEXT;
    });
});
