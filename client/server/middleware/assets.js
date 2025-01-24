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

		req.getFilesForEntrypoint = ( name ) => {
			const entrypointAssets = assets.assets[ name ];
			return groupAssetsByType( entrypointAssets );
		};

		req.getFilesForChunk = ( chunkName ) => {
			const chunkAssets = assets.assets[ chunkName ];

			if ( ! chunkAssets ) {
				console.warn( 'cannot find the chunk ' + chunkName );
				console.warn( 'available chunks:' );
				Object.keys( assets.assets ).forEach( ( name ) => {
					console.log( '    ' + name );
				} );
				return EMPTY_ASSETS;
			}

			return groupAssetsByType( chunkAssets );
		};

		req.getEmptyAssets = () => EMPTY_ASSETS;

		next();
	} );
};
