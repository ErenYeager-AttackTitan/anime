const fs = require("fs");
const path = require("path");

const API_SECRET_KEY = "lolthisismyapikey"; // Hardcoded API Key

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Get API key from request headers
  const providedKey = event.headers["x-api-key"];
  if (!providedKey || providedKey !== API_SECRET_KEY) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden: Invalid API Key" }),
    };
  }

  try {
    const episodeData = JSON.parse(event.body);
    const animeId = episodeData.id; // Anime ID for watch file

    if (!animeId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Anime ID is required" }),
      };
    }

    // Define file path based on anime ID
    const filePath = path.join(__dirname, "..", `${animeId}-watch.json`);

    // Read existing episode data
    let existingData = { id: animeId, title: episodeData.title, episodes: [] };
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath);
      existingData = JSON.parse(rawData);
    }

    // Add new episodes
    existingData.episodes.push(...episodeData.episodes);

    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Episodes saved successfully!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
