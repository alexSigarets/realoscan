#JS обращается сюда с запросом, этот скрипт формирует запрос и отправляет его в serveses/apartment_servise.py

from fastapi import APIRouter, Query, Request, HTTPException
from sqlalchemy import select
from database.database import async_session
from models.apartment import Apartment  # Модель апартаментов (мы её тоже сейчас сделаем)
from services.apartment_service import get_apartments, get_apartments_by_owner, get_total_apartment_count
from typing import Optional, List
from core.limiter import limiter
import os
from dotenv import load_dotenv

load_dotenv()

LIMIT = os.getenv("LIMIT")



router = APIRouter()

@router.get("/test_db/")
async def test_db():
    async with async_session() as session:
        result = await session.execute(select(Apartment).limit(5))
        apartments = result.scalars().all()
        return [a.to_dict() for a in apartments]  # вернем как список словарей
    

    
"""@router.get("/apartments/")
async def get_apartments_list():
    apartments = await get_apartments()
    return [apartment.to_dict() for apartment in apartments]"""




# Новая функция выборки квартир по GET параметрам
@router.get("/apartments/")
#@limiter.limit(f"{LIMIT}/minute")  # 👈 не более 10 запросов в минуту с одного IP
async def get_apartments_list(
    #request: Request,
    skip: int = 0,
    limit: int = 20,
    activity: int = Query(0),
    reality_type: int = Query(0),
    region_id: int = Query(0),
    district_id: int = Query(0),
    prague_id: Optional[List[int]] = Query(None)
):
    filters = {
        "Activity": activity,
        "RealityType": reality_type,
        "RegionID": region_id,
        "DistrictId": district_id,
        "PragueLocalityId": prague_id
    }

    apartments = await get_apartments(skip=skip, limit=limit, filters=filters)
    total = await get_total_apartment_count(filters=filters)
    return {
        "items": [apartment.to_dict() for apartment in apartments],
        "total": total
    }




@router.get("/apartments/by-owner")
async def get_apartments_by_owner_endpoint(
    phone: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    id: Optional[str] = Query(None)
):
    if not phone and not email:
        raise HTTPException(status_code=400, detail="Musí být zadán telefon nebo email.")

    apartments = await get_apartments_by_owner(phone=phone, email=email, id=id)
    return [apartment.to_dict() for apartment in apartments]

