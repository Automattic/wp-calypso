import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgentticUI',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        // Externalize all dependencies and peerDependencies
        '@automattic/agenttic-client',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-slot',
        '@tailwindcss/typography',
        '@visx/xychart',
        '@wordpress/data',
        '@wordpress/element',
        'class-variance-authority',
        'clsx',
        'framer-motion',
        'lucide-react',
        'react-markdown',
        'react-textarea-autosize',
        'tailwind-merge',
        // External dependencies that get bundled
        '@emotion/is-prop-valid',
        '@emotion/styled',
        'styled-components'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'index.css';
          }
          return assetInfo.name || '';
        },
        banner: `
// Auto-inject CSS when this module is imported
(function() {
  if (typeof document !== 'undefined') {
    const cssUrl = new URL('./index.css', import.meta.url).href;
    const existingLink = document.querySelector('link[href="' + cssUrl + '"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      document.head.appendChild(link);
    }
  }
})();
        `
      }
    },
    cssCodeSplit: false
  },
  css: {
    modules: {
      generateScopedName: '[name]_[local]'
    },
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  }
});
