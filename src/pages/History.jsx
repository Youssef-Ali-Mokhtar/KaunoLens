import { useEffect, useState } from "react";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history") || "[]");
    setHistory([...saved].reverse());
  }, []);

  return (
    <div
      style={{
        background: "black",
        color: "white",
        width: "100vw",
        height: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        📌 Search History
      </h2>

      {history.length === 0 && (
        <p style={{ textAlign: "center", color: "#aaa" }}>
          No previous searches yet.
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
          flex: 1,
          paddingRight: "4px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {history.map((item, index) => (
          <div
            key={item.timestamp || index}
            style={{
              background: "#1a1a1a",
              padding: "12px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <img
              src={item.image}
              alt="history"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />

            <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
              }}
            >
              {item.building && (
                <p style={{ margin: 0, fontSize: "16px" }}>
                  🏛️ {item.building}
                </p>
              )}

              {item.location && (
                <p style={{ margin: 0, color: "#6ee7b7", fontSize: "13px" }}>
                  📍 ({item.location.latitude}, {item.location.longitude})
                </p>
              )}

              <p style={{ margin: 0, color: "#bbb", fontSize: "14px" }}>
                🕒 {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
