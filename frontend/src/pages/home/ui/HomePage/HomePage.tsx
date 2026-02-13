import { Container, Paper, Typography, Stack, Box, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import { UploadBackgroundButton, AddLayerButton, LayerList, ProjectorCalculator } from '@features'
import { SceneCanvas, Scene3D } from '@widgets'

export function HomePage() {
  const [currentView, setCurrentView] = useState<'2d' | '3d'>('2d')

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

        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <UploadBackgroundButton />
            <AddLayerButton />
          </Stack>
          <Tabs
            value={currentView}
            onChange={(_event, value: '2d' | '3d') => setCurrentView(value)}
            textColor="inherit"
            indicatorColor="primary"
          >
            <Tab value="2d" label="2D вид" />
            <Tab value="3d" label="3D вид" />
          </Tabs>
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
            {currentView === '2d' ? <SceneCanvas /> : <Scene3D />}
          </Box>
        </Stack>

        <Box marginTop={3}>
          <ProjectorCalculator />
        </Box>
      </Paper>
    </Container>
  )
}

