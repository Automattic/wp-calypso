import { defineConfig } from 'vite';
import { resolve } from 'path';
import autoprefixer from 'autoprefixer';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				mocks: resolve(__dirname, 'src/mocks/index.ts'),
				'agents-api/index': resolve(__dirname, 'src/agents-api/index.ts'),
			},
			name: 'AgentticClient',
			fileName: (format, entryName) => `${entryName}.js`,
			formats: ['es'],
		},
		rollupOptions: {
			external: [
				// React and related
				'react',
				'react-dom',

				// WordPress dependencies (available as globals)
				'@wordpress/i18n',
				'@wordpress/api-fetch',

				// Chart libraries (should be provided by consuming app)
				'@automattic/charts',
				'@visx/xychart',
				// Markdown dependencies
				'react-markdown',
				'remark-gfm',

				// Other utilities that should be externalized
				'unified',
			],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'@wordpress/i18n': 'wp.i18n',
					'@wordpress/api-fetch': 'wp.apiFetch',
				},
			},
		},
	},
	css: {
		modules: {
			generateScopedName: '[name]_[local]',
		},
		postcss: {
			plugins: [autoprefixer()],
		},
	},
	plugins: [libInjectCss()],
});
