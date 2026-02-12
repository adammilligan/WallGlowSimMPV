import { useRef } from 'react'
import { Button } from '@mui/material'
import { useSceneStore } from '@shared'

export function AddLayerButton() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const addLayer = useSceneStore((state) => state.addLayer)

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

      addLayer({
        imageUrl: reader.result,
      })
    }

    reader.readAsDataURL(file)
  }

  return (
    <>
      <Button variant="outlined" color="secondary" onClick={handleButtonClick}>
        Добавить слой
      </Button>
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

