const { MongoClient } = require('mongodb');
const { write } = require('@netlify/functions');

exports.handler = async (event) => {
  // MongoDB connection string from environment variable
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    // Get the anime ID from query parameters
    const { animeId } = event.queryStringParameters;

    // Connect to MongoDB
    await client.connect();
    const database = client.db('animeDB');
    const animeCollection = database.collection('anime');

    // Find the anime by ID
    const anime = await animeCollection.findOne({ id: animeId });
    if (!anime) {
      return {
        statusCode: 404,  // Not Found
        body: JSON.stringify({ error: 'Anime not found with this ID' }),
      };
    }

    // Return anime data along with episodes (like anime-id-watch.json)
    return {
      statusCode: 200,  // OK
      body: JSON.stringify({
        id: anime.id,
        title: anime.title,
        slug: anime.slug,
        poster: anime.poster,
        total_episodes: anime.total_episodes,
        episodes: anime.episodes,  // This will be an array of episodes
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,  // Internal Server Error
      body: JSON.stringify({ error: 'Failed to fetch anime data' }),
    };
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
};
          
