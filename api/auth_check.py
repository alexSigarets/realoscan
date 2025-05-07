from fastapi import APIRouter, Depends
from utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/check")
async def check_token(current_user: str = Depends(get_current_user)):
    return {"status": "ok", "user": current_user}
