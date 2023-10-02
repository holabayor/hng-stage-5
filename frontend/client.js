document.addEventListener('DOMContentLoaded', () => {
  const startRecordingBtn = document.getElementById('startRecording');
  const stopRecordingBtn = document.getElementById('stopRecording');

  let mediaRecorder;
  let videoId; // Store the video ID returned by the server
  let chunkInterval; // Interval to send chunks

  startRecordingBtn.addEventListener('click', async () => {
    console.log('Start button clicked');

    // Send a start signal to the backend server
    console.log('Sending start signal to the backend server');
    const startResponse = await fetch(
      'http://localhost:8000/api/start-recording',
      {
        method: 'POST',
      }
    );

    // Check if the response is successful
    if (!startResponse.ok) {
      console.error('Failed to start video recording');
      return;
    }

    // Get the video ID from the response
    videoId = await startResponse.json().then((response) => response.videoId);

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
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        console.log(
          'Data available. Sending chunk to the backend server...',
          event.data
        );

        const formData = new FormData();
        formData.append(
          'videoChunk',
          event.data,
          `video_chunk_${videoId}_${Date.now()}.webm`
        );

        // Send the chunk to the backend server using the POST method
        upload_res = await fetch('http://localhost:8000/api/upload-chunk', {
          method: 'POST',
          body: formData,
        });

        console.log('Chunk sent to the backend server', upload_res);
      }
    };

    // Start recording
    console.log('Starting screen recording');
    mediaRecorder.start();

    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;

    // Set an interval to send chunks every 30 seconds
    chunkInterval = setInterval(() => {
      if (mediaRecorder.state !== 'recording') {
        clearInterval(chunkInterval);
        return;
      }
      mediaRecorder.requestData(); // Trigger dataavailable event
    }, 5000); // Send a chunk every 30 seconds
  });

  stopRecordingBtn.addEventListener('click', async () => {
    console.log('Stop button clicked');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();

      // Send a stop signal to the backend server
      console.log('Sending stop signal to the backend server');
      const stopResponse = await fetch(
        'http://localhost:8000/api/stop-recording',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
          },
          body: JSON.stringify({ videoId }), // Send the video ID in the request body
        }
      );

      // Check if the response is successful
      if (!stopResponse.ok) {
        console.error('Failed to stop video recording');
        return;
      }

      startRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = true;

      // Clear the interval
      clearInterval(chunkInterval);
    }
  });
});
