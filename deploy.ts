import * as dotenv from 'dotenv';
dotenv.config();

import {
  clusterApiUrl,
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

import {
  createMint,
  mintTo,
  createAccount,
  getMintLen,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  unpackAccount,
  getTransferFeeAmount,
  createInitializeTransferFeeConfigInstruction,
  harvestWithheldTokensToMint,
  transferCheckedWithFee,
  withdrawWithheldTokensFromAccounts,
  withdrawWithheldTokensFromMint,
} from '@solana/spl-token';

import { loadSecretKey, saveSecretKey } from './utils';

const decimals = 9;
const maxSupply = BigInt(1_000_000_000_000_000); // 1M token

(async () => {
  const signer = await loadSecretKey('signer.key');
  if (!signer) {
    process.exit(1);
  }
  const mintAuthority = signer;
  const freezeAuthority = signer;
  const mintKeypair = Keypair.generate();
  saveSecretKey(mintKeypair, 'mint.key');
  // const mintKeypair = await loadSecretKey('mint.key');
  // if (!mintKeypair) process.exit(1);
  const mint = mintKeypair.publicKey;
  console.log('Token address :>> ', mint.toString());

  const connection = new Connection(
    clusterApiUrl(
      process.env.NODE_ENV == 'production' ? 'mainnet-beta' : 'devnet'
    ),
    'confirmed'
  );

  // deploy token
  await createMint(
    connection,
    signer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9,
    mintKeypair,
    undefined,
    TOKEN_PROGRAM_ID
  );
  console.log('Token deployed');

  // mint
  const mintAmount = maxSupply;
  const tokenAccount = await createAccount(
    connection,
    signer,
    mint,
    signer.publicKey,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );
  console.log('Token Account :>>', tokenAccount.toString());

  await mintTo(
    connection,
    signer,
    mint,
    tokenAccount,
    mintAuthority,
    mintAmount,
    [],
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log('Token minted');
})();
