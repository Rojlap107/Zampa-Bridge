const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/content.json');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  try {
    if (event.httpMethod === 'GET') {
      // Read content
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return {
        statusCode: 200,
        headers,
        body: data
      };
    } else if (event.httpMethod === 'POST') {
      // Save content
      const newData = JSON.parse(event.body);
      await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Content saved successfully' })
      };
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
