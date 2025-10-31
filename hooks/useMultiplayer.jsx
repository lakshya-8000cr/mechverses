import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// Server URL (Make sure this matches your Node.js server port)
const SERVER_URL = 'http://localhost:3001'; 

// Socket ko initialize karein, lekin auto-connect na karein
const socket = io(SERVER_URL, { autoConnect: false }); 

export const useMultiplayer = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [remotePlayers, setRemotePlayers] = useState({}); 
    const [multiplayerMessage, setMultiplayerMessage] = useState(null); 
    
    const socketRef = useRef(socket);

    // Function to clear the message
    const clearMessage = useCallback(() => {
        setMultiplayerMessage(null);
    }, []);

    // Function to initiate connection and room join
    const joinRoom = useCallback((code, username) => {
        if (socketRef.current.connected) return;

        socketRef.current.connect();
        
        // Show immediate info message
        setMultiplayerMessage({ type: 'info', text: `Connecting and attempting to join room ${code}...` });

        // Emit the 'joinRoom' event once connected
        socketRef.current.on('connect', () => {
            console.log('Socket Connected! Attempting to join room...');
            socketRef.current.emit('joinRoom', { code, username });
            setIsConnected(true);
        });
    }, []);

    // Function to send the local player's movement data
    const sendMovement = useCallback((code, position, rotation) => {
        if (socketRef.current.connected) {
            socketRef.current.emit('playerMove', { 
                code, 
                position: position, 
                rotation: rotation 
            });
        }
    }, []);


    useEffect(() => {
        // --- Event Handlers ---
        
        const handleRoomState = (players) => {
            setRemotePlayers(currentPlayers => {
                const newPlayers = { ...currentPlayers };
                Object.values(players).forEach(player => {
                    if (player.id !== socketRef.current.id) {
                        newPlayers[player.id] = player;
                    }
                });
                return newPlayers;
            });
        };

        const handlePlayerJoined = (player) => {
            setRemotePlayers(currentPlayers => ({
                ...currentPlayers,
                [player.id]: player
            }));
        };

        const handlePlayerMoved = ({ id, position, rotation }) => {
            setRemotePlayers(currentPlayers => {
                if (currentPlayers[id]) {
                    return {
                        ...currentPlayers,
                        [id]: {
                            ...currentPlayers[id],
                            position: position,
                            rotation: rotation,
                        }
                    };
                }
                return currentPlayers;
            });
        };

        const handlePlayerLeft = (id) => {
            setRemotePlayers(currentPlayers => {
                const newPlayers = { ...currentPlayers };
                delete newPlayers[id];
                return newPlayers;
            });
        };
        
        // --- NEW: HANDLE SERVER ACKNOWLEDGEMENT (Pop-up message) ---
        const handleRoomAck = (data) => {
            setMultiplayerMessage({ 
                type: data.success ? 'success' : 'error', 
                text: data.message 
            });
            
            const timer = setTimeout(() => {
                setMultiplayerMessage(null);
            }, 5000); 
            
            return () => clearTimeout(timer);
        };
        
        // --- HANDLE GENERAL ERRORS ---
        const handleError = (message) => {
            setMultiplayerMessage({ type: 'error', text: message });
        }


        // Setup Listeners
        socketRef.current.on('roomState', handleRoomState);
        socketRef.current.on('playerJoined', handlePlayerJoined);
        socketRef.current.on('playerMoved', handlePlayerMoved);
        socketRef.current.on('playerLeft', handlePlayerLeft);
        socketRef.current.on('roomAck', handleRoomAck); 
        socketRef.current.on('error', handleError);    
        socketRef.current.on('disconnect', () => setIsConnected(false));
        
        // Cleanup function
        return () => {
            socketRef.current.off('roomState', handleRoomState);
            socketRef.current.off('playerJoined', handlePlayerJoined);
            socketRef.current.off('playerMoved', handlePlayerMoved);
            socketRef.current.off('playerLeft', handlePlayerLeft);
            socketRef.current.off('roomAck', handleRoomAck); 
            socketRef.current.off('error', handleError);    
            socketRef.current.off('connect');
            socketRef.current.off('disconnect');
        };
    }, []);

    return {
        isConnected,
        socketId: socketRef.current.id,
        remotePlayers,
        multiplayerMessage, 
        joinRoom,
        sendMovement,
        clearMessage,
    };
};
