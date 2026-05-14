import { open } from 'fs/promises';
import path from 'path';
import asyncHandler from 'express-async-handler';
import { defaults, groupBy } from 'lodash';

const ASSETS_PATH = path.resolve( __dirname, '../../../build' );
const ASSETS_FILE = path.join( ASSETS_PATH, `assets.json` );
const EMPTY_ASSETS = { js: [], 'css.ltr': [], 'css.rtl': [] };
const EMPTY_ASSETS_FILE = { manifests: [], assets: {} };

const getAssetType = ( asset ) => {
	const [ assetPath, queryString = '' ] = asset.split( '?' );
	const queryParts = queryString.split( '&' );
	const isStyleAsset = /\.(css|scss|sass|less)$/.test( assetPath );

	if (
		/(?:\.rtl|-rtl)\.css$/.test( assetPath ) ||
		( isStyleAsset && queryParts.includes( 'rtl' ) )
	) {
		return 'css.rtl';
	}
	if ( isStyleAsset ) {
		return 'css.ltr';
	}

	return 'js';
};

const groupAssetsByType = ( assets ) => defaults( groupBy( assets, getAssetType ), EMPTY_ASSETS );

/**
 * @returns {import('express').RequestHandler}
 */
export default () => {
	let assetsFile = null;
	let assetsFileModified = 0;
	async function doReadAssets() {
		let fd;
		try {
			fd = await open( ASSETS_FILE );
		} catch ( error ) {
			if ( error?.code === 'ENOENT' ) {
				assetsFile = EMPTY_ASSETS_FILE;
				assetsFileModified = 0;
				return assetsFile;
			}

			throw error;
		}
		const stats = await fd.stat();
		if ( ! assetsFile || stats.mtimeMs > assetsFileModified ) {
			assetsFile = JSON.parse( await fd.readFile( 'utf8' ) );
			assetsFileModified = stats.mtimeMs;
		}
		await fd.close();
		return assetsFile;
	}

	let checking = null;
	function readAssets() {
		if ( ! checking ) {
			checking = doReadAssets().finally( () => {
				checking = null;
			} );
		}

		return checking;
	}

	return asyncHandler( async ( req, res, next ) => {
		const assets = await readAssets();

		req.getAssets = () => assets;

		req.getFilesForChunkGroup = ( name ) => {
			const chunkGroupAssets = assets.assets[ name ];
			if ( ! chunkGroupAssets ) {
				const availableNames = Object.keys( assets.assets );
				if ( availableNames.length > 0 ) {
					console.warn( 'cannot find chunk group ' + chunkGroupAssets );
					console.warn( 'available chunk groups:' );
					for ( const availName of availableNames ) {
						console.log( '    ' + availName );
					}
				}
				return EMPTY_ASSETS;
			}
			return groupAssetsByType( chunkGroupAssets );
		};

		req.getEmptyAssets = () => EMPTY_ASSETS;

		next();
	} );
};
