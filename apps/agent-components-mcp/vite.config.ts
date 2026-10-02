import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig( {
	plugins: [ viteSingleFile() ],
	resolve: { conditions: [ 'calypso:src', 'browser', 'module', 'import' ] },
	esbuild: { jsx: 'automatic', tsconfigRaw: { compilerOptions: { target: 'ES2022' } } },
	build: { rollupOptions: { input: 'index.html' } },
} );
