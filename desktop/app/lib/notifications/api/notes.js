/*
 * External dependencies
 */
const https = require( 'https' );

/*
 * Internal dependencies
 */
const keychain = require( '../../../lib/keychain' );

const promiseTimeout = function ( ms, promise ) {
	const timeout = new Promise( ( _, reject ) => {
		const id = setTimeout( () => {
			clearTimeout( id );
			reject( `Request timed out in ${ ms } ms` );
		}, ms );
	} );

	return Promise.race( [ promise, timeout ] );
};

async function fetchNote( noteId ) {
	// FIXME: Add query fields!
	// fields: 'id,type,unread,body,subject,timestamp,meta,note_hash,url',
	const response = await request( 'GET', null, `/rest/v1.1/notifications/${ noteId }` );
	return new Promise( ( resolve, reject ) => {
		if ( response instanceof Error ) {
			return reject( response );
		}

		const body = JSON.parse( response );
		if ( body.notes && Array.isArray( body.notes ) && body.notes.length > 0 ) {
			return resolve( body.notes[ 0 ] );
		}
	} );
}

async function markReadStatus( noteId, isRead ) {
	const data = {
		counts: {
			[ noteId ]: isRead ? 9999 : -1, // magic values required by the API ¯\_(ツ)_/¯
		},
	};
	const response = await request( 'POST', JSON.stringify( data ), '/rest/v1.1/notifications/read' );
	return new Promise( ( resolve, reject ) => {
		if ( response instanceof Error ) {
			return reject( response );
		}
		return resolve( null );
	} );
}

async function request( method = 'GET', postData, path ) {
	const wp_api = await keychain.read( 'wp_api' );
	const wp_api_sec = await keychain.read( 'wp_api_sec' );
	const wordpress_logged_in = await keychain.read( 'wordpress_logged_in' );

	return new Promise( ( resolve, reject ) => {
		if ( ! wp_api || ! wp_api_sec || ! wordpress_logged_in ) {
			return reject(
				new Error(
					`Undefined cookie(s): wp_api=${ wp_api }, wp_api_sec=${ wp_api_sec }, wordpress_logged_in=${ wordpress_logged_in }`
				)
			);
		}
		const params = {
			method,
			host: 'public-api.wordpress.com',
			path,
			headers: {
				Authorization: `X-WPCOOKIE ${ wp_api }:1:https://wordpress.com`,
				Cookie: `wp_api_sec=${ wp_api_sec };wordpress_logged_in=${ wordpress_logged_in }`,
			},
		};

		const req = https.request( params, ( res ) => {
			if ( res.statusCode < 200 || res.statusCode >= 300 ) {
				return reject( new Error( `Status Code: ${ res.statusCode }: `, res.statusMessage ) );
			}

			const data = [];

			res.on( 'data', ( chunk ) => {
				data.push( chunk );
			} );

			res.on( 'end', () => resolve( Buffer.concat( data ).toString() ) );
		} );

		req.on( 'error', reject );

		if ( postData ) {
			req.write( postData );
		}

		req.end();
	} );
}

module.exports = {
	// use more forgiving timeouts for users on slower connections
	fetchNote: ( noteId ) => promiseTimeout( 2000, fetchNote( noteId ) ),
	markReadStatus: ( noteId, isRead ) => promiseTimeout( 2000, markReadStatus( noteId, isRead ) ), // response time of this endpoint is very slow!
};
