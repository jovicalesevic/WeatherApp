from pydantic import BaseModel


class ApiError(BaseModel):
    error: str
    details: str | None = None
