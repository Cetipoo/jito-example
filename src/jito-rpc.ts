import { SendOptions, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import axios from "axios";

// You can change this to a region specific url for better performance
// e.g. https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions
const transactionEndpoint =
  "https://mainnet.block-engine.jito.wtf/api/v1/transactions";

// You can change this to a region specific url for better performance
// e.g. https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles
const bundleEndpoint = "https://mainnet.block-engine.jito.wtf/api/v1/bundles";

// Send a transaction with jito.
// If bundleOnly is set to true, the transaction will only be sent as a bundle
// If false, the transaction will be sent through an rpc endpoint in addition
// Jito will pay a fixed tip for the bundle
// https://jito-labs.gitbook.io/mev/searcher-resources/json-rpc-api-reference/transactions-endpoint/sendtransaction
async function sendTransaction(
  transaction: VersionedTransaction,
  bundleOnly: boolean = false,
  sendOptions: SendOptions = {}
) {
  const url = transactionEndpoint + (bundleOnly ? "?bundleOnly=true" : "");
  const rpcPayload = {
    jsonrpc: "2.0",
    method: "sendTransaction",
    params: [bs58.encode(transaction.serialize()), sendOptions],
    id: bs58.encode(transaction.signatures[0]),
  };
  const response = await axios.post(url, rpcPayload);
  return response;
}

// You need to make sure you are paying for tip in the bundle
// https://jito-labs.gitbook.io/mev/searcher-resources/json-rpc-api-reference/bundles/sendbundle
async function sendBundle(transactions: VersionedTransaction[]) {
  const rpcPayload = {
    jsonrpc: "2.0",
    method: "sendBundle",
    params: [transactions.map((txn) => bs58.encode(txn.serialize()))],
    id: bs58.encode(transactions[0].signatures[0]),
  };
  const response = await axios.post(bundleEndpoint, rpcPayload);
  return response;
}

export { sendTransaction, sendBundle };
