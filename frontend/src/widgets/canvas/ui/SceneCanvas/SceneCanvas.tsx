import { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useSceneStore } from '@shared'

interface Size {
  width: number
  height: number
}

function useHtmlImage(src: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!src) {
      setImage(null)
      return
    }

    const img = new window.Image()

    img.onload = () => {
      setImage(img)
    }

    img.src = src

    return () => {
      img.onload = null
    }
  }, [src])

  return image
}

export function SceneCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  const background = useSceneStore((state) => state.background)
  const layers = useSceneStore((state) => state.layers)
  const selectedLayerId = useSceneStore((state) => state.selectedLayerId)
  const updateLayer = useSceneStore((state) => state.updateLayer)
  const selectLayer = useSceneStore((state) => state.selectLayer)

  const backgroundImage = useHtmlImage(background.imageUrl)

  useEffect(() => {
    const element = containerRef.current

    if (!element) {
      return
    }

    const updateSize = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      })
    }

    updateSize()

    const observer = new ResizeObserver(() => {
      updateSize()
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const backgroundRect = useMemo(() => {
    if (!backgroundImage || size.width === 0 || size.height === 0) {
      return null
    }

    const imageWidth = backgroundImage.naturalWidth
    const imageHeight = backgroundImage.naturalHeight

    if (imageWidth === 0 || imageHeight === 0) {
      return null
    }

    const scale = Math.min(size.width / imageWidth, size.height / imageHeight)

    const width = imageWidth * scale
    const height = imageHeight * scale

    return {
      width,
      height,
      x: (size.width - width) / 2,
      y: (size.height - height) / 2,
    }
  }, [backgroundImage, size.height, size.width])

  const metersPerPixelX = useMemo(() => {
    if (!backgroundRect || background.widthMeters <= 0) {
      return 0
    }

    return background.widthMeters / backgroundRect.width
  }, [backgroundRect, background.widthMeters])

  const metersPerPixelY = useMemo(() => {
    if (!backgroundRect || background.heightMeters <= 0) {
      return 0
    }

    return background.heightMeters / backgroundRect.height
  }, [backgroundRect, background.heightMeters])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {size.width > 0 && size.height > 0 && (
        <Stage
          width={size.width}
          height={size.height}
          onMouseDown={(event) => {
            const isStage = event.target === event.target.getStage()

            if (isStage) {
              selectLayer(null)
            }
          }}
        >
          <Layer>
            {backgroundImage && backgroundRect && (
              <KonvaImage
                image={backgroundImage}
                x={backgroundRect.x}
                y={backgroundRect.y}
                width={backgroundRect.width}
                height={backgroundRect.height}
                listening={false}
              />
            )}
          </Layer>
          <Layer>
            {layers.map((layer) => (
              <LayerImage
                key={layer.id}
                id={layer.id}
                src={layer.imageUrl}
                x={layer.x}
                y={layer.y}
                opacity={layer.opacity}
                isSelected={selectedLayerId === layer.id}
                isKeepAspectRatio={layer.isKeepAspectRatio}
                canvasSize={size}
                metersPerPixelX={metersPerPixelX}
                metersPerPixelY={metersPerPixelY}
                rotationDegrees={layer.rotationDegrees}
                isFlippedHorizontally={layer.isFlippedHorizontally}
                onSelect={() => selectLayer(layer.id)}
                onDragEnd={(position) =>
                  updateLayer(layer.id, {
                    x: position.x,
                    y: position.y,
                  })
                }
                onTransformEnd={(params) =>
                  updateLayer(layer.id, {
                    x: params.x,
                    y: params.y,
                    widthMeters: params.widthMeters,
                    heightMeters: params.heightMeters,
                    rotationDegrees: params.rotationDegrees,
                  })
                }
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  )
}

interface LayerImageProps {
  id: string
  src: string
  x: number
  y: number
  opacity: number
  isSelected: boolean
  isKeepAspectRatio: boolean
  canvasSize: Size
  metersPerPixelX: number
  metersPerPixelY: number
  rotationDegrees: number
  isFlippedHorizontally: boolean
  onSelect: () => void
  onDragEnd: (position: { x: number; y: number }) => void
  onTransformEnd: (params: { x: number; y: number; widthMeters: number; heightMeters: number; rotationDegrees: number }) => void
}

function LayerImage({
  src,
  x,
  y,
  opacity,
  isSelected,
  isKeepAspectRatio,
  canvasSize,
  metersPerPixelX,
  metersPerPixelY,
  rotationDegrees,
  isFlippedHorizontally,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: LayerImageProps) {
  const image = useHtmlImage(src)
  const shapeRef = useRef<KonvaImage | null>(null)
  const transformerRef = useRef<Transformer | null>(null)
  const isInitialSizeAppliedRef = useRef(false)

  useEffect(() => {
    if (!isSelected) {
      return
    }

    if (!shapeRef.current || !transformerRef.current) {
      return
    }

    transformerRef.current.nodes([shapeRef.current])
    transformerRef.current.getLayer()?.batchDraw()
  }, [isSelected])

  useEffect(() => {
    if (!shapeRef.current) {
      return
    }

    const node = shapeRef.current
    const currentScaleX = node.scaleX()

    if (currentScaleX === 0) {
      return
    }

    const isCurrentlyFlipped = currentScaleX < 0

    if (isCurrentlyFlipped === isFlippedHorizontally) {
      return
    }

    node.scaleX(currentScaleX * -1)
    node.getLayer()?.batchDraw()
  }, [isFlippedHorizontally])

  useEffect(() => {
    if (!image) {
      return
    }

    if (!shapeRef.current) {
      return
    }

    if (isInitialSizeAppliedRef.current) {
      return
    }

    if (canvasSize.width === 0 || canvasSize.height === 0) {
      return
    }

    const baseWidth = canvasSize.width * 0.2

    if (image.naturalWidth === 0) {
      return
    }

    const scale = baseWidth / image.naturalWidth

    shapeRef.current.scale({
      x: scale,
      y: scale,
    })

    const node = shapeRef.current
    const nodeWidth = Math.abs(node.width() * node.scaleX())
    const nodeHeight = Math.abs(node.height() * node.scaleY())

    const widthMeters = metersPerPixelX > 0 ? nodeWidth * metersPerPixelX : 0
    const heightMeters = metersPerPixelY > 0 ? nodeHeight * metersPerPixelY : 0
    const rotationDegrees = node.rotation()

    onTransformEnd({
      x: node.x(),
      y: node.y(),
      widthMeters,
      heightMeters,
      rotationDegrees,
    })

    isInitialSizeAppliedRef.current = true
  }, [canvasSize.height, canvasSize.width, image, metersPerPixelX, metersPerPixelY, onTransformEnd])

  if (!image) {
    return null
  }

  const handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    const node = event.target
    onDragEnd({
      x: node.x(),
      y: node.y(),
    })
  }

  const handleTransformEnd = (event: KonvaEventObject<Event>) => {
    const node = event.target

    const nodeWidth = Math.abs(node.width() * node.scaleX())
    const nodeHeight = Math.abs(node.height() * node.scaleY())

    const widthMeters = metersPerPixelX > 0 ? nodeWidth * metersPerPixelX : 0
    const heightMeters = metersPerPixelY > 0 ? nodeHeight * metersPerPixelY : 0
    const rotationDegrees = node.rotation()

    onTransformEnd({
      x: node.x(),
      y: node.y(),
      widthMeters,
      heightMeters,
      rotationDegrees,
    })
  }

  return (
    <>
      <KonvaImage
        image={image}
        x={x}
        y={y}
        opacity={opacity}
        rotation={rotationDegrees}
        draggable
        onMouseDown={onSelect}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        ref={shapeRef}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          boundBoxFunc={(oldBox, newBox) => {
            const isTooSmall = newBox.width < 5 || newBox.height < 5
            if (isTooSmall) {
              return oldBox
            }

            if (!isKeepAspectRatio || !image) {
              return newBox
            }

            const aspectRatio = image.naturalWidth / image.naturalHeight
            const widthDelta = Math.abs(newBox.width - oldBox.width)
            const heightDelta = Math.abs(newBox.height - oldBox.height)

            if (widthDelta > heightDelta) {
              const width = newBox.width
              const height = width / aspectRatio
              return {
                ...newBox,
                width,
                height,
              }
            }

            const height = newBox.height
            const width = height * aspectRatio

            return {
              ...newBox,
              width,
              height,
            }
          }}
        />
      )}
    </>
  )
}

