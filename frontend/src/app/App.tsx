import { HomePage } from '@pages/home'
import { ThemeProviderApp } from './providers/ThemeProvider'

export function App() {
  return (
    <ThemeProviderApp>
      <HomePage />
    </ThemeProviderApp>
  )
}

