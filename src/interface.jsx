import { useKeyboardControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'
import useGame from './stores/useGame.jsx'

export default function Interface() {
  const time = useRef() // use reference to time to update the time manually with many re-renders

  const restart = useGame((state) => state.restart)
  const phase = useGame((state) => state.phase)

  const forward = useKeyboardControls((state) => state.forward)
  const backward = useKeyboardControls((state) => state.backward)
  const rightward = useKeyboardControls((state) => state.rightward)
  const leftward = useKeyboardControls((state) => state.leftward)
  const jump = useKeyboardControls((state) => state.jump)

  useEffect(() => {
    // addEffect is R3f func similar to useFrame but it can be used outside the <Canvas> tag
    const unsubscribeEffect = addEffect(() => {
      // console.log('tick');
      const state = useGame.getState() // phase value cause of useEffect on first render will remain constant & won't change to new value we get state

      let elapsedTime = 0

      if (state.phase === 'playing') elapsedTime = Date.now() - state.startTime
      // caculate elapsedTime by subtracting startTime from useGame store
      else if (state.phase === 'ended')
        elapsedTime = state.endTime - state.startTime

      elapsedTime /= 1000 // convert milliseconds to seconds
      elapsedTime = elapsedTime.toFixed(2) // round it to 2 decimals

      // update the textContent of the timer tag html with elapsedTime
      if (time.current) time.current.textContent = elapsedTime
    })

    return () => {
      unsubscribeEffect()
    }
  }, [])

  return (
    <div className="interface">
      {/* Time */}
      <div ref={time} className="time">
        0.00
      </div>

      {/* Restart */}
      {phase === 'ended' && (
        <div className="restart" onClick={restart}>
          Restart
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <div className="raw">
          <div className={`key ${forward ? 'active' : ''}`}></div>
        </div>
        <div className="raw">
          <div className={`key ${leftward ? 'active' : ''}`}></div>
          <div className={`key ${backward ? 'active' : ''}`}></div>
          <div className={`key ${rightward ? 'active' : ''}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? 'active' : ''}`}></div>
        </div>
      </div>
    </div>
  )
}
