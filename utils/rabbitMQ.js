const amqp = require('amqplib');

async function consumeChunks() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queueName = 'video_chunks';
    await channel.assertQueue(queueName, { durable: false });

    console.log('Waiting for chunks...');

    channel.consume(queueName, (msg) => {
      const chunk = JSON.parse(msg.content.toString());

      // Process the chunk as needed
      console.log('Received and processed chunk:', chunk);

      // Acknowledge the message
      channel.ack(msg);
    });
  } catch (error) {
    console.error('Error in chunk consumer:', error);
  }
}

consumeChunks();
