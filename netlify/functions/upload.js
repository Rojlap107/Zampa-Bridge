const busboy = require('busboy');
const fs = require('fs').promises;
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

    bb.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      fileName = filename;
      fileExt = path.extname(filename);

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
        const uploadsDir = path.join(__dirname, '../../public/images/uploads');

        // Ensure directory exists
        try {
          await fs.access(uploadsDir);
        } catch {
          await fs.mkdir(uploadsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const newFileName = `${timestamp}${fileExt}`;
        const filePath = path.join(uploadsDir, newFileName);

        await fs.writeFile(filePath, fileData);

        const relativePath = `images/uploads/${newFileName}`;

        resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({ imageUrl: relativePath })
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
