import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import Coin3D from './Coin3D'
import './App.css'

function App() {
  const [result, setResult] = useState("?")
  const [loading, setLoading] = useState(false)

  const flipCoin = async () => {
    if(loading) return; // Prevent double clicks
    setLoading(true)
    setResult("?") 
    
    try {
      const response = await fetch('http://127.0.0.1:5000/flip')
      const data = await response.json()
      
      setTimeout(() => {
        setResult(data.result)
        setLoading(false)
      }, 1500)

    } catch (error) {
      console.error("Error:", error)
      setResult("ERROR")
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="ui-overlay">
        <h1>QUANTUM COIN 3D</h1>
        <p className="status">
           {loading ? "STATUS: TOSSING IN SUPERPOSITION..." : `RESULT: ${result === "?" ? "READY" : result}`}
        </p>
        <button onClick={flipCoin} disabled={loading} className={loading ? 'disabled' : ''}>
          {loading ? '...' : 'TOSS COIN'}
        </button>
      </div>

      {/* The 3D Scene Container */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
           {/* Lights */}
           <ambientLight intensity={0.5} />
           <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
           <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue"/>

           {/* Environment reflection to make metal look shiny */}
           <Environment preset="city" />

           {/* Suspense waits for textures to load before showing the coin */}
           <Suspense fallback={null}>
              <Coin3D loading={loading} result={result} />
           </Suspense>
           
           {/* Shadows on the "ground" */}
           <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2.5} far={4} />

           {/* Allows mouse interaction (rotate/zoom) */}
           <OrbitControls enableZoom={false} minPolarAngle={0} maxPolarAngle={Math.PI / 1.5}/>
        </Canvas>
      </div>
    </div>
  )
}

export default App