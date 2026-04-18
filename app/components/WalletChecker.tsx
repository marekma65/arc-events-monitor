"use client";

import { useState } from "react";
import { createPublicClient, http, erc20Abi, formatUnits } from "viem";
import { arcTestnet, ARC_RPC, EXPLORER_URL, USDC_ADDRESS, EURC_ADDRESS } from "../../lib/arc-config";

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_RPC),
});

interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
  color: string;
}

interface NFTInfo {
  contractAddress: string;
  tokenId: string;
}

export default function WalletChecker() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [txCount, setTxCount] = useState<string>("");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);

  async function checkWallet() {
    if (!walletAddress || walletAddress.length < 10) return;
    setIsLoading(true);
    setError("");
    setBalances([]);
    setTxCount("");
    setChecked(false);

    try {
      const addr = walletAddress as `0x${string}`;

      // Native USDC balance
      const nativeBalance = await client.getBalance({ address: addr });
      const usdcBalance = formatUnits(nativeBalance, 6);

      // EURC balance
      const eurcRaw = await client.readContract({
        address: EURC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [addr],
      });
      const eurcBalance = formatUnits(eurcRaw, 6);

      // Transaction count
      const txCountHex = await client.getTransactionCount({ address: addr });

      setBalances([
        { symbol: "USDC", balance: Number(usdcBalance).toFixed(4), address: USDC_ADDRESS, color: "#60A5FA" },
        { symbol: "EURC", balance: Number(eurcBalance).toFixed(4), address: EURC_ADDRESS, color: "#34D399" },
      ]);
      setTxCount(txCountHex.toString());
      setChecked(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch wallet data");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC", margin: "0 0 4px" }}>Wallet Checker</h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Check any wallet balance on Arc Testnet</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Wallet address (0x...)"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #334155", fontSize: "14px", background: "#1E293B", color: "#F8FAFC", outline: "none", fontFamily: "monospace" }}
        />
        <button
          onClick={checkWallet}
          disabled={!walletAddress || isLoading}
          style={{ background: !walletAddress || isLoading ? "#334155" : "#3B82F6", border: "none", borderRadius: "12px", padding: "12px 24px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: !walletAddress || isLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
        >
          {isLoading ? "Checking..." : "Check Wallet"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#991B1B" }}>{error}</p>
        </div>
      )}

      {checked && (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {balances.map((token) => (
              <div key={token.symbol} style={{ background: "#1E293B", borderRadius: "16px", padding: "20px", border: "1px solid #334155", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 8px" }}>{token.symbol}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: token.color, margin: 0 }}>{token.balance}</p>
              </div>
            ))}
            <div style={{ background: "#1E293B", borderRadius: "16px", padding: "20px", border: "1px solid #334155", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 8px" }}>Transactions</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#F8FAFC", margin: 0 }}>{txCount}</p>
            </div>
          </div>

          {/* Explorer Link */}
          <div style={{ background: "#1E293B", borderRadius: "12px", padding: "14px 16px", border: "1px solid #334155" }}>
            <a href={EXPLORER_URL + "/address/" + walletAddress} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none", fontWeight: 600 }}>
              View on ArcScan →
            </a>
          </div>
        </>
      )}
    </div>
  );
}