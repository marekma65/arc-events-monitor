"use client";

import { useState } from "react";
import { createPublicClient, http, decodeFunctionData, parseAbi } from "viem";
import { arcTestnet, ARC_RPC, EXPLORER_URL } from "../../lib/arc-config";

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_RPC),
});

const KNOWN_ABIS = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, string uri) returns (uint256)",
  "function register(string metadataURI)",
  "function bridge(address token, uint256 amount, uint32 destinationDomain, bytes32 mintRecipient)",
]);

interface DecodedTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  functionName?: string;
  args?: Record<string, string>;
  status: string;
  fee: string;
}

export default function TxDecoder() {
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decoded, setDecoded] = useState<DecodedTx | null>(null);
  const [error, setError] = useState("");

  async function decodeTx() {
    if (!txHash || txHash.length < 10) return;
    setIsLoading(true);
    setError("");
    setDecoded(null);

    try {
      const tx = await client.getTransaction({ hash: txHash as `0x${string}` });
      const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });

      let functionName: string | undefined;
      let args: Record<string, string> = {};

      if (tx.input && tx.input !== "0x") {
        try {
          const result = decodeFunctionData({ abi: KNOWN_ABIS, data: tx.input });
          functionName = result.functionName;
          if (result.args) {
            result.args.forEach((arg, i) => {
              args[`arg${i}`] = String(arg);
            });
          }
        } catch {
          functionName = "Unknown function";
          args = { data: tx.input.slice(0, 10) + "..." };
        }
      }

      const gasUsed = receipt.gasUsed;
      const gasPrice = tx.gasPrice ?? 0n;
      const feeWei = gasUsed * gasPrice;
      const feeUsdc = Number(feeWei) / 1e18;

      setDecoded({
        hash: tx.hash,
        from: tx.from,
        to: tx.to ?? "Contract Creation",
        value: String(tx.value),
        blockNumber: String(tx.blockNumber),
        functionName,
        args,
        status: receipt.status === "success" ? "Success" : "Failed",
        fee: feeUsdc.toFixed(6),
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to decode transaction");
    } finally {
      setIsLoading(false);
    }
  }

  function shortAddr(addr: string) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 10) + "..." + addr.slice(-8);
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC", margin: "0 0 4px" }}>Transaction Decoder</h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Decode any Arc transaction in plain English</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Transaction hash (0x...)"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #334155", fontSize: "14px", background: "#1E293B", color: "#F8FAFC", outline: "none", fontFamily: "monospace" }}
        />
        <button
          onClick={decodeTx}
          disabled={!txHash || isLoading}
          style={{ background: !txHash || isLoading ? "#334155" : "#3B82F6", border: "none", borderRadius: "12px", padding: "12px 24px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: !txHash || isLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
        >
          {isLoading ? "Decoding..." : "Decode"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#991B1B" }}>{error}</p>
        </div>
      )}

      {decoded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Status Banner */}
          <div style={{ background: decoded.status === "Success" ? "#166534" : "#991B1B", borderRadius: "12px", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              {decoded.status === "Success" ? "✓ Transaction Successful" : "✕ Transaction Failed"}
            </span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>Block #{decoded.blockNumber}</span>
          </div>

          {/* Function */}
          {decoded.functionName && (
            <div style={{ background: "#1E293B", borderRadius: "12px", padding: "16px 20px", border: "1px solid #334155" }}>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 6px" }}>Function called</p>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#A78BFA", margin: 0, fontFamily: "monospace" }}>{decoded.functionName}()</p>
              {Object.entries(decoded.args ?? {}).map(([key, val]) => (
                <p key={key} style={{ fontSize: "13px", color: "#94A3B8", margin: "4px 0 0", fontFamily: "monospace" }}>
                  <span style={{ color: "#64748B" }}>{key}: </span>{String(val).length > 50 ? String(val).slice(0, 50) + "..." : String(val)}
                </p>
              ))}
            </div>
          )}

          {/* From / To */}
          <div style={{ background: "#1E293B", borderRadius: "12px", padding: "16px 20px", border: "1px solid #334155" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 6px" }}>From</p>
                <a href={EXPLORER_URL + "/address/" + decoded.from} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#60A5FA", fontFamily: "monospace", textDecoration: "none" }}>{shortAddr(decoded.from)}</a>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 6px" }}>To</p>
                <a href={EXPLORER_URL + "/address/" + decoded.to} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#60A5FA", fontFamily: "monospace", textDecoration: "none" }}>{shortAddr(decoded.to)}</a>
              </div>
            </div>
          </div>

          {/* Fee */}
          <div style={{ background: "#1E293B", borderRadius: "12px", padding: "16px 20px", border: "1px solid #334155", display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 6px" }}>Transaction fee</p>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#60A5FA", margin: 0 }}>{decoded.fee} USDC</p>
            </div>
            <a href={EXPLORER_URL + "/tx/" + decoded.hash} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none", fontWeight: 600, alignSelf: "center" }}>
              View on ArcScan →
            </a>
          </div>

        </div>
      )}
    </div>
  );
}