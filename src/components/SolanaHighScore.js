import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { serialize, deserialize } from 'borsh';
import { Buffer } from 'buffer';
import '@solana/wallet-adapter-react-ui/styles.css';

// Your deployed program ID
const PROGRAM_ID = new PublicKey('CG2gU9ceocnppE8LA7QXFfHRy4R1m47urJcEJBYY5QWA');
const HIGHSCORE_SEED = 'highscore';

class HighScoreAccount {
  constructor(fields = { user: new Uint8Array(32), score: 0 }) {
    this.user = fields.user;
    this.score = fields.score;
  }
}

const HighScoreSchema = new Map([
  [HighScoreAccount, { kind: 'struct', fields: [['user', [32]], ['score', 'u32']] }],
]);

const SolanaHighScore = ({ currentScore }) => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHighScorePDA = async (userPubkey) => {
    return await PublicKey.findProgramAddress(
      [Buffer.from(HIGHSCORE_SEED), userPubkey.toBuffer()],
      PROGRAM_ID
    );
  };

  const fetchHighScore = async () => {
    if (!publicKey) return;
    
    try {
      setError(null);
      const [pda] = await getHighScorePDA(publicKey);
      const accountInfo = await connection.getAccountInfo(pda);
      
      if (accountInfo) {
        const highScoreData = deserialize(
          HighScoreSchema,
          HighScoreAccount,
          accountInfo.data
        );
        setHighScore(highScoreData.score);
      }
    } catch (error) {
      console.error('Error fetching high score:', error);
      setError('Failed to fetch high score');
    }
  };

  const submitHighScore = async (score) => {
    if (!publicKey || !sendTransaction) return;
    
    try {
      setLoading(true);
      setError(null);
      const [pda] = await getHighScorePDA(publicKey);
      
      const instructionData = Buffer.from(
        Uint8Array.of(0, ...serialize(HighScoreSchema, new HighScoreAccount({ score })))
      );

      const transaction = new Transaction().add({
        keys: [
          { pubkey: pda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      await fetchHighScore();
    } catch (error) {
      console.error('Error submitting high score:', error);
      setError('Failed to submit high score');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchHighScore();
    }
  }, [publicKey]);

  useEffect(() => {
    if (currentScore > highScore && connected) {
      submitHighScore(currentScore);
    }
  }, [currentScore, connected]);

  return (
    <div className="solana-highscore" style={{
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-end'
    }}>
      <div style={{ transform: 'scale(0.8)' }}>
        <WalletMultiButton />
      </div>
      {connected && (
        <div className="score-display" style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '8px 12px',
          borderRadius: '5px',
          color: 'white',
          fontSize: '0.9em',
          minWidth: '120px',
          textAlign: 'right'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1em' }}>High Score: {highScore}</h3>
          {loading && <p style={{ margin: '5px 0', fontSize: '0.9em' }}>Updating score...</p>}
          {error && <p className="error" style={{ color: '#ff6b6b', margin: '5px 0', fontSize: '0.9em' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default SolanaHighScore; 