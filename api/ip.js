export default async function handler(req, res) {
  const { ip } = req.query;

  if (!ip) {
    return res.status(400).json({ error: "IP address is required" });
  }

  try {
    const apiKey = process.env.IPIFY_API_KEY;
    const apiUrl = `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}&ipAddress=${ip}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch IP data" });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
}
