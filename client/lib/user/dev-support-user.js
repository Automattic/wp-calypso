/**
 * This is a temporary file to assist development of the support user feature.
 */

import config from 'config';

import { supportUserFetchToken, supportUserRestore } from 'state/support/actions';

/**
 * Injects a `supportUser` object into `window` for testing
 * @param  {User}       user       A Calypso User instance
 * @param  {ReduxStore} reduxStore The global Redux store instance
 */
export default function( user, reduxStore ) {
	if ( config.isEnabled( 'support-user' ) ) {
		window.supportUser = {
			login: ( ...args ) => reduxStore.dispatch( supportUserFetchToken( ...args ) ),
			logout: ( ...args ) => reduxStore.dispatch( supportUserRestore( ...args ) )
		};
	}
}
