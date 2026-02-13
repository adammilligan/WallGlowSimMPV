import { create } from 'zustand'

interface BackgroundState {
  imageUrl: string | null
  widthMeters: number
  heightMeters: number
}

interface LayerState {
  id: string
  imageUrl: string
  x: number
  y: number
  opacity: number
  isKeepAspectRatio: boolean
  widthMeters: number
  heightMeters: number
  rotationDegrees: number
  isFlippedHorizontally: boolean
  positionXMeters: number
  positionYMeters: number
}

interface SceneState {
  background: BackgroundState
  layers: LayerState[]
  selectedLayerId: string | null
  projectorCount: number
  projectorSizeMeters: number
  setBackground: (params: { imageUrl: string; widthMeters: number; heightMeters: number }) => void
  addLayer: (params: { imageUrl: string }) => void
  updateLayer: (id: string, params: { x?: number; y?: number; opacity?: number; isKeepAspectRatio?: boolean; widthMeters?: number; heightMeters?: number; rotationDegrees?: number; isFlippedHorizontally?: boolean; positionXMeters?: number; positionYMeters?: number }) => void
  selectLayer: (id: string | null) => void
  removeLayer: (id: string) => void
  duplicateLayer: (id: string) => void
  setProjectorCount: (count: number) => void
  setProjectorSizeMeters: (size: number) => void
}

export const useSceneStore = create<SceneState>((set, get) => ({
  background: {
    imageUrl: null,
    widthMeters: 30,
    heightMeters: 30,
  },
  layers: [],
  selectedLayerId: null,
  projectorCount: 0,
  projectorSizeMeters: 5,
  setBackground: ({ imageUrl, widthMeters, heightMeters }) => {
    set({
      background: {
        imageUrl,
        widthMeters,
        heightMeters,
      },
    })
  },
  addLayer: ({ imageUrl }) => {
    const state = get()
    const newLayer: LayerState = {
      id: String(Date.now()),
      imageUrl,
      x: 0,
      y: 0,
      opacity: 0.5,
      isKeepAspectRatio: true,
      widthMeters: 0,
      heightMeters: 0,
      rotationDegrees: 0,
      isFlippedHorizontally: false,
      positionXMeters: 0,
      positionYMeters: 0,
    }

    set({
      layers: [...state.layers, newLayer],
    })
  },
  updateLayer: (id, params) => {
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              ...params,
            }
          : layer,
      ),
    }))
  },
  selectLayer: (id) => {
    set({
      selectedLayerId: id,
    })
  },
  removeLayer: (id) => {
    const state = get()
    const filteredLayers = state.layers.filter((layer) => layer.id !== id)

    set({
      layers: filteredLayers,
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })
  },
  duplicateLayer: (id) => {
    const state = get()
    const sourceLayer = state.layers.find((layer) => layer.id === id)

    if (!sourceLayer) {
      return
    }

    const offset = 20
    const duplicatedLayer: LayerState = {
      ...sourceLayer,
      id: String(Date.now()),
      x: sourceLayer.x + offset,
      y: sourceLayer.y + offset,
    }

    set({
      layers: [...state.layers, duplicatedLayer],
    })
  },
  setProjectorCount: (count) => {
    set({
      projectorCount: count,
    })
  },
  setProjectorSizeMeters: (size) => {
    set({
      projectorSizeMeters: size,
    })
  },
}))

