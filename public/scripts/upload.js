const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton');

uploadButton.addEventListener('click', () => imageInput.click()); // Trigger hidden input
imageInput.addEventListener('change', () => {
    uploadButton.innerText = imageInput.files[0].name; // Show selected filename
});

const uploadStatus = document.getElementById('uploadStatus');

// Listen for file selection
imageInput.addEventListener('change', () => {
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    // Show status
    uploadStatus.innerHTML = 'Uploading...';

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            // Handle server-side HTTP errors
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            uploadStatus.innerHTML = 'Upload successful!';
            setTimeout(() => {
                location.reload(); // Reload the page to show the new image
            }, 1000);
        } else {
            throw new Error('Upload failed without a specific message.');
        }
    })
    .catch((err) => {
        console.error('Error uploading the file:', err); // Log error in the console
        uploadStatus.innerHTML = `Error uploading the file: ${err.message}`; // Show error in UI
    });
});
