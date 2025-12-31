const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Extract filename from path
  const filename = event.path.replace('/.netlify/functions/image/', '');

  if (!filename) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No filename provided' })
    };
  }

  try {
    const store = getStore('uploads');

    // Get the image from Netlify Blobs
    const imageData = await store.get(filename, { type: 'arrayBuffer' });
    const metadata = await store.getMetadata(filename);

    if (!imageData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Image not found' })
      };
    }

    // Convert ArrayBuffer to base64
    const buffer = Buffer.from(imageData);
    const base64Image = buffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': metadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      },
      body: base64Image,
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error retrieving image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve image', details: error.message })
    };
  }
};
