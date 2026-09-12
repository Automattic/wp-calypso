import fs from 'fs';
import os from 'os';
import path from 'path';
import AssetsWriter from '../assets-writer-plugin';

async function writeAssets( stats, options = {} ) {
	const output = fs.mkdtempSync( path.join( os.tmpdir(), 'assets-writer-' ) );
	let emit;
	const plugin = new AssetsWriter( { path: output, ...options } );
	plugin.apply( { hooks: { emit: { tapAsync: ( _name, callback ) => ( emit = callback ) } } } );
	try {
		await new Promise( ( resolve, reject ) => {
			emit(
				{
					getStats: () => ( { toJson: () => stats } ),
					assets: Object.fromEntries(
						Object.values( stats.assetsByChunkName )
							.flat()
							.map( ( name ) => [ name, { source: () => `source:${ name }` } ] )
					),
				},
				( error ) => ( error ? reject( error ) : resolve() )
			);
		} );
		return JSON.parse( fs.readFileSync( path.join( output, 'assets.json' ), 'utf8' ) );
	} finally {
		fs.rmSync( output, { recursive: true, force: true } );
	}
}

test( 'preserves chunk-group ordering and filters development assets from files and manifests', async () => {
	const names = [
		'runtime.js',
		'runtime-extra.js',
		'shared.js',
		'app.js',
		'app.css',
		'app.rtl.css',
	];
	const assets = [
		...names.map( ( name ) => ( { name, info: {} } ) ),
		{ name: 'runtime.js.map', info: {} },
		{ name: 'app.js.map', info: {} },
		{ name: 'update.js', info: { hotModuleReplacement: true } },
		{ name: 'development.js', info: { development: true } },
	];
	const result = await writeAssets( {
		publicPath: '/calypso/',
		assets,
		assetsByChunkName: {
			runtime: [ 'runtime.js', 'runtime-extra.js', 'runtime.js.map', 'update.js' ],
		},
		namedChunkGroups: {
			app: { assets: [ ...assets, { name: 'manifest-extra.js' }, { name: 'unlisted.js' } ] },
			second: { assets: [ { name: 'shared.js' }, { name: 'app.css' } ] },
			empty: {},
		},
	} );
	expect( result ).toEqual( {
		manifests: [ 'source:runtime.js', 'source:runtime-extra.js' ],
		assets: {
			app: [
				'/calypso/shared.js',
				'/calypso/app.js',
				'/calypso/app.css',
				'/calypso/app.rtl.css',
				'/calypso/unlisted.js',
			],
			second: [ '/calypso/shared.js', '/calypso/app.css' ],
			empty: [],
		},
	} );
} );

test( 'supports missing chunk groups and custom runtime names', async () => {
	expect( await writeAssets( { publicPath: '/', assets: [], assetsByChunkName: {} } ) ).toEqual( {
		manifests: {},
		assets: {},
	} );
	expect(
		await writeAssets(
			{
				publicPath: '/',
				assets: [ { name: 'bootstrap.js', info: {} } ],
				assetsByChunkName: { bootstrap: [ 'bootstrap.js' ] },
				namedChunkGroups: { app: { assets: [ { name: 'bootstrap.js' }, { name: 'main.js' } ] } },
			},
			{ runtimeChunk: 'bootstrap', runtimeFile: 'bootstrap' }
		)
	).toEqual( {
		manifests: [ 'source:bootstrap.js' ],
		assets: { app: [ '/main.js' ] },
	} );
} );
