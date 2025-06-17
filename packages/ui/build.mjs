/* eslint-disable import/no-nodejs-modules */
import fs from 'node:fs';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import { build } from 'tsup';

// Get the exports from the package.json
const packageJson = JSON.parse( fs.readFileSync( 'package.json', 'utf8' ) );
const calypsoSrcs = Object.entries( packageJson.exports )
	.map( ( [ key, value ] ) => [ key, value[ 'calypso:src' ] ] )
	.filter( ( [ _key, value ] ) => !! value );

calypsoSrcs.forEach( ( [ entryKey, entryValue ] ) => {
	build( {
		entry: [ entryValue ],
		clean: true,
		splitting: true,
		dts: {
			compilerOptions: {
				composite: false,
			},
		},
		sourcemap: true,
		format: [ 'esm', 'cjs' ],
		outDir: `dist/${ entryKey }`,
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
} );
