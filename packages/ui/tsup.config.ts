import { postcssModules, sassPlugin } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';
import pkg from './package.json' assert { type: 'json' };

const entry = Object.values( pkg.exports ).map( ( entry ) => entry[ 'calypso:src' ] );

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
} );
