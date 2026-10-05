const axios = require('axios');

async function geocode(address) {
  try {
    const res = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
          language: 'zh-TW'
        }
      }
    );

    if (!res.data.results.length) return null;

    return {
      lat: res.data.results[0].geometry.location.lat,
      lng: res.data.results[0].geometry.location.lng
    };
  } catch (err) {
    console.error('geocode error:', err.message);
    return null;
  }
}

module.exports = { geocode };