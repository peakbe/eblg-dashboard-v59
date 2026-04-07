// ======================================================
// CONFIGURATION GLOBALE
// ======================================================

export const PROXY = "https://eblg-proxy.onrender.com";

export const ENDPOINTS = {
    metar: "https://https://eblg-dashboard-v84.onrender.com/metar",
    taf: "https://https://eblg-dashboard-v84.onrender.com/taf",
    fids: "https://https://eblg-dashboard-v84.onrender.com/fids"
};

export const SONOS = [
  { id:"F017", lat:50.764883, lon:5.630606 },
  { id:"F001", lat:50.737, lon:5.608833 },
  { id:"F014", lat:50.718894, lon:5.573164 },
  { id:"F015", lat:50.688839, lon:5.526217 },
  { id:"F005", lat:50.639331, lon:5.323519 },
  { id:"F003", lat:50.601167, lon:5.3814 },
  { id:"F011", lat:50.601142, lon:5.356006 },
  { id:"F008", lat:50.594878, lon:5.35895 },
  { id:"F002", lat:50.588414, lon:5.370522 },
  { id:"F007", lat:50.590756, lon:5.345225 },
  { id:"F009", lat:50.580831, lon:5.355417 },
  { id:"F004", lat:50.605414, lon:5.321406 },
  { id:"F010", lat:50.599392, lon:5.313492 },
  { id:"F013", lat:50.586914, lon:5.308678 },
  { id:"F016", lat:50.619617, lon:5.295345 },
  { id:"F006", lat:50.609594, lon:5.271403 },
  { id:"F012", lat:50.621917, lon:5.254747 }
];

export const SONO_ADDRESSES = {
    "F017": "Rue de la Pommeraie, 4690 Wonck, Belgique",
    "F001": "Rue Franquet, Houtain",
    "F014": "Rue Léon Labaye, Juprelle",
    "F015": "Rue du Brouck, Juprelle",
    "F005": "Rue Caquin, Haneffe",
    "F003": "Rue Fond Méan, Saint-Georges",
    "F011": "Rue Albert 1er, Saint-Georges",
    "F008": "Rue Warfusée, Saint-Georges",
    "F002": "Rue Noiset, Saint-Georges",
    "F007": "Rue Yernawe, Saint-Georges",
    "F009": "Bibliothèque Communale, Place Verte 4470 Stockay",
    "F004": "Vinâve des Stréats, Verlaine",
    "F010": "Rue Haute Voie, Verlaine",
    "F013": "Rue Bois Léon, Verlaine",
    "F016": "Rue de Chapon-Seraing, Verlaine",
    "F006": "Rue Bolly Chapon, Seraing",
    "F012": "Rue Barbe d'Or, 4317 Aineffe"
};
