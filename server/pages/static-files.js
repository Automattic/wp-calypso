/** @format */

/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import utils from '../bundler/utils';

const ASSETS_PATH = path.join( __dirname, '../', 'bundler', 'assets.json' );
const SERVER_BASE_PATH = '/public';

const staticFiles = [
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

const getAssets = ( () => {
	let assets;
	return () => {
		if ( ! assets ) {
			assets = JSON.parse( fs.readFileSync( ASSETS_PATH, 'utf8' ) );
		}
		return assets;
	};
} )();

/**
 * Generate an object that maps asset names name to a server-relative urls.
 * Assets in request and static files are included.
 *
 * @returns {Object} Map of asset names to urls
 **/
export function generateStaticUrls() {
	const urls = { ...staticFilesUrls };
	const assets = getAssets();

	forEach( assets, ( asset, name ) => {
		urls[ name ] = asset.js;
	} );

	return urls;
}
