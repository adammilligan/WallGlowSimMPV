import { Checkbox, IconButton, List, ListItemButton, ListItemText, Stack, Tooltip, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FlipIcon from '@mui/icons-material/Flip'
import { useSceneStore } from '@shared'

export function LayerList() {
  const layers = useSceneStore((state) => state.layers)
  const selectedLayerId = useSceneStore((state) => state.selectedLayerId)
  const selectLayer = useSceneStore((state) => state.selectLayer)
  const removeLayer = useSceneStore((state) => state.removeLayer)
  const updateLayer = useSceneStore((state) => state.updateLayer)
  const duplicateLayer = useSceneStore((state) => state.duplicateLayer)

  if (layers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Слои ещё не добавлены.
      </Typography>
    )
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Слои</Typography>
      <List dense disablePadding>
        {layers.map((layer, index) => (
          <ListItemButton
            key={layer.id}
            selected={selectedLayerId === layer.id}
            onClick={() => selectLayer(layer.id)}
            divider
            sx={{ borderRadius: 1 }}
          >
            <Checkbox
              edge="start"
              size="small"
              checked={layer.isKeepAspectRatio}
              onClick={(event) => {
                event.stopPropagation()
              }}
              onChange={(event) => {
                updateLayer(layer.id, {
                  isKeepAspectRatio: event.target.checked,
                })
              }}
              inputProps={{ 'aria-label': 'Сохранять пропорции слоя' }}
            />
            <ListItemText primary={`Слой ${index + 1}`} />
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Отзеркалить по горизонтали">
                <IconButton
                  edge="end"
                  size="small"
                  color="inherit"
                  onClick={(event) => {
                    event.stopPropagation()
                    updateLayer(layer.id, {
                      isFlippedHorizontally: !layer.isFlippedHorizontally,
                    })
                  }}
                >
                  <FlipIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Дублировать слой">
                <IconButton
                  edge="end"
                  size="small"
                  color="inherit"
                  onClick={(event) => {
                    event.stopPropagation()
                    duplicateLayer(layer.id)
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить слой">
                <IconButton
                  edge="end"
                  size="small"
                  color="inherit"
                  onClick={(event) => {
                    event.stopPropagation()
                    removeLayer(layer.id)
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItemButton>
        ))}
      </List>
    </Stack>
  )
}

