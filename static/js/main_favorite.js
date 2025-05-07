import { renderApartments } from "./apartments.js";
import { fetchFavoriteIds } from "./favorites.js";
import { updateApartmentCount, showToast, checkTokenOrRedirect} from "./utils.js";



// Запрос данныз с сервера (избранное)
export async function fetchApartmentsFavorite() {
    
    try {
        const response = await fetch("/favorite/apartments");
        const data = await response.json();
        const favoriteIds = await fetchFavoriteIds();

        
        renderApartments(data, favoriteIds);
        updateApartmentCount(data.length); // <--- вызываем обновление счетчика
        
    } catch (error) {
        console.error("Ошибка загрузки квартир:", error);
    }
}


// Поиск других объявлений от этого же владельца 
document.addEventListener('click', (event) => {
    const target = event.target.closest(".search-btn")

    if(!target) return;

    const phone = target.dataset.telefon;
    const email = target.dataset.email;
    const id = target.dataset.id;

    const params = new URLSearchParams();
    if (phone && phone !== "null") params.append("phone", phone);
    if (email && email !== "null") params.append("email", email);
    if(id && id !== "null") params.append("id", id)

    window.location.href = `/similar?${params.toString()}`;
});


// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {

    

    await checkTokenOrRedirect();
    
    fetchApartmentsFavorite();
    
});