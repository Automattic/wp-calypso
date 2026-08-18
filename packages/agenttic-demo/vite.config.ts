import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig( ( { mode } ) => {
	const useUiBuild = mode === 'use-ui-build';
	return {
		plugins: [ react() ],
		build: {
			outDir: 'dist',
		},
		server: {
			port: 3001,
		},
		define: {
			__USE_UI_BUILD__: JSON.stringify( useUiBuild ),
		},
		resolve: {
			alias: [
				{
					find: '@automattic/agenttic-ui',
					replacement: useUiBuild
						? resolve( __dirname, '../agenttic-ui/dist/index.js' )
						: resolve( __dirname, '../agenttic-ui/src' ),
				},
				{
					find: '@automattic/agenttic-client',
					replacement: resolve( __dirname, '../agenttic-client/src' ),
				},
			],
		},
		css: {
			modules: {
				generateScopedName: '[name]_[local]',
			},
		},
	};
} );
