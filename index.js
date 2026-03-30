import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

/* ----------------------------------------------------------
   PROXY GÉNÉRIQUE
---------------------------------------------------------- */
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  try {
    const r = await fetch(url);
    const data = await r.text();
    res.send(data);
  } catch (e) {
    res.status(500).send("Proxy error");
  }
});

/* ----------------------------------------------------------
   METAR SÉCURISÉ AVEC FALLBACK
---------------------------------------------------------- */
app.get("/metar", async (req, res) => {
  try {
    const response = await fetch(`https://avwx.rest/api/metar/EBLG`, {
      headers: { Authorization: process.env.AVWX_API_KEY }
    });

    if (!response.ok) throw new Error("AVWX offline");

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error("AVWX DOWN → fallback activé");

    return res.json({
      station: "EBLG",
      flight_rules: "UNKNOWN",
      raw: "METAR unavailable",
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
});

/* ----------------------------------------------------------
   TAF SÉCURISÉ AVEC FALLBACK
---------------------------------------------------------- */
app.get("/taf", async (req, res) => {
  try {
    const response = await fetch(`https://avwx.rest/api/taf/EBLG`, {
      headers: { Authorization: process.env.AVWX_API_KEY }
    });

    if (!response.ok) throw new Error("AVWX offline");

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error("AVWX TAF DOWN → fallback activé");

    return res.json({
      station: "EBLG",
      raw: "TAF unavailable",
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
});

/* ----------------------------------------------------------
   FIDS AVEC CORS + FALLBACK ROBUSTE
---------------------------------------------------------- */
app.get("/fids", async (req, res) => {
  const fallback = [
    {
      flight: "N/A",
      destination: "N/A",
      time: "N/A",
      status: "Unavailable",
      fallback: true,
      timestamp: new Date().toISOString()
    }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 sec max

    const url = "https://opensky-network.org/api/flights/departure?airport=EBLG&begin=0&end=0";

    const response = await fetch(url, {
      signal: controller.signal
    }).catch(err => {
      console.error("Erreur réseau FIDS :", err);
      return null;
    });

    clearTimeout(timeout);

    if (!response || !response.ok) {
      console.error("FIDS HTTP error :", response?.status);
      return res.json(fallback);
    }

    const data = await response.json().catch(err => {
      console.error("Erreur JSON FIDS :", err);
      return fallback;
    });

    return res.json(data.length ? data : fallback);

  } catch (error) {
    console.error("FIDS DOWN → fallback activé :", error.message);
    return res.json(fallback);
  }
});

/* ----------------------------------------------------------
   DÉMARRAGE DU SERVEUR (MANQUAIT !)
---------------------------------------------------------- */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
