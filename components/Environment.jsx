import { memo, useRef } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { TextureLoader, EquirectangularReflectionMapping } from "three";
import { OrbitControls } from "@react-three/drei";
import useGameStore from "../store/gameStore";
import Track from "./Track.jsx";
import VehicleManager from "./VehicleManager.jsx";

const EquirectEnvMap = () => {
  const texture = useLoader(TextureLoader, "/assets/images/envmap/gainmap.webp");
  texture.mapping = EquirectangularReflectionMapping;

  const { scene } = useThree();
  scene.environment = texture;

  return null;
};

const TargetLight = () => {
  const lightRef = useRef();

  useFrame(() => {
    const { cameraTarget } = useGameStore.getState();
    if (!lightRef.current) return;

    lightRef.current.position.set(cameraTarget.x + 10, 10, cameraTarget.z + 10);
    lightRef.current.target.position.copy(cameraTarget);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      castShadow
      intensity={1.5}
      position={[10, 10, 10]}
      shadow-camera-far={50}
    />
  );
};

const SceneEnvironment = memo(() => {
  return (
    <>
      <OrbitControls />
      <color attach="background" args={["#b8d9f9"]} />

      <TargetLight />
      <EquirectEnvMap />

      {/* ✅ Bina Physics — Normal 3D World */}
      <Track />
      {/* <VehicleManager /> */}
    </>
  );
});

export default SceneEnvironment;
