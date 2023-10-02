document.addEventListener('DOMContentLoaded', () => {
  const startRecordingBtn = document.getElementById('startRecording');
  const stopRecordingBtn = document.getElementById('stopRecording');

  let mediaRecorder;
  let recordedChunks = [];

  startRecordingBtn.addEventListener('click', async () => {
    // Send a start signal to the server
    await fetch('http://localhost:3000/start-recording', { method: 'POST' });

    // Access the user's camera and microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log('Here is executed');
    // Create a MediaRecorder
    mediaRecorder = new MediaRecorder(stream);
    let chunksSent = 0; // Counter for sent chunks

    // Event handler for dataavailable
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log('Here the data is pushed', event.data);
      }
    };

    // Event handler for stopping recording
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });

      // Send each chunk to the server
      const formData = new FormData();
      formData.append('videoChunk', blob, 'video_chunk.webm');
      await fetch('http://localhost:3000/upload-chunk', {
        method: 'POST',
        body: formData,
      });

      // Send a stop signal to the server
      await fetch('http://localhost:3000/stop-recording', { method: 'POST' });
    };

    // Start recording
    mediaRecorder.start(300000);

    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
  });

  stopRecordingBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  });
});
