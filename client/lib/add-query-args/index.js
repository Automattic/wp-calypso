/**
 * External dependencies
 */
import urlModule from 'url';

export default function( args, url ) {
	if ( 'object' !== typeof args ) {
		throw new Error( 'addQueryArgs expects the first argument to be an object.' );
	}

	if ( 'string' !== typeof url ) {
		throw new Error( 'addQueryArgs expects the second argument to be a string.' );
	}

	// Build new query object for url
	const parsedUrl = urlModule.parse( url, true );
	let query = parsedUrl.query || {};
	query = Object.assign( query, args );

	// Build new url object
	//
	// Note: we set search to false here to that our query object is processed
	const updatedUrlObject = Object.assign( parsedUrl, {
		query,
		search: false
	} );

	return urlModule.format( updatedUrlObject );
}
