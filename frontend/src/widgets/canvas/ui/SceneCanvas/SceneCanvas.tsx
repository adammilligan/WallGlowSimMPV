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
                widthMeters={layer.widthMeters}
                heightMeters={layer.heightMeters}
                isSelected={selectedLayerId === layer.id}
                isKeepAspectRatio={layer.isKeepAspectRatio}
                canvasSize={size}
                metersPerPixelX={metersPerPixelX}
                metersPerPixelY={metersPerPixelY}
                rotationDegrees={layer.rotationDegrees}
                isFlippedHorizontally={layer.isFlippedHorizontally}
                onSelect={() => selectLayer(layer.id)}
                onDragEnd={(params) =>
                  updateLayer(layer.id, {
                    x: params.x,
                    y: params.y,
                    positionXMeters: params.positionXMeters,
                    positionYMeters: params.positionYMeters,
                  })
                }
                onTransformEnd={(params) =>
                  updateLayer(layer.id, {
                    x: params.x,
                    y: params.y,
                    widthMeters: params.widthMeters,
                    heightMeters: params.heightMeters,
                    rotationDegrees: params.rotationDegrees,
                    positionXMeters: params.positionXMeters,
                    positionYMeters: params.positionYMeters,
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
  widthMeters: number
  heightMeters: number
  isSelected: boolean
  isKeepAspectRatio: boolean
  canvasSize: Size
  metersPerPixelX: number
  metersPerPixelY: number
  rotationDegrees: number
  isFlippedHorizontally: boolean
  onSelect: () => void
  onDragEnd: (params: { x: number; y: number; positionXMeters: number; positionYMeters: number }) => void
  onTransformEnd: (params: {
    x: number
    y: number
    widthMeters: number
    heightMeters: number
    rotationDegrees: number
    positionXMeters: number
    positionYMeters: number
  }) => void
}

function LayerImage({
  src,
  x,
  y,
  opacity,
  widthMeters,
  heightMeters,
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

    const node = shapeRef.current

    // если у слоя уже есть физические размеры, восстанавливаем масштаб из них
    if (widthMeters > 0 && heightMeters > 0 && metersPerPixelX > 0 && metersPerPixelY > 0) {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        return
      }

      const targetPixelWidth = widthMeters / metersPerPixelX
      const targetPixelHeight = heightMeters / metersPerPixelY

      if (targetPixelWidth === 0 || targetPixelHeight === 0) {
        return
      }

      const baseScaleX = targetPixelWidth / image.naturalWidth
      const baseScaleY = targetPixelHeight / image.naturalHeight
      const signX = node.scaleX() < 0 ? -1 : 1

      node.scale({
        x: baseScaleX * signX,
        y: baseScaleY,
      })

      return
    }

    // начальный автоскейл только один раз для новых слоёв
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

    node.scale({
      x: scale,
      y: scale,
    })

    const nodeWidth = Math.abs(node.width() * node.scaleX())
    const nodeHeight = Math.abs(node.height() * node.scaleY())

    const nextWidthMeters = metersPerPixelX > 0 ? nodeWidth * metersPerPixelX : 0
    const nextHeightMeters = metersPerPixelY > 0 ? nodeHeight * metersPerPixelY : 0
    const nextRotationDegrees = node.rotation()

    const centerPixelX = node.x() + nodeWidth / 2
    const centerPixelY = node.y() + nodeHeight / 2

    const deltaPixelX = centerPixelX - canvasSize.width / 2
    const deltaPixelY = centerPixelY - canvasSize.height / 2

    const positionXMeters = metersPerPixelX > 0 ? deltaPixelX * metersPerPixelX : 0
    const positionYMeters = metersPerPixelY > 0 ? -deltaPixelY * metersPerPixelY : 0

    onTransformEnd({
      x: node.x(),
      y: node.y(),
      widthMeters: nextWidthMeters,
      heightMeters: nextHeightMeters,
      rotationDegrees: nextRotationDegrees,
      positionXMeters,
      positionYMeters,
    })

    isInitialSizeAppliedRef.current = true
  }, [canvasSize.height, canvasSize.width, image, metersPerPixelX, metersPerPixelY, onTransformEnd, widthMeters, heightMeters])

  if (!image) {
    return null
  }

  const handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    const node = event.target

    const nodeWidth = Math.abs(node.width() * node.scaleX())
    const nodeHeight = Math.abs(node.height() * node.scaleY())

    const centerPixelX = node.x() + nodeWidth / 2
    const centerPixelY = node.y() + nodeHeight / 2

    const deltaPixelX = centerPixelX - canvasSize.width / 2
    const deltaPixelY = centerPixelY - canvasSize.height / 2

    const positionXMeters = metersPerPixelX > 0 ? deltaPixelX * metersPerPixelX : 0
    const positionYMeters = metersPerPixelY > 0 ? -deltaPixelY * metersPerPixelY : 0

    onDragEnd({
      x: node.x(),
      y: node.y(),
      positionXMeters,
      positionYMeters,
    })
  }

  const handleTransformEnd = (event: KonvaEventObject<Event>) => {
    const node = event.target

    const nodeWidth = Math.abs(node.width() * node.scaleX())
    const nodeHeight = Math.abs(node.height() * node.scaleY())

    const widthMeters = metersPerPixelX > 0 ? nodeWidth * metersPerPixelX : 0
    const heightMeters = metersPerPixelY > 0 ? nodeHeight * metersPerPixelY : 0
    const rotationDegrees = node.rotation()

    const centerPixelX = node.x() + nodeWidth / 2
    const centerPixelY = node.y() + nodeHeight / 2

    const deltaPixelX = centerPixelX - canvasSize.width / 2
    const deltaPixelY = centerPixelY - canvasSize.height / 2

    const positionXMeters = metersPerPixelX > 0 ? deltaPixelX * metersPerPixelX : 0
    const positionYMeters = metersPerPixelY > 0 ? -deltaPixelY * metersPerPixelY : 0

    onTransformEnd({
      x: node.x(),
      y: node.y(),
      widthMeters,
      heightMeters,
      rotationDegrees,
      positionXMeters,
      positionYMeters,
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

