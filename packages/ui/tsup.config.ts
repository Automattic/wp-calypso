import { postcssModules, sassPlugin } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';
import { entrypoints } from './tools/constants.js';

const entry = Object.values( entrypoints ).map( ( entrypoint ) => `./src/${ entrypoint }` );

export default defineConfig( {
	entry,
	clean: true,
	splitting: true,
	experimentalDts: true,
	sourcemap: true,
	format: [ 'esm', 'cjs' ],
	outDir: 'dist',
	banner: {
		js: "\nimport './index.css';\n",
	},
	esbuildPlugins: [
		sassPlugin( {
			filter: /\.module\.(css|scss)$/,
			embedded: true,
			transform: postcssModules( {
				generateScopedName: 'a8cui-[contenthash:base64:6]',
			} ),
		} ),
	],
	onSuccess: 'node tools/update-exports.js',
} );
