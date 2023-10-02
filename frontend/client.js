document.addEventListener('DOMContentLoaded', () => {
  const startRecordingBtn = document.getElementById('startRecording');
  const stopRecordingBtn = document.getElementById('stopRecording');

  let mediaRecorder;
  let videoId; // Store the UUID received from the server
  let chunkInterval; // Interval to send chunks

  startRecordingBtn.addEventListener('click', async () => {
    console.log('Start button clicked');

    // Send a start signal to the server
    console.log('Sending start signal to the server');
    const startResponse = await fetch('http://localhost:3000/start-recording', {
      method: 'POST',
    });

    // Check if the response contains a UUID
    if (startResponse.ok) {
      const responseJson = await startResponse.json();
      videoId = responseJson.videoId; // Store the UUID
      console.log(`Received UUID from server: ${videoId}`);
    } else {
      console.error('Failed to receive UUID from server');
      return;
    }

    // Create a MediaStream for screen recording (you might need to implement this part)
    console.log('Accessing screen recording');
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true, // Capture screen video
      audio: true, // Capture audio
    });

    // Create a MediaRecorder
    console.log('Creating MediaRecorder');
    mediaRecorder = new MediaRecorder(screenStream);

    // Event handler for dataavailable
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('Data available. Sending chunk to the server...');

        const formData = new FormData();
        formData.append(
          'videoChunk',
          event.data,
          `screen_chunk_${Date.now()}.webm`
        );

        // Append the UUID to the FormData
        formData.append('videoId', videoId);

        // Use Fetch API to send the chunk immediately to the server
        fetch('http://localhost:3000/upload-chunk', {
          method: 'POST',
          body: formData,
        });

        console.log('Chunk sent to the server');
      }
    };

    // Start recording
    console.log('Starting screen recording');
    mediaRecorder.start(50000); // Record for 50 seconds

    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;

    // Set an interval to send chunks every 30 seconds
    chunkInterval = setInterval(() => {
      mediaRecorder.requestData(); // Trigger dataavailable event
    }, 30000); // Send a chunk every 30 seconds
  });

  stopRecordingBtn.addEventListener('click', async () => {
    console.log('Stop button clicked');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();

      // Send a stop signal to the server
      console.log('Sending stop signal to the server');
      const stopResponse = await fetch('http://localhost:3000/stop-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify({ videoId }), // Send the UUID in the request body
      });

      if (stopResponse.ok) {
        console.log('Screen recording stopped');
      } else {
        console.error('Failed to stop screen recording');
      }

      startRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = true;

      // Clear the interval
      clearInterval(chunkInterval);
    }
  });
});
