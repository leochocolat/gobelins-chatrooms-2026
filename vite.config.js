import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import optimizeImages from './plugins/optimize-images.js';

export default defineConfig({
    base: './',
    plugins: [vue(), optimizeImages()],
    // Fixed port: `pnpm electron:dev` waits for the hub on it
    server: {
        port: 5173,
        strictPort: true,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            'style': fileURLToPath(new URL('./src/style', import.meta.url)),
            'components': fileURLToPath(new URL('./src/components', import.meta.url)),
        },
    },
});
