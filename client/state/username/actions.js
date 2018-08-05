/** @format */

/**
 * Internal dependencies
 */

import { USERNAME_VALIDATION_FAILURE } from 'state/action-types';
import wpcom from 'lib/wp';

export function changeUsername( username, action, callback ) {
	return dispatch =>
		wpcom
			.undocumented()
			.me()
			.changeUsername( username, action )
			.then( () => {
				callback && callback();
			} )
			.catch( error => {
				dispatch( {
					type: USERNAME_VALIDATION_FAILURE,
					error: error.error,
					message: error.message,
				} );
				callback && callback( error );
			} );
}
