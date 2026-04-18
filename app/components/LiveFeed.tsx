"use client";

import { useState, useEffect } from "react";
import { ARC_RPC, EXPLORER_URL, USDC_ADDRESS } from "../../lib/arc-config";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  type: string;
}

export default function LiveFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastBlock, setLastBlock] = useState<string>("");
  const [isLive, setIsLive] = useState(true);

  async function fetchLatestTransactions() {
    try {
      const blockRes = await fetch(ARC_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
      });
      const blockData = await blockRes.json();
      const blockNumber = blockData.result;

      if (blockNumber === lastBlock) return;
      setLastBlock(blockNumber);

      const txRes = await fetch(ARC_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBlockByNumber", params: [blockNumber, true], id: 2 }),
      });
      const txData = await txRes.json();
      const block = txData.result;

      if (!block?.transactions?.length) return;

      const newTxs: Transaction[] = block.transactions.slice(0, 10).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to ?? "Contract Creation",
        value: tx.value,
        blockNumber: parseInt(blockNumber, 16).toString(),
        type: tx.to?.toLowerCase() === USDC_ADDRESS.toLowerCase() ? "USDC Transfer" : tx.to ? "Contract Call" : "Deploy",
      }));

      setTransactions((prev) => [...newTxs, ...prev].slice(0, 50));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLatestTransactions();
    if (!isLive) return;
    const interval = setInterval(fetchLatestTransactions, 3000);
    return () => clearInterval(interval);
  }, [isLive, lastBlock]);

  function shortAddr(addr: string) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 8) + "..." + addr.slice(-6);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC", margin: "0 0 4px" }}>Live Transaction Feed</h2>
          <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
            Latest block: #{lastBlock ? parseInt(lastBlock, 16).toLocaleString() : "..."}
          </p>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          style={{ background: isLive ? "#166534" : "#334155", border: "none", borderRadius: "10px", padding: "8px 16px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
        >
          {isLive ? "🟢 Live" : "⏸ Paused"}
        </button>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading transactions...</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {transactions.map((tx, i) => (
          <div key={tx.hash + i} style={{ background: "#1E293B", borderRadius: "12px", padding: "14px 16px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", background: tx.type === "USDC Transfer" ? "#1D3461" : tx.type === "Deploy" ? "#2D1B69" : "#1a2a1a", color: tx.type === "USDC Transfer" ? "#60A5FA" : tx.type === "Deploy" ? "#A78BFA" : "#4ADE80", padding: "2px 8px", borderRadius: "6px", fontWeight: 600, whiteSpace: "nowrap" }}>{tx.type}</span>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Block #{tx.blockNumber}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                <span style={{ color: "#64748B" }}>From: </span>
                <span style={{ fontFamily: "monospace" }}>{shortAddr(tx.from)}</span>
                <span style={{ color: "#64748B", margin: "0 6px" }}>→</span>
                <span style={{ fontFamily: "monospace" }}>{shortAddr(tx.to)}</span>
              </div>
            </div>
            <a href={EXPLORER_URL + "/tx/" + tx.hash} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#60A5FA", whiteSpace: "nowrap", textDecoration: "none" }}>
              View →
            </a>
          </div>
        ))}
      </div>

      {transactions.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>No transactions found. Waiting for new blocks...</div>
      )}
    </div>
  );
}