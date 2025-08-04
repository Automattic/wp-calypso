import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig( {
	build: {
		lib: {
			entry: resolve( __dirname, 'src/index.ts' ),
			name: 'AgentticUI',
			fileName: 'index',
			formats: [ 'es' ],
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
				'styled-components',
			],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
				},
			},
		},
	},
	css: {
		modules: {
			generateScopedName: '[name]_[local]',
		},
		postcss: {
			plugins: [ tailwindcss(), autoprefixer() ],
		},
	},
	plugins: [ libInjectCss() ],
} );
