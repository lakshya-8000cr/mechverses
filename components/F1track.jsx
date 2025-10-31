import { Shape, ExtrudeGeometry, Vector3, CatmullRomCurve3 } from "three"
import { useMemo } from "react"
import { RigidBody } from "@react-three/rapier"

export default function F1Track() {
  const points = [
    new Vector3(0,0,0),
    new Vector3(120,0,200),
    new Vector3(350,0,200),
    new Vector3(550,0,0),
    new Vector3(350,0,-200),
    new Vector3(120,0,-200),
  ]

  const curve = useMemo(() => new CatmullRomCurve3(points, true, "catmullrom", 0.2), [])

  const geometry = useMemo(() => {
    const shape = new Shape()
    const halfWidth = 6

    shape.moveTo(-halfWidth, 0)
    shape.lineTo(halfWidth, 0)
    shape.lineTo(halfWidth, 30)
    shape.lineTo(-halfWidth, 30)
    shape.lineTo(-halfWidth, 0)

    return new ExtrudeGeometry(shape, {
      steps: 500,
      extrudePath: curve,
      bevelEnabled: false
    })
  }, [])

  return (
    <group>
      <RigidBody type="fixed">
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color={"#1a1a1a"} />
        </mesh>
      </RigidBody>

      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8000, 8000]} />
        <meshStandardMaterial color={"#1b5e20"} />
      </mesh>
    </group>
  )
}
