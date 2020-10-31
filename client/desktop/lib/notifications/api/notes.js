/*
 * Internal dependencies
 */
const state = require( 'calypso/desktop/lib/state' );
const handler = require( 'wpcom-xhr-request' );

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
	return new Promise( ( resolve, reject ) => {
		handler(
			{
				path: `/notifications/${ noteId }`,
				authToken: state.getUser().token,
				apiVersion: '1.1',
				query: {
					fields: 'id,type,unread,body,subject,timestamp,meta,note_hash',
				},
			},
			( error, body ) => {
				if ( error ) {
					return reject( error );
				}

				if ( body.notes && Array.isArray( body.notes ) && body.notes.length > 0 ) {
					return resolve( body.notes[ 0 ] );
				}

				return resolve( null );
			}
		);
	} );
}

async function markReadStatus( noteId, isRead ) {
	return new Promise( ( resolve, reject ) => {
		handler(
			{
				method: 'POST',
				path: '/notifications/read',
				apiVersion: '1.1',
				authToken: state.getUser().token,
				body: {
					counts: {
						[ noteId ]: isRead ? 9999 : -1, // magic values required by the API ¯\_(ツ)_/¯
					},
				},
			},
			( error ) => {
				if ( error ) {
					reject( error );
				}
				resolve( null );
			}
		);
	} );
}

module.exports = {
	// use more forgiving timeouts for users on slower connections
	fetchNote: ( noteId ) => promiseTimeout( 2000, fetchNote( noteId ) ),
	markReadStatus: ( noteId, isRead ) => promiseTimeout( 2000, markReadStatus( noteId, isRead ) ), // response time of this endpoint is very slow!
};
