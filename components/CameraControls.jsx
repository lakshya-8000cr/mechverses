import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Vector3, Raycaster, Quaternion } from 'three' // Added Quaternion

import useGameStore from '../store/gameStore'
import useInputStore from '../store/inputStore' // Added useInputStore

// Constants for Drift Cam logic
const INPUT_SCALE = 0.5 // Maximum horizontal shift of the camera target (in meters)
const OFFSET_LERP = 0.05 // Controls how quickly the camera shifts sideways
const VECTORS = { UP: new Vector3(0, 1, 0) } // Helper vector

// Camera controls and chase cam logic
const CameraControls = ({ followSpeed = 0.1, minGroundDistance = 0.5 }) => {
    const cameraAutoRotate = useGameStore((state) => state.cameraAutoRotate)

    //const camera = useThree((state) => state.camera)
    const scene = useThree((state) => state.scene)

    const cameraRef = useRef()
    const cameraControlsRef = useRef()

    const raycaster = useRef(new Raycaster())
    const downDirection = useRef(new Vector3(0, -1, 0))
    const cameraPosition = useRef(new Vector3())
    const carOffset = useRef(new Vector3()) // New ref for horizontal offset

    // Set default camera position based on aspect ratio
    const isPortrait = window.innerWidth / window.innerHeight < 1
    const defaultCameraPosition = isPortrait ? [-2, 3, 12] : [-4, 3, 6.5]

    useFrame(() => {
        if (!cameraControlsRef.current) return

        // 1. Get Steering Input
        const { keys, gamepadAxes } = useInputStore.getState()
        const leftStickX = gamepadAxes[0] || 0
        // Calculate the combined steering input
        const steerInput = (keys.has('ArrowRight') ? -1 : 0) + (keys.has('ArrowLeft') ? 1 : 0) + -leftStickX
        
        // 2. Calculate the desired horizontal offset
        const targetOffset = steerInput * INPUT_SCALE
        
        // 3. Smoothly update the current offset
        carOffset.current.lerp(new Vector3(targetOffset, 0, 0), OFFSET_LERP)

        // Get the base camera target (car's position)
        const target = useGameStore.getState().cameraTarget.clone()
        
        // Calculate the vector from target to camera (the current look direction)
        const targetToCamera = new Vector3().subVectors(cameraRef.current.position, cameraControlsRef.current.target).normalize()
        targetToCamera.y = 0 // Ignore vertical angle for side calculation
        targetToCamera.normalize()
        
        // Calculate the side vector (perpendicular to the current look direction)
        const sideVector = new Vector3().crossVectors(targetToCamera, VECTORS.UP).normalize()
        
        // Apply the side offset to the target
        const offsetTarget = target.add(sideVector.multiplyScalar(carOffset.current.x))

        // Smoothly update the orbit controls target with the new offset.
        cameraControlsRef.current.target.lerp(offsetTarget, followSpeed)
        cameraControlsRef.current.update() // Must be called after LERPing the target

        // Ground avoidance logic
        cameraRef.current.getWorldPosition(cameraPosition.current)
        raycaster.current.set(cameraPosition.current, downDirection.current)

        // Filter for terrain objects
        const terrainObjects = scene.children.filter(
            (obj) => obj.name === 'TerrainManager' || obj.name.includes('Terrain') || (obj.children && obj.children.some((child) => child.name.includes('Terrain')))
        )

        // Get all meshes from terrain objects
        const terrainMeshes = []
        terrainObjects.forEach((obj) => {
            obj.traverse((child) => {
                if (child.isMesh) {
                    terrainMeshes.push(child)
                }
            })
        })

        // Check for intersections with terrain
        const intersects = raycaster.current.intersectObjects(terrainMeshes, true)

        if (intersects.length > 0) {
            // Get the distance to the ground
            const groundDistance = intersects[0].distance

            // If camera is too close to the ground, move it up
            if (groundDistance < minGroundDistance) {
                cameraRef.current.position.y += minGroundDistance - groundDistance
            }
        }
    })

    return (
        <>
            <OrbitControls
                ref={cameraControlsRef}
                enableDamping
                dampingFactor={0.025}
                minDistance={4} // Updated: Min zoom distance (prevents getting too close)
                maxDistance={10} // Updated: Max zoom distance (prevents getting too far)
                minPolarAngle={Math.PI / 3} // Updated: Start angle closer to 'behind' view (60 degrees)
                maxPolarAngle={Math.PI / 2 - 0.2} // Updated: Max angle near pure horizontal (approx 80 degrees)
                autoRotate={cameraAutoRotate}
                autoRotateSpeed={-0.3}
            />
            <PerspectiveCamera ref={cameraRef} fov={24} position={defaultCameraPosition} makeDefault />
        </>
    )
}

export default CameraControls