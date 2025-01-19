const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'], // Apenas arquivos TypeScript
    ignores: ['node_modules/**/*'], // Ignora node_modules
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', // Validação de formatação pelo Prettier
      '@typescript-eslint/no-unused-vars': 'warn', // Variáveis não usadas
    },
  },
];
