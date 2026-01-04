import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToHistory } from "../utils/saveToHistory";
import { compressImage } from "../utils/imageCompression"; // ✅ add this

export default function CameraScreen() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [photo, setPhoto] = useState(null); // ✅ RAW base64 for preview only (not compressed)
  const [historyPhoto, setHistoryPhoto] = useState(null); // ✅ COMPRESSED base64 for history only
  const [captureFile, setCaptureFile] = useState(null); // ✅ RAW File for multipart upload (not compressed)

  const [stream, setStream] = useState(null);
  const [failed, setFailed] = useState(false);
  const [building, setBuilding] = useState(null);
  const [localizing, setLocalizing] = useState(false);

  const navigate = useNavigate();

  /* =========================
     Camera lifecycle
  ========================= */

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.pause();
        video.srcObject = null;
        video.removeAttribute("src");
        video.load();
      }
    } catch (err) {
      console.error("Camera stop error:", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Capture / Retake
  ========================= */

  // Helper: convert dataURL -> File (so we can upload multipart)
  const dataURLtoFile = (dataUrl, filename = "capture.png") => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setFailed(false);

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext("2d").drawImage(video, 0, 0);

      // ✅ RAW capture for preview (NOT compressed)
      const rawDataUrl = canvas.toDataURL("image/png");
      setPhoto(rawDataUrl);

      // ✅ RAW File for server upload (NOT compressed)
      const rawFile = dataURLtoFile(rawDataUrl, "capture.png");
      setCaptureFile(rawFile);

      // ✅ Compress ONLY for history/localStorage
      const compressedBase64 = await compressImage(rawFile, {
        maxWidth: 800,
        quality: 0.5,
        outputType: "image/jpeg",
      });
      setHistoryPhoto(compressedBase64);
    } catch (err) {
      console.error("Capture/compress failed:", err);
      setFailed(true);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setHistoryPhoto(null);
    setCaptureFile(null);
    setFailed(false);
    setBuilding(null);
    setLocalizing(false);
  };

  /* =========================
     Localization
  ========================= */

  const localizePhoto = async () => {
    try {
      setFailed(false);
      setLocalizing(true);

      if (!captureFile) {
        throw new Error("No captured file available");
      }

      // ✅ multipart/form-data upload of RAW file (NOT compressed)
      const formData = new FormData();

      // IMPORTANT: field name must match backend expectation (commonly "file")
      formData.append("file", captureFile);

      const response = await fetch(
        "https://backend-proxy-drezg5apfwffhggp.spaincentral-01.azurewebsites.net/api/proxy",
        {
          method: "POST",
          body: formData,
          // ✅ DO NOT set Content-Type for FormData
        }
      );

      if (!response.ok) {
        throw new Error("Localization failed");
      }

      const data = await response.json();

      setBuilding(data.detectedObject || null);

      // ✅ save COMPRESSED thumbnail to history (much smaller localStorage)
      saveToHistory(
        historyPhoto || photo, // fallback if compression isn't ready
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
        position: "relative",
        overflow: "hidden",
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
          ❌ Localization failed. Try another angle.
        </div>
      )}

      {/* CAMERA VIEW */}
      <div
        style={{
          width: "100%",
          height: "80%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* CAPTURE BUTTON */}
      {!photo && (
        <button
          onClick={takePhoto}
          style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 26px",
            borderRadius: "50px",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          📸 Capture
        </button>
      )}

      {/* PREVIEW + ACTIONS */}
      {photo && (
        <div
          style={{
            position: "absolute",
            bottom: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src={photo} // ✅ preview RAW capture
            alt="preview"
            style={{
              width: "280px",
              borderRadius: "12px",
              border: "2px solid white",
            }}
          />

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
              onClick={retakePhoto}
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
              🔄 Retake
            </button>
          </div>

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

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
