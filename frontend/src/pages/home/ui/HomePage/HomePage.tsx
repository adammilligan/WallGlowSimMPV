import { Container, Paper, Typography, Stack, Box } from '@mui/material'
import { UploadBackgroundButton, AddLayerButton, LayerList, ProjectorCalculator } from '@features'
import { SceneCanvas } from '@widgets'

export function HomePage() {
  return (
    <Container maxWidth="lg">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h3" component="h1">
            Создай световую проекцию
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Задайте фон (стену здания) и добавляйте полупрозрачные слои со световыми эффектами.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <UploadBackgroundButton />
          <AddLayerButton />
        </Stack>

        <Stack direction="row" spacing={4} marginTop={2}>
          <Box
            sx={{
              width: 260,
              flexShrink: 0,
            }}
          >
            <LayerList />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              width: '100%',
              maxWidth: '70vw',
              height: '70vh',
              borderRadius: 2,
              border: '1px dashed rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              overflow: 'hidden',
            }}
          >
            <SceneCanvas />
          </Box>
        </Stack>

        <Box marginTop={3}>
          <ProjectorCalculator />
        </Box>
      </Paper>
    </Container>
  )
}

