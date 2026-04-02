// ======================================================
// SONOMÈTRES
// ======================================================

import { SONOS, SONO_ADDRESSES } from "./config.js";
import { haversineDistance } from "./helpers.js";

export let sonometers = {};
export let heatLayer = null;
export let heatHistory = [];
export const MAX_HISTORY = 50;

// Cluster layer
export let clusterLayer = L.markerClusterGroup();

// ------------------------------------------------------
// 1) Surlignage dans la liste
// ------------------------------------------------------
export function highlightSonometerInList(id) {
    const list = document.getElementById("sono-list");
    if (!list) return;

    list.querySelectorAll(".sono-item").forEach(el =>
        el.classList.remove("sono-highlight")
    );

    const item = [...list.children].find(el => el.textContent.trim() === id);
    if (item) {
        item.classList.add("sono-highlight");
        item.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

// ------------------------------------------------------
// 2) Heatmap dynamique
// ------------------------------------------------------
export function updateHeatmap(map) {
    if (heatLayer) map.removeLayer(heatLayer);

    const points = Object.values(sonometers).map(s => {
        let weight = 0.2;
        if (s.marker.options.color === "green") weight = 0.6;
        if (s.marker.options.color === "red") weight = 1.0;
        return [s.lat, s.lon, weight];
    });

    heatLayer = L.heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 12,
        minOpacity: 0.3
    }).addTo(map);
}

// ------------------------------------------------------
// 3) Panneau détail
// ------------------------------------------------------
export function showDetailPanel(id, runwayStart) {
    const s = sonometers[id];
    if (!s) return;

    const panel = document.getElementById("detail-panel");
    const title = document.getElementById("detail-title");
    const address = document.getElementById("detail-address");
    const town = document.getElementById("detail-town");
    const status = document.getElementById("detail-status");
    const distance = document.getElementById("detail-distance");

    const fullAddress = SONO_ADDRESSES[id] || "Adresse inconnue";
    const townName = fullAddress.split(",")[1] || "—";

    const d = haversineDistance([s.lat, s.lon], runwayStart).toFixed(2);

    title.textContent = id;
    address.textContent = fullAddress;
    town.textContent = townName.trim();
    status.textContent = s.marker.options.color.toUpperCase();
    distance.textContent = `${d} km`;

    panel.classList.remove("hidden");
}

// ------------------------------------------------------
// 4) Historique Heatmap
// ------------------------------------------------------
export function snapshotHeatmap() {
    const snapshot = Object.values(sonometers).map(s => ({
        lat: s.lat,
        lon: s.lon,
        color: s.marker.options.color
    }));

    heatHistory.push(snapshot);
    if (heatHistory.length > MAX_HISTORY) heatHistory.shift();
}

export async function playHeatmapHistory(map) {
    for (const snapshot of heatHistory) {
        if (heatLayer) map.removeLayer(heatLayer);

        const points = snapshot.map(s => {
            let weight = 0.2;
            if (s.color === "green") weight = 0.6;
            if (s.color === "red") weight = 1.0;
            return [s.lat, s.lon, weight];
        });

        heatLayer = L.heatLayer(points, {
            radius: 35,
            blur: 25,
            maxZoom: 12,
            minOpacity: 0.3
        }).addTo(map);

        await new Promise(r => setTimeout(r, 300));
    }
}

// ------------------------------------------------------
// 5) Initialisation des sonomètres (clusters + markers)
// ------------------------------------------------------
export function initSonometers(map) {
    SONOS.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lon], {
            radius: 6,
            color: "gray",
            fillColor: "gray",
            fillOpacity: 0.9,
            weight: 1
        });

        clusterLayer.addLayer(marker);

        marker.on("click", () => {
            highlightSonometerInList(s.id);
            showDetailPanel(s.id, [50.64695, 5.44340]);
        });

        sonometers[s.id] = { ...s, marker, status: "UNKNOWN" };
    });

    map.addLayer(clusterLayer);
}

// ------------------------------------------------------
// 6) Bouton ON/OFF Heatmap
// ------------------------------------------------------
export function initHeatmapToggle(map) {
    const btn = document.getElementById("toggle-heatmap");
    if (!btn) return;

    let enabled = true;

    btn.onclick = () => {
        enabled = !enabled;

        if (!enabled) {
            if (heatLayer) map.removeLayer(heatLayer);
            btn.textContent = "Heatmap OFF";
        } else {
            updateHeatmap(map);
            btn.textContent = "Heatmap ON";
        }
    };

    // Heatmap initiale
    updateHeatmap(map);
}
