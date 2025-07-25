import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig( {
	plugins: [ react() ],
	root: 'demo',
	build: {
		outDir: '../dist-demo',
	},
	server: {
		port: 3000,
	},
	resolve: {
		alias: [
			{
				find: '@automattic/agenttic-ui',
				replacement: resolve(__dirname, '../packages/agenttic-ui/src'),
			},
			{
				find: '@automattic/agenttic-client', 
				replacement: resolve(__dirname, '../packages/agenttic-client/src'),
			},
		],
	},
} );
