import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Lights() {
  const light = useRef();

  // use useFrame to make the directional light follow the camera following the marble to correct missing shadows
  useFrame((state) => {
    light.current.position.z = state.camera.position.z + 1 - 4; // +1 to shift the directional light a little back so that shadow is falling on the front
    light.current.target.position.z = state.camera.position.z - 4; // update the directional light target which is looking at origin by default to follow camera
    light.current.target.updateMatrixWorld(); // we need to update the target matrix for the light & shadow movement to be updated & re-rendered
  });

  return (
    <>
      <directionalLight
        ref={light}
        castShadow
        position={[4, 4, 1]}
        intensity={1.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={10}
        shadow-camera-top={10}
        shadow-camera-right={10}
        shadow-camera-bottom={-10}
        shadow-camera-left={-10}
      />
      <ambientLight intensity={0.5} />
    </>
  );
}
