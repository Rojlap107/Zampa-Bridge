const { getStore } = require('@netlify/blobs');

// Default initial data
const DEFAULT_DATA = {
  "journey": [
    {
      "id": 1767072009742,
      "title": "Exploring Ladakh",
      "content": "I recently went to Ladakh. ",
      "imageUrl": "images/uploads/1767072146162.jpeg",
      "timestamp": 1767072009742
    },
    {
      "id": 1767072207853,
      "title": "Delhi Journey",
      "content": "Delhi, heart of India, beautiful bazaars etc.",
      "imageUrl": "images/uploads/1767072207842.jpeg",
      "timestamp": 1767072207853
    }
  ],
  "episodes": [
    {
      "id": 1767073346639,
      "title": "India's Dying Island (Gone by 2030?) Ghoramara, West Bengal",
      "videoUrl": "https://www.youtube.com/embed/vpPYFnJsJu0",
      "description": "A look at Ghoramara Island in West Bengal, which is reportedly disappearing and may be submerged by 2030."
    },
    {
      "id": 1767073362508,
      "title": "Why Tibetans Live in Chhattisgarh? The Story of Tibetans in Mainpat",
      "videoUrl": "https://www.youtube.com/embed/_SCL0C1ri5g",
      "description": "Exploring the history and lives of the Tibetan community settled in Mainpat, Chhattisgarh."
    },
    {
      "id": 1767073374574,
      "title": "Hidden \"Naxal Island\" in Chhattisgarh| TRUTH or LIE?",
      "videoUrl": "https://www.youtube.com/embed/4BT6DFco-WE",
      "description": "An investigation into the mystery of the \"Naxal Island\" in Chhattisgarh to uncover the reality of the area."
    },
    {
      "id": 1767073384925,
      "title": "NO ROAD, NO BRIDGE: India's Most FORGOTTEN Village| Chhattisgarh Reality",
      "videoUrl": "https://www.youtube.com/embed/f1YUEOns6_A",
      "description": "A documentation of the survival struggles in a remote Chhattisgarh village that lacks basic infrastructure like roads and bridges."
    },
    {
      "id": 1767073395523,
      "title": "Hitchhiking in Red Zone of Chhattisgarh- Villagers Helped me Here",
      "videoUrl": "https://www.youtube.com/embed/bdRTqgFkXSg",
      "description": "An account of hitchhiking through the \"Red Zone\" of Chhattisgarh and the unexpected hospitality of the local villagers."
    }
  ],
  "blog": [
    {
      "id": 1,
      "date": "OCTOBER 24, 2024",
      "title": "Finding Balance",
      "summary": "Reflections on walking the path between two worlds..."
    }
  ]
};

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
    const store = getStore('content');

    if (event.httpMethod === 'GET') {
      // Read content from Netlify Blobs
      let data = await store.get('data', { type: 'json' });

      // If no data exists, initialize with default data
      if (!data) {
        await store.setJSON('data', DEFAULT_DATA);
        data = DEFAULT_DATA;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    } else if (event.httpMethod === 'POST') {
      // Save content to Netlify Blobs
      const newData = JSON.parse(event.body);
      await store.setJSON('data', newData);

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
