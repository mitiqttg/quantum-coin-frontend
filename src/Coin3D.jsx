import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";

const Coin3D = ({ loading, result }) => {
  // 1. Access the 3D mesh directly to animate it
  const meshRef = useRef();

  // 2. Load Textures (the images you put in /public)
  // We use array destructuring because useLoader returns an array of results
  const [headsTexture, tailsTexture] = useLoader(TextureLoader, [
    "/head.png",
    "/tail.png",
  ]);

  // 3. Animation Loop (Runs 60 times per second)
  useFrame((state, delta) => {
    // delta = time since last frame (ensures smooth animation regardless of FPS)

    if (loading) {
      // --- TOSSING STATE ---
      // Spin very fast on the X axis (flipping motion)
      meshRef.current.rotation.x += delta * 5;
      // Rotate slowly on Z for some wobble
      meshRef.current.rotation.z += delta * 2;
    } 
    else if (result !== "?") {
      // --- LANDING STATE ---
      // Determine target angle: 0 degrees for Heads, 180 degrees (Pi) for Tails
      const targetRotationX = result === "HEADS" ? 0 : Math.PI;

      // "Lerp" (Linear Interpolation) smoothly moves current rotation towards target rotation
      // The '0.05' factor controls the landing speed (lower = slower landing)
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotationX,
        0.05
      );
       // Smoothly reset Z rotation to 0 so it lies flat
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        0,
        0.05
       );

    } else {
      // --- IDLE STATE (Start) ---
      // Just a slow, cool-looking spin on the Y axis
      meshRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      {/* Geometry: A very thin cylinder (looks like a coin).
         args: [radiusTop, radiusBottom, height, radialSegments]
      */}
      <cylinderGeometry args={[2.5, 2.5, 0.3, 64]} />
      
      {/* Materials: We need different materials for different faces.
         A Cylinder has 3 "material slots": [Side, Top, Bottom]
      */}
      {/* 1. Side edge (Gold color) */}
      <meshStandardMaterial color={"#ffd700"} metalness={0.8} roughness={0.3} />
      {/* 2. Top Face (Heads Texture) */}
      <meshStandardMaterial map={headsTexture} metalness={0.7} roughness={0.1}/>
      {/* 3. Bottom Face (Tails Texture) */}
      <meshStandardMaterial map={tailsTexture} metalness={0.7} roughness={0.1}/>
    </mesh>
  );
};

export default Coin3D;