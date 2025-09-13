import React, { useState } from "react";
import "./Tabs.less";

interface TabItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
}

const Tabs: React.FC<TabsProps> = ({ items, defaultActiveKey }) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key);

  const activeTab = items.find((item) => item.key === activeKey);

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {items.map((item) => (
          <button
            key={item.key}
            className={`tab-button ${activeKey === item.key ? "active" : ""}`}
            onClick={() => setActiveKey(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">{activeTab?.children}</div>
    </div>
  );
};

export default Tabs;
