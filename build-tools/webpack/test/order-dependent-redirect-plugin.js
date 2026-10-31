import fs from 'fs';
import os from 'os';
import path from 'path';
import webpack from 'webpack';
import OrderDependentRedirectPlugin from '../order-dependent-redirect-plugin';

// Mirrors @wordpress/data: a side-effect-free package whose plugins barrel re-exports a module
// that imports the package root back.
const FILES = {
	'node_modules/data/package.json': JSON.stringify( { sideEffects: false, module: 'index.mjs' } ),
	'node_modules/data/index.mjs':
		"import * as plugins from './plugins/index.mjs';\nexport { plugins };\nexport { helper } from './helper.mjs';\nexport const combine = () => 1;\n",
	'node_modules/data/helper.mjs': 'export const helper = () => 2;\n',
	'node_modules/data/plugins/index.mjs':
		"export { default as persistence } from './persistence.mjs';\n",
	'node_modules/data/plugins/persistence.mjs':
		"import { combine } from '../index.mjs';\nexport default () => combine();\n",
	// Builds the barrel and persistence well before the consumers, which sit six imports deep, so
	// their imports reach the barrel after webpack has already processed it.
	'src/entry.mjs':
		"import { plugins } from 'data';\nimport { run } from './1.mjs';\nconsole.log( plugins, run() );\n",
	...Object.fromEntries(
		[ 1, 2, 3, 4 ].map( ( n ) => [ `src/${ n }.mjs`, `export { run } from './${ n + 1 }.mjs';\n` ] )
	),
	'src/5.mjs':
		"import { read } from './member-read.mjs';\nimport { destructured } from './destructured.mjs';\nexport const run = () => read() + destructured();\n",
	'src/member-read.mjs':
		"import { plugins } from 'data';\nexport const read = () => plugins.persistence();\n",
	'src/destructured.mjs':
		"import { plugins, helper } from 'data';\nconst { persistence } = plugins;\nexport const destructured = () => persistence() + helper();\n",
};

const build = ( mode ) =>
	new Promise( ( resolve, reject ) => {
		const dir = fs.mkdtempSync( path.join( os.tmpdir(), 'order-dependent-redirect-' ) );
		for ( const [ file, contents ] of Object.entries( FILES ) ) {
			fs.mkdirSync( path.dirname( path.join( dir, file ) ), { recursive: true } );
			fs.writeFileSync( path.join( dir, file ), contents );
		}
		webpack(
			{
				mode,
				context: dir,
				entry: './src/entry.mjs',
				output: { path: path.join( dir, 'dist' ) },
				optimization: { minimize: false },
				plugins: [ new OrderDependentRedirectPlugin() ],
			},
			( error, stats ) => {
				fs.rmSync( dir, { recursive: true, force: true } );
				return error
					? reject( error )
					: resolve( stats.compilation.errors.map( ( e ) => e.message ) );
			}
		);
	} );

describe( 'OrderDependentRedirectPlugin', () => {
	test( 'fails only the member read through a barrel in an import cycle', async () => {
		expect( await build( 'production' ) ).toEqual( [
			expect.stringMatching( /member-read\.mjs reads `persistence` through/ ),
		] );
	} );

	test( 'stays off in development, where no import is redirected', async () => {
		expect( await build( 'development' ) ).toEqual( [] );
	} );
} );
