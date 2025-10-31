import { useState } from 'react';
import VehicleSwitcher from './VehicleSwitcher';
import GitHubIcon from '../assets/images/icons/GitHub.svg';
import { useMultiplayer } from '../hooks/useMultiplayer'; 

function Header() {
    const [roomCode, setRoomCode] = useState('');
    const [username, setUsername] = useState('');
    
    // Hook se multiplayerMessage aur clearMessage lein
    const { joinRoom, isConnected, multiplayerMessage, clearMessage, socketId } = useMultiplayer(); 

    const handleJoinCreateRace = (action) => {
        if (!roomCode || !username) {
            alert(`Please enter both a Username and a Game Code to ${action}.`);
            return;
        }
        
        joinRoom(roomCode, username);
    };

    // --- Pop-up Message Component ---
    const MessagePopup = () => {
        if (!multiplayerMessage) return null;

        const baseClasses = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded shadow-lg text-white font-bold z-[100]";
        const typeClasses = multiplayerMessage.type === 'success' 
            ? 'bg-green-500' 
            : multiplayerMessage.type === 'error' 
            ? 'bg-red-500' 
            : 'bg-blue-500';

        return (
            <div className={`${baseClasses} ${typeClasses} flex items-center space-x-4`} role="alert">
                <span>{multiplayerMessage.text}</span>
                <button 
                    onClick={clearMessage} 
                    className="ml-4 p-1 text-sm rounded-full hover:bg-white hover:bg-opacity-20 transition"
                >
                    &times;
                </button>
            </div>
        );
    };

    const displayUsername = username || (socketId ? `Racer-${socketId.substring(0, 4)}` : 'Racer');

    return (
        <>
            {/* Display the Pop-up */}
            <MessagePopup /> 
            
            <div id='header' className='absolute top-0 h-15 grid grid-cols-[1fr_auto_1fr] items-stretch w-full border-none z-50 text-stone-900'>
                {/* Left side: Room Join/Create UI */}
                <div className='flex items-center space-x-2 p-3'>
                    {isConnected ? (
                        <span className='text-green-500 font-bold text-sm'>
                            Racer: {displayUsername} | Room: {roomCode} 🟢
                        </span>
                    ) : (
                        <div className="flex space-x-2 items-center">
                            <input
                                type="text"
                                placeholder="Your Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="p-1 border rounded text-stone-900 w-32"
                                aria-label="Username"
                            />
                            <input
                                type="text"
                                placeholder="Game Code (e.g., 1234)"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className="p-1 border rounded text-stone-900 w-32"
                                aria-label="Game Code"
                            />
                            
                            <button
                                onClick={() => handleJoinCreateRace('create')}
                                className="bg-green-600 text-white p-1 rounded hover:bg-green-700 transition text-sm"
                                disabled={!roomCode || !username}
                            >
                                ➕ Create Room
                            </button>
                            <button
                                onClick={() => handleJoinCreateRace('join')}
                                className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition text-sm"
                                disabled={!roomCode || !username}
                            >
                                ➡️ Join Room
                            </button>
                        </div>
                    )}
                </div>

                {/* Center: Vehicle Switcher */}
                <div className='min-w-0 justify-self-center flex items-center justify-center'>
                    <VehicleSwitcher />
                </div>

                {/* Right side */}
                <div className='flex items-center justify-end p-3'>
                    {/* ... */}
                </div>
            </div>
        </>
    );
}

export default Header;
