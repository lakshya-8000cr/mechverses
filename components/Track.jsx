import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

const Track = () => {
  const { scene } = useGLTF("/assets/models/track1.glb");

  return (
    <RigidBody type="fixed" colliders="trimesh" restitution={0} friction={1}>
      <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} />
    </RigidBody>
  );
};

export default Track;
