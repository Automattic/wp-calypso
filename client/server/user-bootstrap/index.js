import debugFactory from 'debug';
import { decodeUserObject, filterUserObject } from 'calypso/lib/user/shared-utils';
import { createAuthenticatedRequest } from '../bootstrap-auth';

const debug = debugFactory( 'calypso:bootstrap' );

/**
 * WordPress.com REST API /me endpoint.
 */
const API_PATH = 'https://public-api.wordpress.com/rest/v1/me';
const apiQuery = new URLSearchParams( {
	meta: 'flags',
} );
const url = `${ API_PATH }?${ apiQuery.toString() }`;

/**
 * Requests the current user for user bootstrap.
 * @param {Object} request An Express request.
 * @returns {Promise<Object>} A promise for a user object.
 */
export default async function getBootstrappedUser( request ) {
	const req = createAuthenticatedRequest( request, url );
	debug( 'Starting user request: ', req );

	try {
		const res = await req;
		debug( '%o -> %o status code', url, res.status );
		return {
			...filterUserObject( decodeUserObject( res.body ) ),
			bootstrapped: true,
		};
	} catch ( err ) {
		if ( ! err.response ) {
			throw err;
		}

		const { body, status } = err.response;
		debug( '%o -> %o status code', url, status );
		const error = new Error();
		error.statusCode = status;
		for ( const key in body ) {
			error[ key ] = body[ key ];
		}

		throw error;
	}
}
