import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If you deploy to GitHub Pages at https://USER.github.io/calibrate/,
// the site lives in a subfolder, so assets need that prefix.
// Vercel and Netlify serve from the root, so leave base as '/' there.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/calibrate/' : '/',
});
