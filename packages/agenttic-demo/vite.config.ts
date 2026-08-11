import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig( ( { mode } ) => {
	const useUiBuild = mode === 'use-ui-build';
	return {
		plugins: [ react() ],
		root: __dirname,
		build: {
			outDir: 'dist',
		},
		server: {
			// 3000 is Calypso's own `yarn start`.
			port: 3001,
		},
		define: {
			__USE_UI_BUILD__: JSON.stringify( useUiBuild ),
		},
		resolve: {
			// Aliased to source, not to the workspace packages: editing a component
			// and seeing it reload is the point of the playground. Resolving through
			// the workspace would pull in `dist/` instead.
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
