import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';


export default defineConfig(({ mode }) => {
	const useUiBuild = mode === 'use-ui-build';
	return {
		plugins: [react()],
		root: 'demo',
		build: {
			outDir: '../dist-demo',
		},
		server: {
			port: 3000,
		},
		define: {
			__USE_UI_BUILD__: JSON.stringify(useUiBuild),
		},
		resolve: {
			alias: [
				{
					find: '@automattic/agenttic-ui',
					replacement: useUiBuild
						? resolve(__dirname, '../packages/agenttic-ui/dist/index.js')
						: resolve(__dirname, '../packages/agenttic-ui/src'),
				},
				{
					find: '@automattic/agenttic-client',
					replacement: resolve(__dirname, '../packages/agenttic-client/src'),
				},
			],
		},
	}
} );
