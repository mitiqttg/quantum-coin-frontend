import React, { useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";

const Coin3D = ({ loading, result }) => {
  const meshRef = useRef();
  // We use a ref to store the specific "target angle" we want to land on.
  // This prevents the target from recalculating every single frame.
  const targetAngleRef = useRef(null);

  const [headsTexture, tailsTexture] = useLoader(TextureLoader, [
    "/head.png",
    "/tail.png",
  ]);

  // Fix textures to ensure they aren't rotated weirdly
  headsTexture.center.set(0.5, 0.5);
  tailsTexture.center.set(0.5, 0.5);
  headsTexture.rotation = Math.PI / 2;
  tailsTexture.rotation = -Math.PI / 2;

  // Reset the target when we start a new toss
  useEffect(() => {
    if (loading) {
      targetAngleRef.current = null;
    }
  }, [loading]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (loading) {
      // --- STATE 1: TOSSING (Spinning) ---
      // Spin fast on X axis
      meshRef.current.rotation.x += delta * 20; 
      // Add a slight wobbling on Z for realism
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.2;
    } 
    else if (result !== "?") {
      // --- STATE 2: COLLAPSING (Landing) ---
      
      // 1. CALCULATE TARGET (Only do this once, the moment we stop loading)
      if (targetAngleRef.current === null) {
        const currentRotation = meshRef.current.rotation.x;
        const fullCircle = Math.PI * 2;
        
        // Find how many full spins we've done so far
        const rounds = Math.ceil(currentRotation / fullCircle);
        
        // Calculate the NEXT nearest landing spot
        // If HEADS: Land on a multiple of 2*PI
        // If TAILS: Land on a multiple of 2*PI + PI (180 degrees)
        let nextTarget = rounds * fullCircle;
        if (result === "TAILS") {
          nextTarget += Math.PI;
        }

        // Ensure the target is always AHEAD of current rotation
        // (Add an extra spin if we are too close, so it doesn't snap instantly)
        if (nextTarget < currentRotation + Math.PI * 0.5) {
          nextTarget += fullCircle;
        }
        
        targetAngleRef.current = nextTarget;
      }

      // 2. SMOOTHLY DECELERATE TO TARGET
      // We use 'damp' or 'lerp' to move towards the calculated forward target
      // 0.1 is the "friction" - lower is heavier/slower, higher is snappier
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetAngleRef.current,
        0.05
      );
      
      // Flatten the wobble (Z-axis) back to 0
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        0,
        0.1
      );
    } 
    else {
      // --- STATE 3: IDLE (Before first toss) ---
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    // We rotate the container 90deg so the cylinder stands on its edge like a wheel
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[2.5, 2.5, 0.2, 64]} />
      
      <meshStandardMaterial color={"#ffd700"} metalness={0.8} roughness={0.3} />
      
      <meshStandardMaterial map={headsTexture} metalness={0.6} roughness={0.2} />
      
      <meshStandardMaterial map={tailsTexture} metalness={0.6} roughness={0.2} />
    </mesh>
  );
};

export default Coin3D;