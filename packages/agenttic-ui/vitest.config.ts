import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig( {
	plugins: [ react() ],
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
	define: {
		// Mock WordPress globals for development
		'global.wp': '{}',
		'global.wpcomGutenberg': '{}',
	},
} );
