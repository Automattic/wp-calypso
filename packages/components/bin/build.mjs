/* eslint-disable import/no-nodejs-modules */

import fs from 'node:fs/promises';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { transform as lightningTransform } from 'lightningcss';
import { compileAsync as compileSassAsync } from 'sass-embedded';

const sassPlugin = {
	name: 'sass',
	setup( build ) {
		build.onLoad( { filter: /\.scss$/ }, async ( args ) => {
			const filename = path.relative( process.cwd(), args.path );

			const sassResult = await compileSassAsync( filename, {
				style: 'expanded',
				quietDeps: true,
				loadPaths: [ '../../node_modules' ],
			} );

			const lightningResult = lightningTransform( {
				code: Buffer.from( sassResult.css ),

				cssModules: true,
			} );

			const cssPath = path.join(
				build.initialOptions.outdir,
				`${ path.basename( path.dirname( args.path ) ) }.css`
			);

			await fs.mkdir( build.initialOptions.outdir, { recursive: true } );
			await fs.writeFile( cssPath, Buffer.from( lightningResult.code ) );

			const moduleNames = Object.fromEntries(
				Object.entries( lightningResult.exports ).map( ( [ name, value ] ) => {
					return [ name, value.name ];
				} )
			);

			return { contents: JSON.stringify( moduleNames ), loader: 'json' };
		} );
	},
};

await esbuild.build( {
	entryPoints: [ 'src/breadcrumbs/index.tsx' ],
	entryNames: '[dir]',
	outbase: 'src',
	outdir: 'build',
	bundle: true,
	plugins: [ sassPlugin ],
} );
