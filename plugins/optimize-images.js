// Vite plugin, build only: converts the chatroom images (PNG / JPG) referenced in src/config/chatrooms.json
// to optimized WebP in the build output, and points the bundled config to them.
// Source images stay untouched in public/: WebP files only ever exist in dist/.

import { existsSync } from 'node:fs';
import { rm, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CONFIG_FILE = path.normalize('src/config/chatrooms.json');
const SOURCE_EXTENSIONS = /\.(png|jpe?g)$/i;

function formatSize(bytes) {
    return `${(bytes / 1024).toFixed(0)} KB`;
}

// Cards are at most ~700px wide on a 2x screen
export default function optimizeImages({ maxWidth = 1400, quality = 80 } = {}) {
    let viteConfig;
    // Source path in public/ → WebP path in dist/, e.g. images/leo.png → images/leo.webp
    const images = new Map();

    return {
        name: 'optimize-images',
        apply: 'build',
        enforce: 'pre',

        configResolved(resolvedConfig) {
            viteConfig = resolvedConfig;
        },

        transform(code, id) {
            if (!path.normalize(id.split('?')[0]).endsWith(CONFIG_FILE)) return;

            const chatrooms = JSON.parse(code);
            for (const chatroom of chatrooms) {
                if (!chatroom.image || !SOURCE_EXTENSIONS.test(chatroom.image)) continue;

                if (!existsSync(path.join(viteConfig.publicDir, chatroom.image))) {
                    this.warn(`${chatroom.image} not found for "${chatroom.id}", left as is`);
                    continue;
                }

                const webpImage = chatroom.image.replace(SOURCE_EXTENSIONS, '.webp');
                images.set(chatroom.image, webpImage);
                chatroom.image = webpImage;
            }

            return { code: JSON.stringify(chatrooms), map: null };
        },

        // Runs once dist/ is written, public/ files included
        async closeBundle() {
            const outDir = path.resolve(viteConfig.root, viteConfig.build.outDir);

            for (const [sourceImage, webpImage] of images) {
                const inputPath = path.join(viteConfig.publicDir, sourceImage);
                const outputPath = path.join(outDir, webpImage);

                await sharp(inputPath)
                    .resize({ width: maxWidth, withoutEnlargement: true })
                    .webp({ quality })
                    .toFile(outputPath);

                // The copied original isn't referenced anymore
                await rm(path.join(outDir, sourceImage), { force: true });

                const [before, after] = await Promise.all([stat(inputPath), stat(outputPath)]);
                viteConfig.logger.info(
                    `  ${sourceImage} → ${webpImage} (${formatSize(before.size)} → ${formatSize(after.size)})`,
                );
            }
        },
    };
}
