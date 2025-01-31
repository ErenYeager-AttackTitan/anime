// saveAnime.js
const { MongoClient } = require('mongodb');
const { write } = require('@netlify/functions');

exports.handler = async (event) => {
  // Get the API key from Netlify environment variables
  const apiKey = process.env.API_KEY;

  // Get the API key from the request header
  const requestApiKey = event.headers['x-api-key'];

  // Validate the API key
  if (requestApiKey !== apiKey) {
    return {
      statusCode: 403, // Forbidden
      body: JSON.stringify({ error: 'Invalid API key' }),
    };
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Parse the incoming request body
  const { id, title, slug, poster, total_episodes } = JSON.parse(event.body);

  // Validate the required fields
  if (!id || !title || !slug || !poster || !total_episodes) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  // MongoDB connection setup
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME);
    const animeCollection = database.collection('anime');

    // Check if anime already exists
    const existingAnime = await animeCollection.findOne({ id });
    if (existingAnime) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ error: 'Anime with this ID already exists' }),
      };
    }

    // Insert the new anime into the database
    const result = await animeCollection.insertOne({
      id,
      title,
      slug,
      poster,
      total_episodes,
    });

    return {
      statusCode: 201, // Created
      body: JSON.stringify({ message: 'Anime added successfully', data: result.ops[0] }),
    };
  } catch (error) {
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  } finally {
    // Close the database connection
    await client.close();
  }
};
