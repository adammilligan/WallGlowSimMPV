import {
  Checkbox,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material'
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
          <Stack key={layer.id} spacing={0.5} paddingY={0.5}>
            <ListItemButton
              selected={selectedLayerId === layer.id}
              onClick={() => selectLayer(layer.id)}
              divider
              sx={{ borderRadius: 1, paddingRight: 0.5 }}
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
            <Stack direction="row" spacing={1} paddingLeft={5} paddingRight={1}>
              <TextField
                label="Ш, м"
                type="number"
                size="small"
                variant="outlined"
                value={layer.widthMeters > 0 ? layer.widthMeters : ''}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (!Number.isFinite(value) || value <= 0) {
                    return
                  }
                  updateLayer(layer.id, {
                    widthMeters: value,
                  })
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">м</InputAdornment>,
                }}
                sx={{ width: 110 }}
              />
              <TextField
                label="В, м"
                type="number"
                size="small"
                variant="outlined"
                value={layer.heightMeters > 0 ? layer.heightMeters : ''}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (!Number.isFinite(value) || value <= 0) {
                    return
                  }
                  updateLayer(layer.id, {
                    heightMeters: value,
                  })
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">м</InputAdornment>,
                }}
                sx={{ width: 110 }}
              />
            </Stack>
          </Stack>
        ))}
      </List>
    </Stack>
  )
}

