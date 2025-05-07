// =====================
// 📁 UTILS.JS
// Утилиты: прелоадер, проверка роли, обновление счётчика
// =====================



// Прелоадер
export function showPreloader() {
    document.getElementById("preloader").classList.remove("hidden");
}

export function hidePreloader() {
    document.getElementById("preloader").classList.add("hidden");
}

// Проверка роли пользователя при загрузки страницы 
export function checkRole(){
    const role = localStorage.getItem("role");
    const adminBtn = document.getElementById("adminRegisterBtn");

    if (role === "admin" && adminBtn) {
        adminBtn.style.display = "inline-block"; // или "block" — как тебе нужно по стилю
    }
}

// Колличество обхектов в базе
export function updateApartmentCount(count) {
    const countElement = document.getElementById("apartment-count");
    if (countElement) {
        countElement.textContent = `Nalezeno: ${count} nemovitostí`;
    }
}



// Показываем всплывющее окно: 
export function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.getElementById("toast-container");
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}




export async function checkTokenOrRedirect(){
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Проверка токена через защищённый эндпоинт
    try {
        const response = await fetch(`${window.location.origin}/auth/check`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }
    } catch (error) {
        console.error("Ошибка при проверке токена:", error);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }
}


