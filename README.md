# HNGx Task 5

## HelpMeOut API

This API provides the functionality to record and transcribe videos in chunks and retrieve video details along with transcription and subtitle data.

It is deployed on Render at https://helpmeout.onrender.com/api

### Getting Started

These instructions will help you set up and use the API locally or on a server.

#### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

#### Installation

1. Clone the repository:

   ```
   git clone https://github.com/holabayor/hng-stage-5.git
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory of the project and add the following environment variables:

   ```
   API_KEY=deepgram_api_key
   ```

4. Start the server:

   ```
    npm start
   ```

## Endpoints

### Start Recording

- **URL**: `/start-recording`
- **Method**: `POST`
- **Description**: Start recording a new video.
- **Request Body**: None
- **Response**:
  - `200 OK`: The recording has started successfully. Returns a JSON object with a `videoId` for the new video.
  - `400 Bad Request`: If there is an error starting the recording.

### Upload Chunk

- **URL**: `/upload-chunk`
- **Method**: `POST`
- **Description**: Upload a video chunk.
- **Request Body**: A video chunk file (use the `videoChunk` field in a `multipart/form-data` form).
- **Response**:
  - `200 OK`: The chunk has been successfully received and stored.
  - `400 Bad Request`: If the uploaded file is invalid.

### Stop Recording

- **URL**: `/stop-recording`
- **Method**: `POST`
- **Description**: Stop recording the video and transcribe it.
- **Request Body**: A JSON object containing the `videoId` (generated during the "Start Recording" step).
- **Response**:
  - `200 OK`: The video has been successfully transcribed. Returns video details, transcription, and subtitle data.
  - `400 Bad Request`: If there is an issue with the request.
  - `500 Internal Server Error`: If there is an internal server error.

### Get Video Details

- **URL**: `/videos/:id`
- **Method**: `GET`
- **Description**: Retrieve video details, including transcription and subtitle data.
- **URL Parameters**: `:id` - The unique identifier of the video.
- **Response**:
  - `200 OK`: Video details are successfully retrieved. Returns video size, transcription, and subtitle data.
  - `404 Not Found`: If the video with the specified ID does not exist.
  - `500 Internal Server Error`: If there is an internal server error.

## Usage

1. Start a new recording by making a POST request to /start-recording. You will receive a videoId in the response.

2. Upload video chunks using POST requests to /upload-chunk. Use the videoChunk field in a multipart/form-data form for each chunk.

3. When recording is complete, stop the recording by making a POST request to /stop-recording. Include the videoId in the request body. The video will be transcribed, and details will be returned.

4. Retrieve video details, including transcription and subtitle data, by making a GET request to /videos/:id, where :id is the videoId obtained in step 1.

## Author

- [Aanuoluwapo Liasu](https://github.com/holabayor)
