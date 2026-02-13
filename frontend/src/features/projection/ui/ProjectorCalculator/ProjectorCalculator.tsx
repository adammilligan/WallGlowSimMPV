import { Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useSceneStore } from '@shared'

export function ProjectorCalculator() {
  const layers = useSceneStore((state) => state.layers)
  const projectorCount = useSceneStore((state) => state.projectorCount)
  const setProjectorCount = useSceneStore((state) => state.setProjectorCount)
  const setProjectorSizeMetersState = useSceneStore((state) => state.setProjectorSizeMeters)
  const [projectorSizeMeters, setProjectorSizeMeters] = useState('5')

  const handleCalculate = () => {
    const sizeValue = Number(projectorSizeMeters)

    if (!Number.isFinite(sizeValue) || sizeValue <= 0) {
      setProjectorCount(0)
      return
    }

    setProjectorSizeMetersState(sizeValue)

    const projectorArea = sizeValue * sizeValue

    const totalLayersArea = layers.reduce((sum, layer) => {
      if (layer.widthMeters <= 0 || layer.heightMeters <= 0) {
        return sum
      }

      return sum + layer.widthMeters * layer.heightMeters
    }, 0)

    if (totalLayersArea === 0) {
      setProjectorCount(0)
      return
    }

    const count = Math.ceil(totalLayersArea / projectorArea)
    setProjectorCount(count)
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2">Размер проекции (сторона квадрата, м):</Typography>
        <TextField
          type="number"
          size="small"
          value={projectorSizeMeters}
          onChange={(event) => setProjectorSizeMeters(event.target.value)}
          inputProps={{ min: 0, style: { width: 80 } }}
        />
        <Button variant="contained" size="small" onClick={handleCalculate}>
          Посчитать
        </Button>
      </Stack>
      {projectorCount > 0 && (
        <Typography variant="body2">
          Проекторов:{' '}
          <Typography component="span" fontWeight="bold">
            {projectorCount}
          </Typography>
        </Typography>
      )}
    </Stack>
  )
}

