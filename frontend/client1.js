document.addEventListener('DOMContentLoaded', () => {
  const startRecordingBtn = document.getElementById('startRecording');
  const stopRecordingBtn = document.getElementById('stopRecording');

  let mediaRecorder;
  let recordedChunks = [];
  let videoId;

  startRecordingBtn.addEventListener('click', async () => {
    console.log('Start button clicked');
    // Send a start signal to the server
    const startResponse = await fetch(
      'http://localhost:8000/api/start-recording',
      {
        method: 'POST',
      }
    );

    if (startResponse.ok) {
      const responseJson = await startResponse.json();
      videoId = responseJson.videoId; // Store the UUID
      console.log(`Received UUID from server: ${videoId}`);
    } else {
      console.error('Failed to receive UUID from server');
      return;
    }

    // Access the user's camera and microphone
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    console.log('Here is executed');
    // Create a MediaRecorder
    mediaRecorder = new MediaRecorder(stream);
    let chunksSent = 0; // Counter for sent chunks

    // Event handler for dataavailable
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        // Send each chunk to the server
        console.log('Here the data is pushed', event.data);
        const formData = new FormData();
        formData.append(
          'videoChunk',
          event.data,
          `video_chunk_${chunksSent}.web}`
        );
        formData.append('videoId', videoId);
        await fetch('http://localhost:8000/api/upload-chunk', {
          method: 'POST',
          body: formData,
        });
      }
    };

    // Event handler for stopping recording
    mediaRecorder.onstop = async () => {
      // Send a stop signal to the server
      const resp = await fetch('http://localhost:8000/api/stop-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify({ videoId }), // Serialize videoId as JSON
      });
      console.log('Here the response is', resp);
    };

    // Start recording
    mediaRecorder.start();

    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;

    // Send a chunk every 2 seconds
    setInterval(() => {
      if (mediaRecorder.state !== 'recording') {
        return;
      }
      mediaRecorder.requestData(); // Trigger dataavailable event
      chunksSent++;
      console.log(`Sent ${chunksSent} chunks`);
    }, 2000);
  });

  stopRecordingBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  });
});
