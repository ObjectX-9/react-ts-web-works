import React, { useEffect, useState } from "react";

const SpinningIndicator: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 10) % 360);
    }, 50); // 每50ms旋转10度，实现平滑动画

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        backgroundColor: "#ff5722",
        borderRadius: "50%",
        margin: "10px 0",
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.05s linear",
      }}
    />
  );
};

export default SpinningIndicator;
