"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { USDC_ADDRESS } from "../../lib/arc-config";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

interface Recipient {
  address: string;
  amount: string;
  status: "pending" | "sending" | "done" | "error";
  txHash?: string;
}

export default function BatchSender() {
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [csvText, setCsvText] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isParsed, setIsParsed] = useState(false);

  const explorerUrl = "https://testnet.arcscan.app";

  function parseCSV() {
    const lines = csvText.trim().split("\n");
    const parsed: Recipient[] = [];

    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2 && parts[0].startsWith("0x") && !isNaN(Number(parts[1]))) {
        parsed.push({ address: parts[0], amount: parts[1], status: "pending" });
      }
    }

    setRecipients(parsed);
    setIsParsed(true);
  }

  async function sendAll() {
    if (!recipients.length || !isConnected) return;
    setIsSending(true);

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      setRecipients((prev) => prev.map((r, idx) => idx === i ? { ...r, status: "sending" } : r));

      try {
        const hash = await writeContractAsync({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [recipient.address as `0x${string}`, parseUnits(recipient.amount, 6)],
        });
        setRecipients((prev) => prev.map((r, idx) => idx === i ? { ...r, status: "done", txHash: hash } : r));
      } catch {
        setRecipients((prev) => prev.map((r, idx) => idx === i ? { ...r, status: "error" } : r));
      }
    }

    setIsSending(false);
  }

  const totalAmount = recipients.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC", margin: "0 0 4px" }}>Batch USDC Sender</h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Send USDC to multiple addresses at once</p>
      </div>

      {!isConnected && (
        <div style={{ background: "#1E293B", borderRadius: "12px", padding: "20px", border: "1px solid #334155", textAlign: "center", color: "#64748B" }}>
          Connect your wallet to use Batch Sender
        </div>
      )}

      {isConnected && (
        <>
          <div style={{ background: "#1E293B", borderRadius: "16px", padding: "20px", border: "1px solid #334155", marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 8px" }}>
              Paste addresses and amounts (one per line, format: <span style={{ fontFamily: "monospace", color: "#60A5FA" }}>0xAddress, Amount</span>)
            </p>
            <textarea
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setIsParsed(false); setRecipients([]); }}
              placeholder={"0x1234...abcd, 10\n0x5678...efgh, 25\n0x9abc...ijkl, 5"}
              rows={6}
              style={{ width: "100%", boxSizing: "border-box" as const, padding: "12px 16px", borderRadius: "12px", border: "1px solid #334155", fontSize: "13px", background: "#0F172A", color: "#F8FAFC", outline: "none", fontFamily: "monospace", resize: "vertical" }}
            />
            <button
              onClick={parseCSV}
              disabled={!csvText.trim()}
              style={{ marginTop: "12px", background: !csvText.trim() ? "#334155" : "#3B82F6", border: "none", borderRadius: "10px", padding: "10px 20px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: !csvText.trim() ? "not-allowed" : "pointer" }}
            >
              Parse Addresses
            </button>
          </div>

          {isParsed && recipients.length > 0 && (
            <>
              <div style={{ background: "#1D3461", borderRadius: "12px", padding: "14px 16px", border: "1px solid #3B82F6", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#60A5FA" }}>{recipients.length} recipients found</span>
                <span style={{ fontSize: "13px", color: "#60A5FA", fontWeight: 700 }}>Total: {totalAmount.toFixed(2)} USDC</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {recipients.map((r, i) => (
                  <div key={i} style={{ background: "#1E293B", borderRadius: "12px", padding: "12px 16px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontFamily: "monospace", color: "#F8FAFC", margin: "0 0 2px" }}>{r.address.slice(0, 12) + "..." + r.address.slice(-6)}</p>
                      <p style={{ fontSize: "12px", color: "#60A5FA", margin: 0 }}>{r.amount} USDC</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {r.status === "pending" && <span style={{ fontSize: "12px", color: "#64748B" }}>Pending</span>}
                      {r.status === "sending" && <span style={{ fontSize: "12px", color: "#F59E0B" }}>Sending...</span>}
                      {r.status === "error" && <span style={{ fontSize: "12px", color: "#EF4444" }}>Failed</span>}
                      {r.status === "done" && r.txHash && (
                        <a href={explorerUrl + "/tx/" + r.txHash} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#4ADE80", textDecoration: "none" }}>Done ✓</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={sendAll}
                disabled={isSending}
                style={{ width: "100%", background: isSending ? "#334155" : "linear-gradient(135deg, #3B82F6, #6366F1)", border: "none", borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: isSending ? "not-allowed" : "pointer" }}
              >
                {isSending ? "Sending..." : "Send to All " + recipients.length + " Recipients"}
              </button>
            </>
          )}

          {isParsed && recipients.length === 0 && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "14px 16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#991B1B" }}>No valid addresses found. Make sure format is: 0xAddress, Amount</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}