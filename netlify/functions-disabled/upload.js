const busboy = require('busboy');
const { getStore } = require('@netlify/blobs');
const path = require('path');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    });

    let fileData = null;
    let fileName = null;
    let fileExt = null;
    let mimeType = null;

    bb.on('file', (fieldname, file, info) => {
      fileName = info.filename;
      fileExt = path.extname(info.filename);
      mimeType = info.mimeType;

      const chunks = [];
      file.on('data', (data) => {
        chunks.push(data);
      });

      file.on('end', () => {
        fileData = Buffer.concat(chunks);
      });
    });

    bb.on('finish', async () => {
      if (!fileData) {
        resolve({
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No file uploaded' })
        });
        return;
      }

      try {
        const store = getStore('uploads');
        const timestamp = Date.now();
        const newFileName = `${timestamp}${fileExt}`;

        // Store the image in Netlify Blobs with metadata
        await store.set(newFileName, fileData, {
          metadata: {
            contentType: mimeType,
            originalName: fileName
          }
        });

        // Return URL that points to our image serving function
        const imageUrl = `/.netlify/functions/image/${newFileName}`;

        resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({ imageUrl })
        });
      } catch (error) {
        console.error('Upload error:', error);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save file', details: error.message })
        });
      }
    });

    bb.on('error', (error) => {
      console.error('Busboy error:', error);
      resolve({
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to process upload', details: error.message })
      });
    });

    // Parse the body
    const encoding = event.isBase64Encoded ? 'base64' : 'utf8';
    bb.write(event.body, encoding);
    bb.end();
  });
};
