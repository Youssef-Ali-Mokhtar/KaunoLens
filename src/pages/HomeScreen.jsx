import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

export default function HomeScreen() {
  const navigate = useNavigate();

  const container = {
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -600 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  // If you want animated links later
  const MotionLink = motion(Link);

  return (
    <div className="screen">
      <motion.h2
        className="home-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
      >
        How would you like to start?
      </motion.h2>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <motion.button
          className="action-btn btn-blue"
          variants={item}
          onClick={() => navigate("/KaunoLens/camera")}
        >
          📷 Take a Photo
        </motion.button>

        <motion.button
          className="action-btn btn-green"
          variants={item}
          onClick={() => navigate("/KaunoLens/upload")}
        >
          ⬆️ Upload a Photo
        </motion.button>

        <motion.button
          className="action-btn btn-gray"
          variants={item}
          onClick={() => navigate("/KaunoLens/history")}
        >
          📁 View History
        </motion.button>
      </motion.div>
    </div>
  );
}
