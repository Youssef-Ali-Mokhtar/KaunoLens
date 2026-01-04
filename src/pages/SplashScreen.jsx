import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaMapLocation } from "react-icons/fa6";
import "../index.css";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/KaunoLens/home");
    }, 3000);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="screen" style={{ background: "#000" }}>
      <motion.div
        // className="logo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 2 }}
      >
        <FaMapLocation size={40} />
      </motion.div>

      <motion.h1
        className="app-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 2 }}
      >
        KaunoLens
      </motion.h1>
    </div>
  );
}
