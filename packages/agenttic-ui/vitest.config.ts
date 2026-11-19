import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig( {
	plugins: [ react() ],
	root: import.meta.dirname,
	build: {
		outDir: resolve( import.meta.dirname, 'dist-dev' ),
	},
	resolve: {
		alias: {
			'@': resolve( import.meta.dirname, 'src' ),
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
