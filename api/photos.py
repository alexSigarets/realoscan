# api/photos.py

import os
from fastapi import APIRouter
from typing import List
from cachetools import TTLCache
import logging

router = APIRouter()

PHOTOS_BASE_PATH = "static/media"
photo_cache = TTLCache(maxsize=1000, ttl=86400)  # ⏱ 24 часа = 86400 секунд

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)  # Убедись, что логирование настроено

# @router.get("/get_photos/{apartment_id}")
# async def get_photos(apartment_id: int):
#     matching_photos = []

#     # Ищем папку, где в названии содержится ID
#     for folder_name in os.listdir(PHOTOS_BASE_PATH):
#         if str(apartment_id) in folder_name:
#             folder_path = os.path.join(PHOTOS_BASE_PATH, folder_name)
#             if os.path.isdir(folder_path):
#                 for file_name in os.listdir(folder_path):
#                     if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
#                         photo_url = f"/{folder_path}/{file_name}".replace("\\", "/")
#                         matching_photos.append(photo_url)
#             break  # Нашли папку — больше не ищем дальше

#     return matching_photos



# Новая функция загрузки фото с кешем:
# @router.get("/get_photos/{apartment_id}")
# async def get_photos(apartment_id: int):
#     if apartment_id in photo_cache:
#         return photo_cache[apartment_id]

#     matching_photos = []

#     for folder_name in os.listdir(PHOTOS_BASE_PATH):
#         if str(apartment_id) in folder_name:
#             folder_path = os.path.join(PHOTOS_BASE_PATH, folder_name)
#             if os.path.isdir(folder_path):
#                 for file_name in os.listdir(folder_path):
#                     if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
#                         photo_url = f"/{folder_path}/{file_name}".replace("\\", "/")
#                         matching_photos.append(photo_url)
#             break

#     photo_cache[apartment_id] = matching_photos
#     return matching_photos




# То же самое только с логированием
@router.get("/get_photos/{apartment_id}")
async def get_photos(apartment_id: int):
    if apartment_id in photo_cache:
        return photo_cache[apartment_id]

    matching_photos = []

    for folder_name in os.listdir(PHOTOS_BASE_PATH):
        if str(apartment_id) in folder_name:
            folder_path = os.path.join(PHOTOS_BASE_PATH, folder_name)
            if os.path.isdir(folder_path):
                for file_name in os.listdir(folder_path):
                    if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        photo_url = f"/{folder_path}/{file_name}".replace("\\", "/")
                        matching_photos.append(photo_url)
            break

    if matching_photos:
        photo_cache[apartment_id] = matching_photos

    return matching_photos
