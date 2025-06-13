/* eslint-disable import/no-nodejs-modules */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';

let gitHeadSha;
try {
	gitHeadSha = execSync( 'git rev-parse HEAD' ).toString();
} catch {}

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
				generateScopedName: ( name, filename ) => {
					const hash = createHash( 'md5' )
						.update( name + filename + gitHeadSha )
						.digest( 'hex' )
						.slice( 0, 6 );
					return `a8cui-${ hash }`;
				},
			} ),
		} ),
	],
} );
