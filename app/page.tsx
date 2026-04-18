"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import LiveFeed from "./components/LiveFeed";
import GasCalculator from "./components/GasCalculator";
import WalletChecker from "./components/WalletChecker";
import BatchSender from "./components/BatchSender";
import TxDecoder from "./components/TxDecoder";

const TABS = [
  { id: "live", label: "Live Feed", icon: "📡" },
  { id: "gas", label: "Gas Calculator", icon: "⛽" },
  { id: "wallet", label: "Wallet Checker", icon: "👛" },
  { id: "batch", label: "Batch Sender", icon: "📤" },
  { id: "decoder", label: "Tx Decoder", icon: "🔍" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <main style={{ minHeight: "100vh", background: "#0F172A", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#F8FAFC", margin: "0 0 2px" }}>Arc Monitor</h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Arc Testnet Explorer & Tools</p>
        </div>
        <ConnectButton showBalance={false} />
      </div>

      {/* Tabs */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "0 24px", display: "flex", gap: "4px", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #3B82F6" : "2px solid transparent",
              color: activeTab === tab.id ? "#60A5FA" : "#64748B",
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: "14px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        {activeTab === "live" && <LiveFeed />}
        {activeTab === "gas" && <GasCalculator />}
        {activeTab === "wallet" && <WalletChecker />}
        {activeTab === "batch" && <BatchSender />}
        {activeTab === "decoder" && <TxDecoder />}
      </div>

    </main>
  );
}