// saves image + timestamp to localStorage
export function saveToHistory(image, location = null, building = null) {
  const entry = {
    image,
    location, // { latitude, longitude }
    timestamp: new Date().toLocaleString(),
    building,
  };

  const history = JSON.parse(localStorage.getItem("history") || "[]");
  let candidateHistory = [...history, entry];

  const tryPersist = (data) => {
    try {
      localStorage.setItem("history", JSON.stringify(data));
      return true;
    } catch (err) {
      // LocalStorage is probably full (QuotaExceededError)
      console.warn("History save failed, will trim and retry:", err);
      return false;
    }
  };

  // First attempt: save as-is
  if (tryPersist(candidateHistory)) return true;

  // If storage is full, drop oldest entries until it fits
  while (candidateHistory.length > 1) {
    candidateHistory.shift();
    if (tryPersist(candidateHistory)) return true;
  }

  // Final attempt: save only the newest entry
  return tryPersist([entry]);
}
