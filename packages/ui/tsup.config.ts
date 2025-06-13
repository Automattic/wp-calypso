// eslint-disable-next-line import/no-nodejs-modules
import crypto from 'node:crypto';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';

export default defineConfig( {
	entry: [ 'src/index.ts' ],
	clean: true,
	splitting: true,
	experimentalDts: true,
	sourcemap: true,
	format: [ 'esm', 'cjs' ],
	outDir: 'dist',
	esbuildPlugins: [
		sassPlugin( {
			filter: /\.module\.(css|scss)$/,
			embedded: true,
			transform: postcssModules( {
				generateScopedName: ( name, filename, css ) => {
					const hash = crypto
						.createHash( 'md5' )
						.update( filename + css )
						.digest( 'hex' )
						.slice( 0, 5 );
					return `${ name }__${ hash }`;
				},
			} ),
		} ),
	],
} );
