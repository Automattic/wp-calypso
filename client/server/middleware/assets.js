import { open } from 'fs/promises';
import path from 'path';
import { defaults, groupBy } from '@automattic/js-utils';
import asyncHandler from 'express-async-handler';

const ASSETS_PATH = path.resolve( __dirname, '../../../build' );
const ASSETS_FILE = path.join( ASSETS_PATH, `assets.json` );
const EMPTY_ASSETS = { js: [], 'css.ltr': [], 'css.rtl': [] };

const getAssetType = ( asset ) => {
	if ( asset.endsWith( '.rtl.css' ) ) {
		return 'css.rtl';
	}
	if ( asset.endsWith( '.css' ) ) {
		return 'css.ltr';
	}

	return 'js';
};

const groupAssetsByType = ( assets ) => defaults( groupBy( assets, getAssetType ), EMPTY_ASSETS );

function createAssetsFileReader() {
	let assetsFile = null;
	let assetsFileModified = 0;
	async function doReadAssets() {
		const fd = await open( ASSETS_FILE );
		const stats = await fd.stat();
		if ( ! assetsFile || stats.mtimeMs > assetsFileModified ) {
			assetsFile = JSON.parse( await fd.readFile( 'utf8' ) );
			assetsFileModified = stats.mtimeMs;
		}
		await fd.close();
		return assetsFile;
	}

	let checking = null;
	return function readAssets() {
		if ( ! checking ) {
			checking = doReadAssets().finally( () => {
				checking = null;
			} );
		}

		return checking;
	};
}

/**
 * Reads the assets from `build/assets.json`, which webpack writes, unless a bundler replaces the
 * provider with `app.set( 'assets-provider', provider )`. A provider is a function that returns
 * (a promise of) an object shaped like `assets.json`: `{ manifests, assets }`. The file is only
 * read when no other provider is set, so it doesn't have to exist then.
 * @returns {import('express').RequestHandler}
 */
export default () => {
	const readAssetsFile = createAssetsFileReader();

	return asyncHandler( async ( req, res, next ) => {
		const readAssets = req.app.get( 'assets-provider' ) ?? readAssetsFile;
		const assets = await readAssets();

		req.getAssets = () => assets;

		req.getFilesForChunkGroup = ( name ) => {
			const chunkGroupAssets = assets.assets[ name ];
			if ( ! chunkGroupAssets ) {
				console.warn( 'cannot find chunk group ' + chunkGroupAssets );
				console.warn( 'available chunk groups:' );
				for ( const availName of Object.keys( assets.assets ) ) {
					console.log( '    ' + availName );
				}
				return EMPTY_ASSETS;
			}
			return groupAssetsByType( chunkGroupAssets );
		};

		req.getEmptyAssets = () => EMPTY_ASSETS;

		next();
	} );
};
