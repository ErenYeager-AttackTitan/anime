const fs = require("fs");
const path = require("path");

const API_SECRET_KEY = "your-secure-api-key"; // Hardcoded API Key

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
    const animeData = JSON.parse(event.body);

    // Define file path
    const filePath = path.join(__dirname, "..", "anime.json");

    // Read existing data
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath);
      existingData = JSON.parse(rawData);
    }

    // Add new anime data
    existingData.push(animeData);

    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Anime saved successfully!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
  
