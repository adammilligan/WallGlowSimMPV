import { useState } from 'react'
import { Button, Stack, TextField, Typography } from '@mui/material'
import { useSceneStore } from '@shared'

export function ProjectorCalculator() {
  const layers = useSceneStore((state) => state.layers)
  const [projectorSizeMeters, setProjectorSizeMeters] = useState('5')
  const [projectorCount, setProjectorCount] = useState<number | null>(null)

  const handleCalculate = () => {
    const sizeValue = Number(projectorSizeMeters)

    if (!Number.isFinite(sizeValue) || sizeValue <= 0) {
      setProjectorCount(null)
      return
    }

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
      {projectorCount !== null && (
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

