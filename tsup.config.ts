import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    './index.ts',
    './middlewares/cross-origin-resource-sharing/index.ts',
    './middlewares/content-security-policy/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  external: ['next'],
  clean: true,
});
