import { Physics, Debug } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './Player.jsx'
import Effects from './Effects.jsx'
import useGame from './stores/useGame.jsx'

export default function Experience() {
  const blocksCount = useGame((state) => state.blocksCount) // destructure only the property needed as we don't want unnecessary re-renders
  const blockSeed = useGame((state) => state.blockSeed) // destructure only the property needed as we don't want unnecessary re-renders

  return (
    <>
      <color args={['#252731']} attach="background" />
      <Physics>
        {/* <Debug /> */}
        <Lights />
        <Level count={blocksCount} seed={blockSeed} />
        <Player />
      </Physics>

      <Effects />
    </>
  )
}
