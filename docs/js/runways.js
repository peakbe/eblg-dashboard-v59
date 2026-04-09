// ======================================================
// RUNWAYS — VERSION PRO+
// Dessin piste + corridor + crosswind + panneau piste
// ======================================================

import { haversineDistance } from "./helpers.js";


// ------------------------------------------------------
// Logging PRO+
// ------------------------------------------------------
const IS_DEV = location.hostname.includes("localhost") || location.hostname.includes("127.0.0.1");
const log = (...a) => IS_DEV && console.log("[RUNWAYS]", ...a);
const logErr = (...a) => console.error("[RUNWAYS ERROR]", ...a);


// ------------------------------------------------------
// Données pistes
// ------------------------------------------------------
export const RUNWAYS = {
    "22": {
        heading: 220,
        start: [50.64695, 5.44340],
        end:   [50.64455, 5.46515],
        width_m: 45
    },
    "04": {
        heading: 40,
        start: [50.64455, 5.46515],
        end:   [50.64695, 5.44340],
        width_m: 45
    }
};

export const CORRIDORS = {
    "04": [
        [50.70000, 5.33000],
        [50.67000, 5.40000],
        [50.64455, 5.46515]
    ],
    "22": [
        [50.60000, 5.58000],
        [50.62000, 5.51000],
        [50.64695, 5.44340]
    ]
};


// ------------------------------------------------------
// Outils angulaires
// ------------------------------------------------------
function angleDiff(a, b) {
    const d = Math.abs(a - b);
    return Math.min(d, 360 - d);
}


// ------------------------------------------------------
// Dessin piste
// ------------------------------------------------------
export function drawRunway(runway, layer) {
    try {
        layer.clearLayers();
        if (!runway || runway === "UNKNOWN") return;
        if (!RUNWAYS[runway]) return;

        const r = RUNWAYS[runway];
        const [lat1, lon1] = r.start;
        const [lat2, lon2] = r.end;

        const dx = lon2 - lon1;
        const dy = lat2 - lat1;
        const len = Math.sqrt(dx*dx + dy*dy);

        const px = -(dy / len);
        const py = dx / len;

        const meterToDegLat = 1 / 111320;
        const meterToDegLon = 1 / (111320 * Math.cos(lat1 * Math.PI/180));

        const halfW_lat = (r.width_m * meterToDegLat) / 2;
        const halfW_lon = (r.width_m * meterToDegLon) / 2;

        const p1L = [lat1 + py * halfW_lat, lon1 + px * halfW_lon];
        const p1R = [lat1 - py * halfW_lat, lon1 - px * halfW_lon];
        const p2L = [lat2 + py * halfW_lat, lon2 + px * halfW_lon];
        const p2R = [lat2 - py * halfW_lat, lon2 - px * halfW_lon];

        L.polygon([p1L, p1R, p2R, p2L], {
            color: "#222",
            weight: 1,
            fillColor: "#333",
            fillOpacity: 0.9
        }).addTo(layer);

        L.polyline([r.start, r.end], {
            color: "#fff",
            weight: 2,
            dashArray: "8,8"
        }).addTo(layer);

        const num1 = (r.heading / 10).toFixed(0).padStart(2, "0");
        const num2 = (((r.heading + 180) % 360) / 10).toFixed(0).padStart(2, "0");

        L.marker(r.start, {
            icon: L.divIcon({ className: "runway-number", html: num1 })
        }).addTo(layer);

        L.marker(r.end, {
            icon: L.divIcon({ className: "runway-number", html: num2 })
        }).addTo(layer);

    } catch (err) {
        logErr("Erreur drawRunway :", err);
    }
}


// ------------------------------------------------------
// Corridor
// ------------------------------------------------------
export function drawCorridor(runway, layer) {
    try {
        layer.clearLayers();
        if (!runway || runway === "UNKNOWN") return;
        if (!CORRIDORS[runway]) return;

        const line = L.polyline(CORRIDORS[runway], {
            color: "orange",
            weight: 2,
            dashArray: "6,6"
        }).addTo(layer);

        if (L.polylineDecorator) {
            L.polylineDecorator(line, {
                patterns: [{
                    offset: "25%",
                    repeat: "50%",
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        polygon: false,
                        pathOptions: { stroke: true, color: "orange" }
                    })
                }]
            }).addTo(layer);
        }

    } catch (err) {
        logErr("Erreur drawCorridor :", err);
    }
}


// ------------------------------------------------------
// Logique METAR
// ------------------------------------------------------
export function getRunwayFromWind(windDir) {
    if (!windDir && windDir !== 0) return "UNKNOWN";

    const diff22 = angleDiff(windDir, 220);
    const diff04 = angleDiff(windDir, 40);

    return diff22 < diff04 ? "22" : "04";
}

export function computeCrosswind(windDir, windSpeed, runwayHeading) {
    if (!windDir || !windSpeed || !runwayHeading)
        return { crosswind: 0, angleDiff: 0 };

    const diff = angleDiff(windDir, runwayHeading);
    const rad = diff * Math.PI / 180;

    return {
        crosswind: Math.round(Math.abs(windSpeed * Math.sin(rad))),
        angleDiff: diff
    };
}


// ------------------------------------------------------
// Panneau piste active
// ------------------------------------------------------
export function updateRunwayPanel(runway, windDir, windSpeed, crosswind) {
    try {
        const panel = document.getElementById("runway-panel");
        if (!panel) return;

        if (runway === "UNKNOWN") {
            panel.innerHTML = "<b>Piste :</b> —<br><b>Vent :</b> —";
            return;
        }

        panel.innerHTML = `
            <b>Piste active :</b> ${runway}<br>
            <b>Vent :</b> ${windDir ?? "—"}° / ${windSpeed ?? "—"} kt<br>
            <b>Crosswind :</b> ${crosswind} kt
        `;
    } catch (err) {
        logErr("Erreur updateRunwayPanel :", err);
    }
}
