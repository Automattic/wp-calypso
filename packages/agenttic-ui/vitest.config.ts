import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig( {
	plugins: [
		react( {
			babel: {
				parserOpts: {
					plugins: [ 'decorators-legacy' ],
				},
			},
		} ),
	],
	root: __dirname,
	build: {
		outDir: resolve( __dirname, 'dist-dev' ),
	},
	resolve: {
		alias: {
			'@': resolve( __dirname, 'src' ),
		},
	},
	server: {
		port: 3000,
		open: true,
	},
	esbuild: {
		loader: 'tsx',
		include: /src\/.*\.[tj]sx?$/,
		exclude: [],
	},
	define: {
		// Mock WordPress globals for development
		'global.wp': '{}',
		'global.wpcomGutenberg': '{}',
	},
} );
