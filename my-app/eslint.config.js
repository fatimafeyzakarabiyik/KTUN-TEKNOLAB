import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    // Hangi dosyaların taranacağını belirliyoruz
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // 'strict' yerine 'recommended' kullanarak hata ayıklamayı kolaylaştırıyoruz
      ...tseslint.configs.recommendedTypeChecked, 
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        // TypeScript dosyalarını analiz etmesi için yolları gösteriyoruz
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-x': reactX,
      'react-dom': reactDom,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // React-X ve React-DOM için önerilen kurallar
      ...reactX.configs['recommended-typescript'].rules,
      ...reactDom.configs.recommended.rules,
      
      // Bazı çok darlayan kuralları buradan esnetebilirsin (Opsiyonel)
      '@typescript-eslint/no-explicit-any': 'warn', // 'any' kullanımına hata değil uyarı ver
    },
  },
)