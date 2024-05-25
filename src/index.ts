// Load PRIVATE_KEY from .env
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import { sendBundle, sendTransaction } from "./jito-rpc";
dotenv.config();

const TIP_ACCOUNTS = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
].map((pubkey) => new PublicKey(pubkey));

const getRandomTipAccount = () =>
  TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];

// Load PRIVATE_KEY from .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const payer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY!));
const connection = new Connection("https://api.mainnet-beta.solana.com");

const memoIx = new TransactionInstruction({
  keys: [
    {
      pubkey: payer.publicKey,
      isSigner: true,
      isWritable: true,
    },
  ],
  data: Buffer.from("jito example", "utf-8"),
  programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
});

async function main() {
  const blockhash = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: [memoIx],
  }).compileToV0Message();
  const tx = new VersionedTransaction(message);
  tx.sign([payer]);

  // Send transaction with jito transaction endpoint
  const transactionResp = await sendTransaction(tx, true);
  console.log(transactionResp.data);

  const tipIx = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: getRandomTipAccount(),
    lamports: 20_000, // Minimum tip is 10_000 lamports
  });

  const messageBundle = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: [memoIx, tipIx],
  }).compileToV0Message();
  const bundleTx = new VersionedTransaction(messageBundle);
  bundleTx.sign([payer]);
  // Send transaction with jito bundle endpoint. You can bundle up to 5 tx in one bundle
  const bundleResp = await sendBundle([bundleTx]);
  console.log(bundleResp.data);
}

main().catch(console.error);
