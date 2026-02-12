import { useState, useRef } from 'react'
import { Button, Stack, TextField, Typography } from '@mui/material'
import { useSceneStore } from '@shared'

export function UploadBackgroundButton() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [widthMeters, setWidthMeters] = useState('30')
  const [heightMeters, setHeightMeters] = useState('30')
  const setBackground = useSceneStore((state) => state.setBackground)

  const handleButtonClick = () => {
    if (fileInputRef.current === null) {
      return
    }
    fileInputRef.current.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return
      }

      const width = Number(widthMeters)
      const height = Number(heightMeters)

      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return
      }

      setBackground({
        imageUrl: reader.result,
        widthMeters: width,
        heightMeters: height,
      })
    }

    reader.readAsDataURL(file)
  }

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Добавить фон
        </Button>
        <TextField
          label="Ширина, м"
          type="number"
          size="small"
          value={widthMeters}
          onChange={(event) => setWidthMeters(event.target.value)}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Высота, м"
          type="number"
          size="small"
          value={heightMeters}
          onChange={(event) => setHeightMeters(event.target.value)}
          inputProps={{ min: 0 }}
        />
        <Typography variant="body2" color="text.secondary">
          Размер фона в метрах
        </Typography>
      </Stack>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  )
}

