import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { Buffer } from 'buffer';
import '@solana/wallet-adapter-react-ui/styles.css';
import bgImage from '../res/backWal2.png';

// Your deployed program ID
const PROGRAM_ID = new PublicKey('EhjppSC6Etd2ZbXtc849HHHoTKNLGJC2EmjHwhSD5F2j');
const HIGHSCORE_SEED = 'highscore';

const SolanaHighScore = ({ currentScore, gameState }) => {
  const { publicKey, sendTransaction, connected, disconnect, wallet } = useWallet();
  const { connection } = useConnection();
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSubmittedScore, setLastSubmittedScore] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [username, setUsername] = useState('Player');
  const [program, setProgram] = useState(null);

  useEffect(() => {
    const setupProgram = async () => {
      if (publicKey && connection && wallet) {
        try {
          const provider = new AnchorProvider(
            connection,
            wallet.adapter,
            { 
              preflightCommitment: 'confirmed',
              commitment: 'confirmed'
            }
          );
          
          // Load your IDL here
          const idl = {
            "version": "0.1.0",
            "name": "flappy_bird",
            "instructions": [
              {
                "name": "submitScore",
                "accounts": [
                  {
                    "name": "highScore",
                    "isMut": true,
                    "isSigner": false
                  },
                  {
                    "name": "player",
                    "isMut": true,
                    "isSigner": true
                  },
                  {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                  }
                ],
                "args": [
                  {
                    "name": "username",
                    "type": "string"
                  },
                  {
                    "name": "score",
                    "type": "u32"
                  }
                ]
              }
            ],
            "accounts": [
              {
                "name": "HighScore",
                "type": {
                  "kind": "struct",
                  "fields": [
                    {
                      "name": "username",
                      "type": "string"
                    },
                    {
                      "name": "score",
                      "type": "u32"
                    }
                  ]
                }
              }
            ]
          };
          
          const program = new Program(idl, PROGRAM_ID, provider);
          setProgram(program);
          console.log('Program setup complete');
        } catch (err) {
          console.error('Error setting up program:', err);
          setError('Failed to setup program');
        }
      }
    };

    setupProgram();
  }, [publicKey, connection, wallet]);

  const getHighScorePDA = async (userPubkey) => {
    return await PublicKey.findProgramAddress(
      [Buffer.from(HIGHSCORE_SEED), userPubkey.toBuffer()],
      PROGRAM_ID
    );
  };

  const fetchHighScore = async () => {
    if (!publicKey || !program) return;
    
    try {
      setError(null);
      const [pda] = await getHighScorePDA(publicKey);
      
      try {
        const account = await program.account.highScore.fetch(pda);
        if (account) {
          setHighScore(account.score);
        }
      } catch (fetchError) {
        // Account doesn't exist yet, which is fine
        console.log('No high score account found yet');
        setHighScore(0);
      }
    } catch (error) {
      console.error('Error fetching high score:', error);
      setError('Failed to fetch high score');
    }
  };

  const submitGameScore = async () => {
    if (gameState === 'GAME_OVER' && currentScore > lastSubmittedScore && connected && program) {
      console.log(`Game over! Submitting score: ${currentScore} (previous: ${lastSubmittedScore})`);
      try {
        setLoading(true);
        setError(null);
        const [pda] = await getHighScorePDA(publicKey);
        
        // Ensure username is properly padded/truncated
        const paddedUsername = username.padEnd(32, ' ').slice(0, 32);
        
        console.log('Submitting transaction...');
        console.log('PDA:', pda.toBase58());
        console.log('Player:', publicKey.toBase58());
        
        // Create the instruction
        const instruction = await program.methods
          .submitScore(paddedUsername, currentScore)
          .accounts({
            highScore: pda,
            player: publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .instruction();

        // Create and sign the transaction
        const transaction = new Transaction().add(instruction);
        
        // Get the latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Send and confirm transaction
        const signature = await sendTransaction(transaction, connection);
        console.log('Transaction sent:', signature);

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        console.log('Transaction confirmed:', confirmation);
        
        await fetchHighScore();
        setLastSubmittedScore(currentScore);
        setRetryCount(0);
      } catch (error) {
        console.error('Error submitting game score:', error);
        let errorMessage = 'Failed to submit game score';
        
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SOL to submit score';
        } else if (error.message.includes('disconnected port')) {
          errorMessage = 'Wallet disconnected. Please reconnect.';
        } else if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else {
          errorMessage = `Failed to submit game score: ${error.message}`;
        }
        
        setError(errorMessage);
        
        if (error.message.includes('disconnected port') && retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            disconnect();
          }, 1000);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (publicKey && program) {
      fetchHighScore();
    }
  }, [publicKey, program]);

  useEffect(() => {
    if (gameState === 'GAME_OVER' && currentScore > lastSubmittedScore && connected) {
      submitGameScore();
    }
  }, [gameState, currentScore, connected]);

  return (
    <div className="solana-highscore" style={{
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-end',
      background: `white url(${bgImage}) no-repeat center center`,
      backgroundSize: 'cover',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <WalletMultiButton
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.25)', // matte, transparent
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
      </div>
      {connected && (
        <div
          className="score-display"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            padding: '18px 24px',
            borderRadius: '12px',   
            color: '#fff',
            minWidth: '160px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            marginBottom: '8px',
            border: '2px solid #00FFA3', // Solana green accent
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '2.8em',
              fontWeight: 'bold',
              color: '#00FFA3', // Solana green
              textShadow: '0 2px 8px #000, 0 0 4px #00FFA3',
              letterSpacing: '1px',
              marginBottom: '6px',
              lineHeight: '1.1',
            }}
          >
            {highScore}
          </div>
          <div
            style={{
              fontSize: '1.2em',
              fontWeight: '600',
              color: '#fff',
              textShadow: '0 1px 4px #000',
              letterSpacing: '0.5px',
            }}
          >
            High Score
          </div>
          {loading && (
            <p style={{ margin: '5px 0', fontSize: '0.9em' }}>Updating score...</p>
          )}
          {error && (
            <p
              className="error"
              style={{ color: '#ff6b6b', margin: '5px 0', fontSize: '0.9em' }}
            >
              {error}
            </p>
          )}
          {gameState === 'GAME_OVER' && currentScore > highScore && (
            <p style={{ color: '#4CAF50', margin: '5px 0', fontSize: '0.9em' }}>
              New High Score!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SolanaHighScore; 