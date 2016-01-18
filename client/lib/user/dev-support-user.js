/**
 * This is a temporary file to assist development of the support user feature.
 */

import config from 'config';

export default function( user ) {
	if ( config.isEnabled( 'support-user' ) ) {
		const callback = ( error ) => {
			if ( error ) {
				console.error( error );
			} else {
				console.log( 'success' );
			}
		};

		window.supportUser = {
			login: ( username, password ) => user.changeUser( username, password, callback ),
			logout: () => user.restoreUser()
		};
	}
}
