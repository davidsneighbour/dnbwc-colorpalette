import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';

export default defineConfig({
  input: './src/DnbColorpalette.js',
  output: {
    file: './dist/dnb-colorpalette.js',
    format: 'esm',
  },
  plugins: [terser()],
});
