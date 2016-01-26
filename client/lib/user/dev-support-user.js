/**
 * This is a temporary file to assist development of the support user feature.
 */
import { compose } from 'lodash';

import config from 'config';

import { supportUserFetchToken, supportUserRestore } from 'state/support/actions';

/**
 * Injects a `supportUser` object into `window` for testing
 * @param  {User}       user       A Calypso User instance
 * @param  {ReduxStore} reduxStore The global Redux store instance
 */
export default function( user, reduxStore ) {
	if ( config.isEnabled( 'support-user' ) ) {
		const dispatch = reduxStore.dispatch.bind( reduxStore );

		window.supportUser = {
			login: compose( dispatch, supportUserFetchToken ),
			logout: compose( dispatch, supportUserRestore )
		};
	}
}
