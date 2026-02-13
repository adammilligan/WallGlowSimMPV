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

function LayerLightGrid3D() {
  const layers = useSceneStore((state) => state.layers)
  const projectorSizeMeters = useSceneStore((state) => state.projectorSizeMeters)

  const targetLayer = layers.find((layer) => layer.widthMeters > 0 && layer.heightMeters > 0)

  if (!targetLayer) {
    return null
  }

  if (projectorSizeMeters <= 0) {
    return null
  }

  const width = targetLayer.widthMeters
  const height = targetLayer.heightMeters
  const cellSize = projectorSizeMeters

  const cols = Math.max(1, Math.round(width / cellSize))
  const rows = Math.max(1, Math.round(height / cellSize))

  const cells = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const left = -width / 2 + col * cellSize
      const right = Math.min(left + cellSize, width / 2)
      const top = height / 2 - row * cellSize
      const bottom = Math.max(top - cellSize, -height / 2)

      const cellWidth = right - left
      const cellHeight = top - bottom

      if (cellWidth <= 0 || cellHeight <= 0) {
        // nothing to draw
        // eslint-disable-next-line no-continue
        continue
      }

      const centerX = left + cellWidth / 2
      const centerY = bottom + cellHeight / 2

      cells.push({
        key: `${row}-${col}`,
        centerX,
        centerY,
        cellWidth,
        cellHeight,
      })
    }
  }

  const zOffset = 0.11

  return (
    <>
      {cells.map((cell) => (
        <mesh key={cell.key} position={[cell.centerX, cell.centerY, zOffset]}>
          <planeGeometry args={[cell.cellWidth, cell.cellHeight]} />
          <meshStandardMaterial color="#ffffaa" transparent opacity={0.2} />
        </mesh>
      ))}
    </>
  )
}

interface Projectors3DProps {
  projectorCount: number
  wallWidth: number
  wallHeight: number
}

function Projectors3D({
  projectorCount,
  wallWidth,
  wallHeight,
}: Projectors3DProps) {
  if (projectorCount <= 0) {
    return null
  }

  const width = wallWidth > 0 ? wallWidth : 10
  const height = wallHeight > 0 ? wallHeight : 10

  const groundY = -height / 2
  const z = Math.max(width, height) * 0.6

  return (
    <>
      {Array.from({ length: projectorCount }, (_item, index) => {
        const t = projectorCount === 1 ? 0.5 : index / (projectorCount - 1)
        const x = -width / 2 + t * width
        return (
          <group key={index} position={[x, groundY, z]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

export function Scene3D() {
  const background = useSceneStore((state) => state.background)
  const projectorCount = useSceneStore((state) => state.projectorCount)

  const cameraDistance = useMemo(() => {
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
        position: [0, 0, cameraDistance],
        fov: 45,
      }}
    >
      <color attach="background" args={['#111']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <Suspense fallback={null}>
        <BackgroundPlane />
        <Layers3D />
        <Projectors3D
          projectorCount={projectorCount}
          wallWidth={background.widthMeters}
          wallHeight={background.heightMeters}
        />
        <LayerLightGrid3D />
      </Suspense>
      <OrbitControls enableDamping />
    </Canvas>
  )
}

