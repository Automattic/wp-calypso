/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { defaults, groupBy, flatten } from 'lodash';

const ASSETS_PATH = path.resolve( __dirname, '../../../build' );
const EMPTY_ASSETS = { js: [], 'css.ltr': [], 'css.rtl': [] };

const getAssetsPath = ( target ) =>
	path.join( ASSETS_PATH, `assets-${ target || 'fallback' }.json` );

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
	const cachedAssets = {};

	return ( req, res, next ) => {
		req.getAssets = () => {
			const target = req.getTarget();
			if ( ! cachedAssets[ target ] ) {
				cachedAssets[ target ] = JSON.parse( fs.readFileSync( getAssetsPath( target ), 'utf8' ) );
			}
			return cachedAssets[ target ];
		};

		req.getFilesForEntrypoint = ( name ) => {
			const entrypointAssets = req
				.getAssets()
				.entrypoints[ name ].assets.filter( ( asset ) => ! asset.startsWith( 'manifest' ) );
			return groupAssetsByType( entrypointAssets );
		};

		req.getFilesForChunk = ( chunkName ) => {
			const assets = req.getAssets();
			const chunk = getChunkByName( assets, chunkName );

			if ( ! chunk ) {
				console.warn( 'cannot find the chunk ' + chunkName );
				console.warn( 'available chunks:' );
				assets.chunks.forEach( ( c ) => {
					console.log( '    ' + c.id + ': ' + c.names.join( ',' ) );
				} );
				return EMPTY_ASSETS;
			}

			const allTheFiles = chunk.files.concat(
				flatten( chunk.siblings.map( ( sibling ) => getChunkById( assets, sibling ).files ) )
			);

			return groupAssetsByType( allTheFiles );
		};

		req.getEmptyAssets = () => EMPTY_ASSETS;

		next();
	};
};
