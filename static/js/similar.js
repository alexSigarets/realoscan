import { renderApartments } from "./apartments.js";
import { fetchFavoriteIds } from "./favorites.js"; // если нужно выделять избранное
import { updateApartmentCount } from "./utils.js"; // если хочешь показать количество

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get("phone");
    const email = params.get("email");
    const id = params.get("id");

    

    if (!phone && !email && !id) {
        document.getElementById("apartments").innerHTML = "<p>Chybí kontaktní údaje pro hledání.</p>";
        return;
    }

    const url = new URL("/apartments/by-owner", window.location.origin);
    if (phone) url.searchParams.append("phone", phone);
    if (email) url.searchParams.append("email", email);
    if (id) url.searchParams.append('id', id);
    

    try {
        const response = await fetch(url.toString());
        const data = await response.json();

        const favoriteIds = await fetchFavoriteIds();
        renderApartments(data, favoriteIds);
        updateApartmentCount(data.length);
    } catch (err) {
        console.error("Chyba při načítání podobných inzerátů:", err);
        document.getElementById("apartments").innerHTML = "<p>Chyba při načítání.</p>";
    }
});
