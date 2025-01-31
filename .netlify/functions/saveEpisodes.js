const { MongoClient } = require('mongodb');
const { write } = require('@netlify/functions');

exports.handler = async (event) => {
  // MongoDB connection string from environment variable
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    // Parse the incoming request body
    const { animeId, episodesData } = JSON.parse(event.body);  // Expecting animeId and episode list

    // Connect to MongoDB
    await client.connect();
    const database = client.db('animeDB');  // Use your MongoDB database name
    const animeCollection = database.collection('anime');  // Collection for anime data

    // Find the anime by ID
    const anime = await animeCollection.findOne({ id: animeId });
    if (!anime) {
      return {
        statusCode: 404,  // Not Found
        body: JSON.stringify({ error: 'Anime not found with this ID' }),
      };
    }

    // Append the new episodes to the existing episodes array
    const updateResult = await animeCollection.updateOne(
      { id: animeId },
      {
        $push: { episodes: { $each: episodesData } },  // Append episodes
      }
    );

    // Fetch the updated anime data
    const updatedAnime = await animeCollection.findOne({ id: animeId });

    // Return the updated anime data as JSON (similar to anime-id-watch.json)
    return {
      statusCode: 200,  // OK
      body: JSON.stringify({
        message: 'Episodes added successfully',
        anime: updatedAnime,  // Return the updated anime document
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,  // Internal Server Error
      body: JSON.stringify({ error: 'Failed to save episode data' }),
    };
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
};
