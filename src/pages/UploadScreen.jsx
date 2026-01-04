import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToHistory } from "../utils/saveToHistory";
import { compressImage } from "../utils/imageCompression"; // ✅ add this

export default function UploadScreen() {
  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(null); // preview base64 (original)
  const [historyPhoto, setHistoryPhoto] = useState(null); // compressed base64 (history)
  const [selectedFile, setSelectedFile] = useState(null); // ✅ real File for multipart upload

  const [failed, setFailed] = useState(false);
  const [building, setBuilding] = useState(null);
  const [localizing, setLocalizing] = useState(false);

  const navigate = useNavigate();

  /* =========================
     File handling
  ========================= */

  const openPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFailed(false);

      // ✅ keep the real file for multipart/form-data upload
      setSelectedFile(file);

      // ✅ read ORIGINAL base64 for preview only
      const reader = new FileReader();
      reader.onload = async () => {
        setPhoto(reader.result);

        // ✅ compress ONLY for history/localStorage
        const compressedBase64 = await compressImage(file, {
          maxWidth: 800,
          quality: 0.5,
          outputType: "image/jpeg",
        });
        setHistoryPhoto(compressedBase64);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload/read/compress failed:", err);
      setFailed(true);
    }
  };

  const reupload = () => {
    setPhoto(null);
    setHistoryPhoto(null);
    setSelectedFile(null);
    setFailed(false);
    setBuilding(null);
    setLocalizing(false);
    openPicker();
  };

  /* =========================
     Localization
  ========================= */

  const localizePhoto = async () => {
    try {
      setFailed(false);
      setLocalizing(true);

      if (!selectedFile) {
        throw new Error("No file selected");
      }

      // ✅ multipart/form-data
      const formData = new FormData();

      // IMPORTANT: field name must match what backend expects.
      // Common names: "file", "image", "photo"
      // Ask your backend dev what the exact key is.
      formData.append("file", selectedFile);

      const response = await fetch(
        "https://backend-proxy-drezg5apfwffhggp.spaincentral-01.azurewebsites.net/api/proxy",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Localization failed");
      }

      const data = await response.json();

      setBuilding(data.detectedObject || null);

      // ✅ Save COMPRESSED image to history
      saveToHistory(
        historyPhoto || photo,
        {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        data.detectedObject
      );

      if (data?.latitude && data?.longitude) {
        window.open(
          `https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
          "_blank"
        );
      }
    } catch (err) {
      console.error("Localization failed:", err);
      setFailed(true);
    } finally {
      setLocalizing(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div
      style={{
        background: "black",
        width: "100vw",
        height: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* ERROR BANNER */}
      {failed && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#dc2626",
            color: "white",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            zIndex: 50,
          }}
        >
          ❌ Localization failed. Please try another image.
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelected}
        style={{ display: "none" }}
      />

      {/* INITIAL STATE */}
      {!photo && (
        <button
          onClick={openPicker}
          style={{
            padding: "16px 28px",
            borderRadius: "16px",
            background: "#16a34a",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ⬆️ Upload a Photo
        </button>
      )}

      {/* PREVIEW + ACTIONS */}
      {photo && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "400px",
              background: "#111",
              borderRadius: "16px",
              border: "2px solid #444",
              padding: "10px",
            }}
          >
            <img
              src={photo}
              alt="uploaded"
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={localizePhoto}
              disabled={localizing}
              style={{
                padding: "10px 18px",
                background: localizing ? "#555" : "#16a34a",
                borderRadius: "10px",
                color: "white",
                fontSize: "16px",
                border: "none",
                opacity: localizing ? 0.7 : 1,
              }}
            >
              {localizing ? "⏳ Localizing..." : "📤 Localize"}
            </button>

            <button
              onClick={reupload}
              disabled={localizing}
              style={{
                padding: "10px 18px",
                background: "#dc2626",
                borderRadius: "10px",
                color: "white",
                fontSize: "16px",
                border: "none",
              }}
            >
              🔄 Re-upload
            </button>
          </div>

          {/* RESULT */}
          {building && (
            <>
              <div
                style={{
                  background: "#1f2937",
                  color: "#6ee7b7",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                🏛️ {building}
              </div>

              <button
                onClick={() => navigate("/home")}
                style={{
                  padding: "10px 18px",
                  background: "#2563eb",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                🏠 Home
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
