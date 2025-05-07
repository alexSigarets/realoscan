// =====================
// 📁 MAIN.JS
// Главный вход: загрузка, фильтры, отрисовка, роли
// =====================

import {
    renderActivityFilter,
    renderRealityTypeFilter,
    renderRegionTypeFilter,
    restoreFiltersFromURL,
    fetchFilteredApartments,
    resetFilters
} from "./filters.js";
import { renderApartments } from "./apartments.js";
import { showPreloader, hidePreloader, updateApartmentCount, checkRole, showToast, checkTokenOrRedirect  } from "./utils.js";
import { DistrictId } from './constants.js'; // относительный путь
import { fetchFavoriteIds } from "./favorites.js";

let allApartments = [];
const limit = 20;

// Запрос данныз с сервера 
export async function fetchApartments(favoriteIds, page = 1) {
    try {
        const offset = (page - 1) * limit;
        const url = new URL("apartments/", window.location.origin);
        url.searchParams.set("skip", offset);
        url.searchParams.set("limit", limit);

        const response = await fetch(url);
        const data = await response.json();
        const apartments = data.items;
        const total = data.total;

        // 2. Отрисовываем фильтры
        // renderActivityFilter(apartments, response);
        // renderRealityTypeFilter(apartments, response);
        // renderRegionTypeFilter(apartments, response);

        //Восстановление фильтров после перезагрузки: 
        restoreFiltersFromURL();

        renderApartments(apartments, favoriteIds);
        updateApartmentCount(total);
        renderPagination(total, page, favoriteIds); // 👈 добавим пагинацию
        allApartments = apartments;
    } catch (error) {
        console.error("Ошибка загрузки квартир:", error);
    }
}



// Создаем пагинацию
export function renderPagination(total, currentPage = 1) {
    const totalPages = Math.ceil(total / limit);
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("page-btn");
        if (i === currentPage) btn.classList.add("active");

        btn.addEventListener("click", () => {
            const url = new URL(window.location.href);
            url.searchParams.set("page", i);
            window.history.pushState({}, "", url);

            // 🟢 Вызываем универсальный загрузчик, а не напрямую fetchApartments
            loadApartmentsForPage(i);
        });

        container.appendChild(btn);
    }
}



// Создаем фильтры: 
async function createFilters() {

    try{
        // 1. Загружаем все квартиры для построения фильтров
        const response = await fetch("apartments/?skip=0&limit=100000");
        let data = await response.json();
        data = data.items;
        allApartments = data;

        // 2. Отрисовываем фильтры
        renderActivityFilter(data, response);
        renderRealityTypeFilter(data, response);
        renderRegionTypeFilter(data, response);
    
    } catch{
        console.error("Ошибка загрузки квартир:", error);
    }

}





// Слушаем Select для выбора края и заполнения okres
document.getElementById("kraj").addEventListener("change", () => {
    const krajValue = document.getElementById("kraj").value;
    const prahaCheckboxes = document.getElementById("praha-checkboxes");
    const checkboxes = prahaCheckboxes.querySelectorAll("input[type='checkbox']");
    const okresSelect = document.getElementById("okres");

    // Управление видимостью Praha-checkboxes
    if (krajValue === "1") {
        prahaCheckboxes.style.opacity = "1";
        prahaCheckboxes.style.pointerEvents = "auto";
    } else {
        prahaCheckboxes.style.opacity = "0";
        prahaCheckboxes.style.pointerEvents = "none";
        checkboxes.forEach(cb => cb.checked = false);
    }

    // Очистить okres
    okresSelect.innerHTML = '<option value="0">Nezáleží</option>';

    // Заполнить okres, если выбран Středočeský kraj
    if (krajValue === "8") {
        const okresSet = new Set();
        allApartments.forEach(apartment => {
            if (apartment.RegionID == "8" && apartment.DistrictId && DistrictId[apartment.DistrictId]) {
                okresSet.add(apartment.DistrictId);
            }
        });

        Array.from(okresSet).sort((a, b) => {
            return DistrictId[a].localeCompare(DistrictId[b]);
        }).forEach(districtId => {
            const option = document.createElement("option");
            option.value = districtId;
            option.textContent = DistrictId[districtId];
            okresSelect.appendChild(option);
        });
    }
});





// Новая активация фильтра(Сервер)
document.getElementById("filter-btn").addEventListener("click", async () => {
    const favoriteIds = await fetchFavoriteIds();
    fetchFilteredApartments(favoriteIds)
});

// Активация сброса фильтров
document.getElementById("reset-btn").addEventListener("click", async () =>{
    const favoriteIds = await fetchFavoriteIds();
    resetFilters(favoriteIds)
});




// Переход на страницу регистрации (для админа):
document.getElementById("adminRegisterBtn").addEventListener("click", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Chybí token! Přihlašte se nejprve jako administrátor.");
        return;
    }

    // Обязательно продублируем запись в cookie
    document.cookie = `token=${token}; path=/`;

    // Перейдём на страницу
    window.location.href = "/admin/register";
});




//Кнопка logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/login";
});



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



// Проверяем фильтра в URL
async function loadApartmentsForPage(page = 1) {
    
    //Восстанавливаем значения select и чекбоксов из куки, если таковые имеются 
    restoreFiltersFromURL();
    
    // Проверяем какие квартиры в избранном
    const favoriteIds = await fetchFavoriteIds();

    const hasFilters =
        window.location.search.includes("region_id") ||
        window.location.search.includes("activity") ||
        window.location.search.includes("reality_type") ||
        window.location.search.includes("district_id") ||
        window.location.search.includes("prague_id");

    if (hasFilters) {
        await createFilters();
        restoreFiltersFromURL();
        await fetchFilteredApartments(favoriteIds, page);
    } else {
        await createFilters();
        await fetchApartments(favoriteIds, page);
    }
}




// Запустить при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {

    // Проверяем токен
    await checkTokenOrRedirect();

    // Проверяем роль
    checkRole();

    // Загружаем нужные данные 
    await loadApartmentsForPage();

    
});
