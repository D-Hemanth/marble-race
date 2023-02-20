import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF } from '@react-three/drei'
import useGame from './stores/useGame.jsx'

/**
 * Deactivate legacy mode color management of threejs so that R3F can handle it automatically
 */
THREE.ColorManagement.legacyMode = false

// for optimization of performances just create the box plane, materials once & then use it for all blocks
// geometry box plane for the floor
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
// materials
const floor1Material = new THREE.MeshStandardMaterial({
  color: '#111111',
  metalness: 0,
  roughness: 0,
})
const floor2Material = new THREE.MeshStandardMaterial({
  color: '#222222',
  metalness: 0,
  roughness: 0,
})
// we don't want our obstacle material to be reflective like a mirror so we put roughness to 1
const obstacleMaterial = new THREE.MeshStandardMaterial({
  color: '#ff0000',
  metalness: 0,
  roughness: 1,
})
const wallMaterial = new THREE.MeshStandardMaterial({
  color: '#887777',
  metalness: 0,
  roughness: 0,
})

/**
 * start block
 */
export function BlockStart({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Float floatIntensity={0.25} rotationIntensity={0.25}>
        <Text
          font="./bebas-neue-v9-latin-regular.woff"
          scale={0.35}
          maxWidth={0.25}
          lineHeight={0.75}
          textAlign="right"
          position={[0.75, 0.65, 0]}
          rotation-y={-0.25}
          color="#0000ff"
        >
          Marble Race
          <meshBasicMaterial toneMapped={false} />
        </Text>
      </Float>
      {/* Floor */}
      <mesh
        geometry={boxGeometry}
        material={floor1Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
    </group>
  )
}

/**
 * End block
 */
export function BlockEnd({ position = [0, 0, 0] }) {
  const hamburger = useGLTF('./hamburger.glb')
  hamburger.scene.children.forEach((mesh) => {
    mesh.castShadow = true
  })

  return (
    <group position={position}>
      <Text
        font="./bebas-neue-v9-latin-regular.woff"
        scale={0.7}
        position={[0, 2.25, 2]}
        color="gold"
      >
        FINISH
        <meshBasicMaterial toneMapped={false} />
      </Text>
      {/* Floor */}
      <mesh
        geometry={boxGeometry}
        material={floor1Material}
        position={[0, 0, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
      <RigidBody
        type="fixed"
        colliders="hull"
        position={[0, 0.25, 0]}
        restitution={0.2}
        friction={0}
      >
        <primitive object={hamburger.scene} scale={0.2} />
      </RigidBody>
    </group>
  )
}

/**
 * 1st trapblock - spinner
 */
export function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef() // use the reference to animate the obstacle
  // to change the obstale rotation speed on each render with change in rotation direction also
  const [speed] = useState(
    () => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1)
  )

  // useFrame hook to animate the obstacle on each frame
  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // to use setNextKinematicRotation is expecting a quaternion so we create a threejs euler & convert it ot quaternion
    const rotation = new THREE.Quaternion()
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
    obstacle.current.setNextKinematicRotation(rotation)
  })

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floor2Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[3.5, 0.3, 0.3]}
          castShadow
          receiveShadow
        />
      </RigidBody>
    </group>
  )
}

/**
 * 2nd trapblock - Limbo block that moves up & down(like in the limbo game)
 */
export function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef() // use the reference to animate the obstacle
  // to change the obstacle translation by using the timeOffset from 0 to Math.PI offset distance
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

  // useFrame hook to animate the obstacle on each frame
  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // to use setNextKinematicTranslation to move up & down using sin() & time with timeOffset
    const y = Math.sin(time + timeOffset) + 1.15
    // in case if the position of the obstacle changes even then since we set position array values inside setNextKinematicTranslation it will be updated
    obstacle.current.setNextKinematicTranslation({
      x: position[0],
      y: position[1] + y,
      z: position[2],
    })
  })

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floor2Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[3.5, 0.3, 0.3]}
          castShadow
          receiveShadow
        />
      </RigidBody>
    </group>
  )
}

/**
 * 3rd trapblock - Axe trap block from side to side
 */
export function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef() // use the reference to animate the obstacle
  // to change the obstacle translation by using the timeOffset from 0 to Math.PI offset distance
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

  // useFrame hook to animate the obstacle on each frame
  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // to use setNextKinematicTranslation to move up & down using sin() & time with timeOffset
    const x = Math.sin(time + timeOffset) * 1.25
    // in case if the position of the obstacle changes even then since we set position array values inside setNextKinematicTranslation it will be updated
    obstacle.current.setNextKinematicTranslation({
      x: position[0] + x,
      y: position[1] + 0.75,
      z: position[2],
    })
  })

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floor2Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[1.5, 1.5, 0.3]}
          castShadow
          receiveShadow
        />
      </RigidBody>
    </group>
  )
}

/**
 *  boundary walls
 */
function Bounds({ length = 1 }) {
  return (
    <>
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          position={[2.15, 0.75, -(length * 2) + 2]}
          scale={[0.3, 1.5, 4 * length]}
          castShadow
        />
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          position={[-2.15, 0.75, -(length * 2) + 2]}
          scale={[0.3, 1.5, 4 * length]}
          receiveShadow
        />
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          position={[0, 0.75, -(length * 4) + 2]}
          scale={[4, 1.5, 0.3]}
          receiveShadow
        />
        <CuboidCollider
          args={[2, 0.1, 2 * length]}
          position={[0, -0.1, -(length * 2) + 2]}
          restitution={0.2}
          friction={1}
        />
      </RigidBody>
    </>
  )
}

export function Level({
  count = 5,
  types = [BlockSpinner, BlockAxe, BlockLimbo],
  seed = 0,
}) {
  const blocks = useMemo(() => {
    const blocks = []

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)] // generate a count long array of random traps chosen from the types array
      blocks.push(type)
    }

    return blocks
  }, [count, types, seed])
  // console.log(blocks)

  // By HD - add Bloom attributes to obstacleMaterial based on a boolean value
  const applyEffect = Math.random() - 0.1 > 0.5 ? true : false
  if (applyEffect) {
    obstacleMaterial.color.set(new THREE.Color(2.5, 1, 1.5))
    obstacleMaterial.emissive = new THREE.Color('red')
    obstacleMaterial.emissiveIntensity = 4
    obstacleMaterial.toneMapped = false
  }

  return (
    <>
      <BlockStart position={[0, 0, 0]} />

      {blocks.map((Block, index) => (
        <Block key={index} position={[0, 0, -(index + 1) * 4]} />
      ))}

      <BlockEnd position={[0, 0, -(count + 1) * 4]} />

      <Bounds length={count + 2} />
    </>
  )
}
