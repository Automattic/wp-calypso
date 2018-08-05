/** @format */

/**
 * External dependencies
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { flatten, forEach } from 'lodash';
import url from 'url';
/**
 * Internal dependencies
 */
import utils from 'bundler/utils';
import sections from '../../client/sections';
import config from 'config';

const SERVER_BASE_PATH = '/public';
const ASSETS_PATH = path.join( __dirname, 'assets.json' );

export const staticFiles = [
	{ path: 'style.css' },
	{ path: 'editor.css' },
	{ path: 'tinymce/skins/wordpress/wp-content.css' },
	{ path: 'style-debug.css' },
	{ path: 'style-rtl.css' },
	{ path: 'style-debug-rtl.css' },
];

export const staticFilesUrls = staticFiles.reduce( ( result, file ) => {
	if ( ! file.hash ) {
		file.hash = utils.hashFile( process.cwd() + SERVER_BASE_PATH + '/' + file.path );
	}
	result[ file.path ] = utils.getUrl( file.path, file.hash );
	return result;
}, {} );

export const getAssets = ( () => {
	let assets;
	return () => {
		// refresh assets in development as those can change with webpack hot loader
		if ( ! assets || process.env.NODE_ENV === 'development' ) {
			const assetsContent = fs.readFileSync( ASSETS_PATH, 'utf8' );
			assets = JSON.parse( assetsContent );
			const shasum = crypto.createHash( 'sha1' );
			shasum.update( assetsContent );
			assets.hash = shasum.digest( 'hex' );
		}
		return assets;
	};
} )();

export const getFilesForChunk = chunkName => {
	const assets = getAssets();

	function getChunkByName( _chunkName ) {
		return assets.chunks.find( chunk => chunk.names.some( name => name === _chunkName ) );
	}

	function getChunkById( chunkId ) {
		return assets.chunks.find( chunk => chunk.id === chunkId );
	}

	const chunk = getChunkByName( chunkName );
	if ( ! chunk ) {
		console.warn( 'cannot find the chunk ' + chunkName );
		console.warn( 'available chunks:' );
		assets.chunks.forEach( c => {
			console.log( '    ' + c.id + ': ' + c.names.join( ',' ) );
		} );
		return [];
	}

	const allTheFiles = chunk.files.concat(
		flatten( chunk.siblings.map( sibling => getChunkById( sibling ).files ) )
	);

	return allTheFiles;
};

/**
 * Generate an object that maps asset names name to a server-relative urls.
 * Assets in request and static files are included.
 *
 * @returns {Object} Map of asset names to urls
 **/
export function generateStaticUrls() {
	const urls = { ...staticFilesUrls };
	const assets = getAssets().assetsByChunkName;

	// add sections css files
	sections
		.filter( section => ! section.envId || section.envId.indexOf( config( 'env_id' ) ) > -1 )
		.forEach( section => {
			if ( section.css ) {
				const urlObjectLTR = url.parse( section.css.urls.ltr, true );
				const cssNameLTR = path.resolve( '/calypso', urlObjectLTR.pathname );
				urls[ cssNameLTR ] = {
					hash: urlObjectLTR.query.v,
					path: section.css.urls.ltr,
				};
				const urlObjectRTL = url.parse( section.css.urls.ltr, true );
				const cssNameRTL = path.resolve( '/calypso', urlObjectRTL.pathname );
				urls[ cssNameRTL ] = {
					hash: urlObjectRTL.query.v,
					path: section.css.urls.rtl,
				};
			}
		} );

	forEach( assets, ( asset, name ) => {
		urls[ name ] = asset;
	} );

	return urls;
}
