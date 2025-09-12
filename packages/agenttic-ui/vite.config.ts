import { defineConfig } from 'vite';
import { resolve } from 'path';
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
				// Externalize all dependencies and peerDependencies
				'react',
				'react-dom',
				'react/jsx-runtime',
				'streamdown',
				'@automattic/agenttic-client',
				'@radix-ui/react-scroll-area',
				'@radix-ui/react-slot',
				'@visx/xychart',
				'@wordpress/i18n',
				'class-variance-authority',
				'clsx',
				'framer-motion',
				'lucide-react',
				'react-markdown',
				'react-textarea-autosize',
				'@emotion/is-prop-valid',
				'@emotion/styled',
				'styled-components',
			],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'@wordpress/i18n': 'wp.i18n',
				},
			},
		},
	},
	css: {
		modules: {
			generateScopedName: '[name]_[local]',
		},
		postcss: {
			plugins: [ autoprefixer() ],
		},
	},
	plugins: [ libInjectCss() ],
} );
