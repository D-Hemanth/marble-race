import {
  Bloom,
  SSR,
  DepthOfField,
  EffectComposer,
} from '@react-three/postprocessing'

export default function Effects() {
  // randomly switch between SSR & Bloom effects
  const applyEffect = Math.random() - 0.1 > 0.5 ? true : false

  return (
    <EffectComposer>
      {applyEffect ? (
        <SSR
          intensity={0.25}
          exponent={1}
          distance={10}
          fade={10}
          roughnessFade={1}
          thickness={10}
          ior={0.45}
          maxRoughness={1}
          maxDepthDifference={10}
          blend={0.95}
          correction={1}
          correctionRadius={1}
          blur={0}
          blurKernel={1}
          blurSharpness={10}
          jitter={0.75}
          jitterRoughness={0.2}
          steps={40}
          refineSteps={5}
          missedRays={true}
          useNormalMap={true}
          useRoughnessMap={true}
          resolutionScale={1}
          velocityResolutionScale={1}
        />
      ) : (
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0} />
      )}
      <DepthOfField focusDistance={0.01} focalLength={0.2} bokehScale={3} />
    </EffectComposer>
  )
}
