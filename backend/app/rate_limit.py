import time
from collections import deque


class InMemoryRateLimiter:
    def __init__(self, max_requests_per_minute: int):
        self.max_requests_per_minute = max_requests_per_minute
        self.buckets: dict[str, deque[float]] = {}

    def allow(self, client_id: str) -> bool:
        now = time.time()
        window_start = now - 60
        bucket = self.buckets.setdefault(client_id, deque())

        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= self.max_requests_per_minute:
            return False

        bucket.append(now)
        return True
