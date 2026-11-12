import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import optimizeImages from './plugins/optimize-images.js';

export default defineConfig({
    base: './',
    plugins: [vue(), optimizeImages()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            'style': fileURLToPath(new URL('./src/style', import.meta.url)),
            'components': fileURLToPath(new URL('./src/components', import.meta.url)),
        },
    },
});
