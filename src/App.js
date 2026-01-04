import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import HomeScreen from "./pages/HomeScreen";
import History from "./pages/History";
import CameraScreen from "./pages/CameraScreen";
import UploadScreen from "./pages/UploadScreen";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/KaunoLens" element={<SplashScreen />} />
        <Route path="/KaunoLens/home" element={<HomeScreen />} />
        <Route path="/KaunoLens/history" element={<History />} />
        <Route path="/KaunoLens/camera" element={<CameraScreen />} />
        <Route path="/KaunoLens/upload" element={<UploadScreen />} />
      </Routes>
    </Router>
  );
}