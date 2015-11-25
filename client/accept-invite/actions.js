/**
 * Internal dependencies
 */
import wpcom from 'lib/wp' ;

export function createAccount( userData, callback ) {
	return wpcom.undocumented().usersNew(
		Object.assign( {}, userData, { validate: false } ),
		( error, response ) => {
			const bearerToken = response && response.bearer_token;
			callback( error, bearerToken );
		}
	);
}

export function acceptInvite( invite, callback, bearerToken ) {
	if ( bearerToken ) {
		wpcom.loadToken( bearerToken );
	}
	return wpcom.undocumented().acceptInvite(
		invite.blog_id,
		invite.invite_slug,
		callback
	);
}
