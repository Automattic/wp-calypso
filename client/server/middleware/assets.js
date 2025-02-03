import { readFile } from 'fs/promises';
import path from 'path';
import asyncHandler from 'express-async-handler';
import { defaults, groupBy } from 'lodash';

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

export default () => {
	let assetsFile;
	async function readAssets() {
		if ( ! assetsFile ) {
			assetsFile = JSON.parse( await readFile( ASSETS_FILE, 'utf8' ) );
		}
		return assetsFile;
	}

	return asyncHandler( async ( req, res, next ) => {
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
