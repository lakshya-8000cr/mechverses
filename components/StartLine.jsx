import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import useGameStore from '../store/gameStore';

const StartLine = ({ vehicleRef }) => {
    const meshRef = useRef();
    const hasEnteredZone = useRef(false);

    useFrame(() => {
        // ========== FIX: Access the RigidBody correctly ==========
        // vehicleRef.current is the ref from useImperativeHandle
        // We need to access .current again to get the actual RigidBody
        const rigidBody = vehicleRef?.current?.current;
        
        if (!rigidBody) {
            return;
        }
        // =========================================================

        const { 
            raceState, 
            startPosition, 
            hasPassedCheckpoint,
            setLapCount, 
            setFinishTime,
            setRaceState,
            setHasPassedCheckpoint,
            setBestLapTime,
            bestLapTime,
            startTime,
            showNotification
        } = useGameStore.getState();

        if (raceState !== 'racing') return;

        // Get vehicle position
        const vehiclePos = rigidBody.translation();

        // Start line zone (adjust these coordinates based on your track)
        const startLineX = -10; // Match the vehicle start position X
        const startLineZ = -10; // Match the vehicle start position Z
        const detectionRadius = 3; // Detection zone radius

        // Calculate distance from start line
        const distanceFromStart = Math.sqrt(
            Math.pow(vehiclePos.x - startLineX, 2) + 
            Math.pow(vehiclePos.z - startLineZ, 2)
        );

        const isInZone = distanceFromStart < detectionRadius;

        // Lap detection logic
        if (isInZone && !hasEnteredZone.current) {
            // Vehicle entered the start zone
            hasEnteredZone.current = true;

            // Only count lap if vehicle has passed a checkpoint (driven around the track)
            if (hasPassedCheckpoint) {
                // LAP COMPLETED!
                const finishTime = Date.now();
                const lapTime = finishTime - startTime;

                setLapCount(1);
                setFinishTime(finishTime);
                setRaceState('finished');

                // Check if it's a new best time
                if (!bestLapTime || lapTime < bestLapTime) {
                    setBestLapTime(lapTime);
                    showNotification({
                        type: 'success',
                        message: '🏆 New Best Time!',
                        duration: 3000
                    });
                }

                console.log('🏁 Lap completed!', lapTime / 1000, 'seconds');
            }
        } else if (!isInZone && hasEnteredZone.current) {
            // Vehicle left the start zone
            hasEnteredZone.current = false;
            
            // Mark that vehicle has left start area (acts as checkpoint)
            if (!hasPassedCheckpoint) {
                setHasPassedCheckpoint(true);
                console.log('✓ Checkpoint passed - lap will count when you return');
            }
        }
    });

    return (
        <group position={[-10, 0.1, -10]}>
            {/* Visual start line */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4, 0.5]} />
                <meshStandardMaterial 
                    color="#ffffff" 
                    emissive="#00ff00"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Checkered pattern */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4, 0.5]} />
                <meshStandardMaterial 
                    color="#000000"
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Start line marker (invisible but helps with positioning) */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial visible={false} />
            </mesh>
        </group>
    );
};

export default StartLine;