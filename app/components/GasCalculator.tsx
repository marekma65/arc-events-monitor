"use client";

import { useState } from "react";

const OPERATIONS = [
  { name: "Simple USDC Transfer", arcGas: 0.006, ethGas: 0.5, description: "Send USDC to another wallet" },
  { name: "ERC-20 Token Transfer", arcGas: 0.008, ethGas: 1.2, description: "Transfer any ERC-20 token" },
  { name: "Smart Contract Deploy", arcGas: 0.03, ethGas: 15.0, description: "Deploy a new smart contract" },
  { name: "NFT Mint", arcGas: 0.02, ethGas: 8.0, description: "Mint a new NFT" },
  { name: "DEX Swap", arcGas: 0.015, ethGas: 5.0, description: "Swap tokens on a DEX" },
  { name: "Bridge Transfer", arcGas: 0.01, ethGas: 3.0, description: "Cross-chain bridge transfer" },
];

export default function GasCalculator() {
  const [txCount, setTxCount] = useState("10");
  const [ethPrice, setEthPrice] = useState("3000");

  const count = Number(txCount) || 1;
  const eth = Number(ethPrice) || 3000;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC", margin: "0 0 4px" }}>Gas Fee Calculator</h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Compare transaction costs on Arc vs Ethereum</p>
      </div>

      {/* Inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#1E293B", borderRadius: "16px", padding: "20px", border: "1px solid #334155" }}>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 8px" }}>Number of transactions</p>
          <input
            type="number"
            value={txCount}
            onChange={(e) => setTxCount(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box" as const, padding: "10px 14px", borderRadius: "10px", border: "1px solid #334155", fontSize: "20px", fontWeight: 700, background: "#0F172A", color: "#F8FAFC", outline: "none" }}
          />
        </div>
        <div style={{ background: "#1E293B", borderRadius: "16px", padding: "20px", border: "1px solid #334155" }}>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 8px" }}>ETH price (USD)</p>
          <input
            type="number"
            value={ethPrice}
            onChange={(e) => setEthPrice(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box" as const, padding: "10px 14px", borderRadius: "10px", border: "1px solid #334155", fontSize: "20px", fontWeight: 700, background: "#0F172A", color: "#F8FAFC", outline: "none" }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", padding: "0 16px", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Operation</span>
          <span style={{ fontSize: "12px", color: "#60A5FA", fontWeight: 600, textAlign: "right" }}>Arc (USDC)</span>
          <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 600, textAlign: "right" }}>Ethereum ($)</span>
          <span style={{ fontSize: "12px", color: "#4ADE80", fontWeight: 600, textAlign: "right" }}>You save</span>
        </div>

        {OPERATIONS.map((op) => {
          const arcTotal = op.arcGas * count;
          const ethTotal = op.ethGas * count;
          const savings = ethTotal - arcTotal;
          const savingsPct = Math.round((savings / ethTotal) * 100);

          return (
            <div key={op.name} style={{ background: "#1E293B", borderRadius: "12px", padding: "14px 16px", border: "1px solid #334155" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#F8FAFC", margin: "0 0 2px" }}>{op.name}</p>
                  <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>{op.description}</p>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#60A5FA", margin: 0, textAlign: "right" }}>${arcTotal.toFixed(3)}</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#F59E0B", margin: 0, textAlign: "right" }}>${ethTotal.toFixed(2)}</p>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#4ADE80", margin: "0 0 2px" }}>${savings.toFixed(2)}</p>
                  <p style={{ fontSize: "11px", color: "#4ADE80", margin: 0 }}>{savingsPct}% cheaper</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "16px", background: "#1D3461", borderRadius: "12px", padding: "14px 16px", border: "1px solid #3B82F6" }}>
        <p style={{ fontSize: "13px", color: "#60A5FA", margin: 0 }}>
          Arc uses USDC as gas token – fees are predictable and stable regardless of network congestion. Base fee is approximately $0.01 per transaction.
        </p>
      </div>
    </div>
  );
}