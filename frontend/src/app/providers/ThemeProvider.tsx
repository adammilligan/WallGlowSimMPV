import { type ReactNode } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

interface ThemeProviderAppProps {
  children: ReactNode
}

export function ThemeProviderApp({ children }: ThemeProviderAppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

