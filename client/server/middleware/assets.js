import { readFile } from 'fs/promises';
import path from 'path';
import asyncHandler from 'express-async-handler';
import { defaults, groupBy, flatten } from 'lodash';

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

const getChunkByName = ( assets, chunkName ) =>
	assets.chunks.find( ( chunk ) => chunk.names.some( ( name ) => name === chunkName ) );

const getChunkById = ( assets, chunkId ) => assets.chunks.find( ( chunk ) => chunk.id === chunkId );

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
			const entrypointAssets = assets.entrypoints[ name ].assets.filter(
				( asset ) => ! asset.startsWith( 'manifest' )
			);
			return groupAssetsByType( entrypointAssets );
		};

		req.getFilesForChunk = ( chunkName ) => {
			const chunk = getChunkByName( assets, chunkName );

			if ( ! chunk ) {
				console.warn( 'cannot find the chunk ' + chunkName );
				console.warn( 'available chunks:' );
				assets.chunks.forEach( ( c ) => {
					console.log( '    ' + c.id + ': ' + c.names.join( ',' ) );
				} );
				return EMPTY_ASSETS;
			}

			if ( ! chunk.chunks ) {
				console.warn( 'cannot find the chunks of the chunk group ' + chunkName );
				return EMPTY_ASSETS;
			}

			const allTheFiles = flatten(
				chunk.chunks.map( ( chunkId ) => getChunkById( assets, chunkId ).files )
			);
			return groupAssetsByType( allTheFiles );
		};

		req.getEmptyAssets = () => EMPTY_ASSETS;

		next();
	} );
};
