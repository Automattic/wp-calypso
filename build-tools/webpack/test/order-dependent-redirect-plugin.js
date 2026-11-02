import fs from 'fs';
import os from 'os';
import path from 'path';
import webpack from 'webpack';
import OrderDependentRedirectPlugin from '../order-dependent-redirect-plugin';

// Builds with the installed webpack, so a webpack upgrade that changes the internals the plugin
// relies on fails here instead of leaving the plugin silently blind.
const FILES = {
	// Mirrors @wordpress/data: a side-effect-free package whose plugins barrel re-exports a module
	// that imports the package root back.
	'node_modules/data/package.json': JSON.stringify( { sideEffects: false, module: 'index.mjs' } ),
	'node_modules/data/index.mjs':
		"import * as plugins from './plugins/index.mjs';\nexport { plugins };\nexport const combine = () => 1;\n",
	// `local` is defined in the barrel itself, so there is nothing to skip to.
	'node_modules/data/plugins/index.mjs':
		"export { default as persistence } from './persistence.mjs';\nexport const local = () => 3;\n",
	'node_modules/data/plugins/persistence.mjs':
		"import { combine } from '../index.mjs';\nexport default () => combine();\n",
	// The same shape without the cycle, which webpack resolves the same way in every build.
	'node_modules/flat/package.json': JSON.stringify( { sideEffects: false, module: 'index.mjs' } ),
	'node_modules/flat/index.mjs': "import * as tools from './tools/index.mjs';\nexport { tools };\n",
	'node_modules/flat/tools/index.mjs': "export { default as format } from './format.mjs';\n",
	'node_modules/flat/tools/format.mjs': 'export default () => 2;\n',
	'src/entry.mjs':
		"import { read } from './member-read.mjs';\nimport { destructured } from './destructured.mjs';\nimport { flat } from './flat-read.mjs';\nimport { local } from './local-read.mjs';\nconsole.log( read(), destructured(), flat(), local() );\n",
	'src/member-read.mjs':
		"import { plugins } from 'data';\nexport const read = () => plugins.persistence();\n",
	'src/destructured.mjs':
		"import { plugins } from 'data';\nexport const destructured = () => {\n\tconst { persistence } = plugins;\n\treturn persistence();\n};\n",
	'src/local-read.mjs':
		"import { plugins } from 'data';\nexport const local = () => plugins.local();\n",
	'src/flat-read.mjs': "import { tools } from 'flat';\nexport const flat = () => tools.format();\n",
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
	test( 'fails only a member read through a barrel in an import cycle', async () => {
		expect( await build( 'production' ) ).toEqual( [
			expect.stringMatching( /member-read\.mjs reads `plugins\.persistence` through/ ),
		] );
	} );

	test( 'stays off in development, where no import is moved', async () => {
		expect( await build( 'development' ) ).toEqual( [] );
	} );
} );
