const { MongoClient } = require('mongodb');
const { write } = require('@netlify/functions');

exports.handler = async (event) => {
  // MongoDB connection string from environment variable
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    // Parse the incoming request body
    const { id, title, slug, poster, total_episodes } = JSON.parse(event.body);

    // Connect to MongoDB
    await client.connect();
    const database = client.db('animeDB');  // Use your MongoDB database name
    const animeCollection = database.collection('anime');  // Collection for anime data

    // Check if anime with this ID already exists
    const existingAnime = await animeCollection.findOne({ id });
    if (existingAnime) {
      return {
        statusCode: 400,  // Bad Request
        body: JSON.stringify({ error: 'Anime with this ID already exists' }),
      };
    }

    // Insert the new anime into the collection
    const result = await animeCollection.insertOne({
      id,
      title,
      slug,
      poster,
      total_episodes,
      episodes: []  // Initialize empty episodes array
    });

    // Return success response
    return {
      statusCode: 201,  // Created
      body: JSON.stringify({
        message: 'Anime added successfully',
        data: result.ops[0],  // Return the inserted anime data
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,  // Internal Server Error
      body: JSON.stringify({ error: 'Failed to save anime data' }),
    };
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
};
