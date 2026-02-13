import { Suspense, useMemo } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { TextureLoader } from 'three'
import { useSceneStore } from '@shared'

function BackgroundPlane() {
  const background = useSceneStore((state) => state.background)

  const texture = useLoader(TextureLoader, background.imageUrl ?? '')

  const size = useMemo(() => {
    if (background.widthMeters <= 0 || background.heightMeters <= 0) {
      return {
        width: 10,
        height: 10,
      }
    }

    return {
      width: background.widthMeters,
      height: background.heightMeters,
    }
  }, [background.heightMeters, background.widthMeters])

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[size.width, size.height]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function Layers3D() {
  const layers = useSceneStore((state) => state.layers)

  const layersWithSize = layers.filter((layer) => layer.widthMeters > 0 && layer.heightMeters > 0)

  const textureUrls = layersWithSize.map((layer) => layer.imageUrl)

  const textures = useLoader(TextureLoader, textureUrls)

  return (
    <>
      {layersWithSize.map((layer, index) => {
        const texture = textures[index]
        const offsetZ = 0.1 + index * 0.02
        const rotationRadians = (layer.rotationDegrees * Math.PI) / 180
        const scaleX = layer.isFlippedHorizontally ? -1 : 1

        return (
          <mesh key={layer.id} position={[0, 0, offsetZ]} rotation={[0, 0, rotationRadians]}>
            <planeGeometry args={[layer.widthMeters, layer.heightMeters]} />
            <meshStandardMaterial
              map={texture}
              transparent
              opacity={layer.opacity}
            />
            <group scale={[scaleX, 1, 1]} />
          </mesh>
        )
      })}
    </>
  )
}

export function Scene3D() {
  const background = useSceneStore((state) => state.background)

  const cameraPosition = useMemo(() => {
    const base = Math.max(background.widthMeters, background.heightMeters)

    if (base <= 0) {
      return 30
    }

    return base * 2
  }, [background.heightMeters, background.widthMeters])

  if (!background.imageUrl) {
    return null
  }

  return (
    <Canvas
      camera={{
        position: [0, 0, cameraPosition],
        fov: 45,
      }}
    >
      <color attach="background" args={['#111']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <Suspense fallback={null}>
        <BackgroundPlane />
        <Layers3D />
      </Suspense>
      <OrbitControls enableDamping />
    </Canvas>
  )
}

