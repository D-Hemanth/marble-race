import { useRapier, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import useGame from './stores/useGame.jsx'
import * as THREE from 'three'

export default function Player() {
  const body = useRef() // ref to rigidBody to apply an impulse
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const { rapier, world } = useRapier() // use useRapier hook to access rapier, world for ray casting
  const rapierWorld = world.raw()

  // create cameraPosition & cameraTarget to follow the marble & for lerping on each frame to smoothen the follow motion
  const [smoothedCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10))
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3())

  // useGame hook from the store to retrieve the phases of the game
  const start = useGame((state) => state.start)
  const end = useGame((state) => state.end)
  const restart = useGame((state) => state.restart)
  const blocksCount = useGame((state) => state.blocksCount)

  // create the jump outside useEffect to reduce the number of re-renders
  const jump = () => {
    // create origin position of the ball slightly below the ball radius for ray casting
    const origin = body.current.translation()
    origin.y -= 0.31 // 0.31 as the ball radius is 0.30 we want origin to be slightly below
    const direction = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(origin, direction)
    const hit = rapierWorld.castRay(ray, 10, true)

    // check if hit.toi - time of impact distance is still less than 0.15
    if (hit.toi < 0.15) body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
  }

  // reset the marble if it falls down or phase changes to ready
  const reset = () => {
    // put marble back at origin without any linear & angular velocities from previous run
    body.current.setTranslation({ x: 0, y: 1, z: 0 })
    body.current.setLinvel({ x: 0, y: 0, z: 0 })
    body.current.setAngvel({ x: 0, y: 0, z: 0 })
  }

  // check if jump key is being pressed using subscribeKeys state
  useEffect(() => {
    // subscribe to phase changes in the store using subscribe method of useGame
    const unsubscribeReset = useGame.subscribe(
      // first function is a selector to listen to changes in phase
      (state) => state.phase,
      // once phase changes we call this function
      (value) => {
        // console.log('phase changed to', value)
        if (value === 'ready') reset()
      }
    )

    const unsubscribeJump = subscribeKeys(
      // first function is a selector to listen to changes on the keys
      (state) => state.jump,
      // once keys changes we call this function
      (value) => {
        if (value) jump()
      }
    )

    const unsubscribeAnyKey = subscribeKeys(() => {
      // console.log('any key down')
      start()
    })

    // return function is called when the component is being disposed in cleanup phase
    return () => {
      unsubscribeJump() // this function will be disposed off
      unsubscribeAnyKey() // this function will be disposed off
      unsubscribeReset()
    }
  }, [])

  // make the ball roll based which key is pressed on the keyboard
  useFrame((state, delta) => {
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys()

    // we create the impulse & torque before only so that if two keys are pressed simultaneously still only one impulse & torque is applied
    const impulse = { x: 0, y: 0, z: 0 }
    const torque = { x: 0, y: 0, z: 0 }

    // add correction for variation of frame rate
    const impulseStrength = 0.6 * delta
    const torqueStrength = 0.2 * delta

    // if forward - arrowUp/W key is being pressed
    if (forward) {
      impulse.z -= impulseStrength // add force to move forward on z axis
      torque.x -= torqueStrength // add torque to rotate with x axis as center of pole
    }

    // if rightward - arrowRight/D key is being pressed
    if (rightward) {
      impulse.x += impulseStrength // add force to move rightward
      torque.z -= torqueStrength // add torque to rotate with z axis as center of pole
    }

    // if backward - arrowDown/S key is being pressed
    if (backward) {
      impulse.z += impulseStrength // add force to move backward on z axis
      torque.x += torqueStrength // add torque to rotate with x axis as center of pole
    }

    // if leftward - arrowLeft/A key is being pressed
    if (leftward) {
      impulse.x -= impulseStrength // add force to move leftward
      torque.z += torqueStrength // add torque to rotate with z axis as center of pole
    }

    body.current.applyImpulse(impulse)
    body.current.applyTorqueImpulse(torque)

    /**
     * Camera
     */
    const bodyPosition = body.current.translation()

    // position camera to follow the marble
    const cameraPosition = new THREE.Vector3()
    cameraPosition.copy(bodyPosition)
    cameraPosition.z += 2.25
    cameraPosition.y += 0.65

    // add a cameraTarget to position the camera slightly above marble so that it can see the path ahead too
    const cameraTarget = new THREE.Vector3()
    cameraTarget.copy(bodyPosition)
    cameraTarget.y += 0.25

    // add lerping(linear interpolation) to smoothen & slow camera follow motion
    smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

    state.camera.position.copy(smoothedCameraPosition)
    state.camera.lookAt(smoothedCameraTarget)

    /**
     * Phases of the game
     */
    // handling if we have reached the end of the game
    if (bodyPosition.z < -(blocksCount * 4 + 2))
      // console.log('We are at the end')
      end()

    // handling restart of the game if marble has fallen down from game or completed the game
    if (bodyPosition.y < -4)
      // console.log('AAAAAHHH!!!')
      restart()
  })

  return (
    <RigidBody
      ref={body}
      position={[0, 1, 0]}
      colliders="ball"
      restitution={0.2}
      friction={1}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial flatShading color="mediumpurple" />
      </mesh>
    </RigidBody>
  )
}
