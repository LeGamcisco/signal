import { FC } from "react"
import { LocalizationContext } from "../common/localize/useLocalization"
import { defaultTheme } from "../common/theme/Theme"
import { EmotionThemeProvider } from "../main/components/Theme/EmotionThemeProvider"
import { GlobalCSS } from "../main/components/Theme/GlobalCSS"
import { ThemeContext } from "../main/hooks/useTheme"
import { SignInPage } from "./SignInPage"

export const App: FC = () => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      <EmotionThemeProvider>
        <LocalizationContext.Provider value={{ language: null }}>
          <GlobalCSS />
          <SignInPage />
        </LocalizationContext.Provider>
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  )
}
