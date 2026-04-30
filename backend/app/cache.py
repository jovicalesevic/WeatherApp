import time
from typing import Any


class InMemoryTTLCache:
    def __init__(self, ttl_seconds: int):
        self.ttl_seconds = ttl_seconds
        self.store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str):
        entry = self.store.get(key)
        if not entry:
            return None

        expires_at, value = entry
        if time.time() > expires_at:
            self.store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any):
        self.store[key] = (time.time() + self.ttl_seconds, value)
