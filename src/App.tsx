import React from "react";
import Tabs from "./components/Tabs";
import WebWorkerDemo from "./components/WebWorkerDemo";
import WebWorkerTutorial from "./components/WebWorkerTutorial";
import BabelWorkerDemo from "./components/BabelWorkerDemo";

const App: React.FC = () => {
  const tabItems = [
    {
      key: "tutorial",
      label: "📚 使用教程",
      children: <WebWorkerTutorial />,
    },
    {
      key: "demo",
      label: "🔧 实时演示",
      children: <WebWorkerDemo />,
    },
    {
      key: "babel",
      label: "⚛️ Babel 编译",
      children: <BabelWorkerDemo />,
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Tabs items={tabItems} defaultActiveKey="tutorial" />
    </div>
  );
};

export default App;
