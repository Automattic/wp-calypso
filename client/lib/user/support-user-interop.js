/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import User from 'lib/user';
import userSettings from 'lib/user-settings';

import { supportUserRestore } from 'state/support/actions';
import { getSupportUser, getSupportToken } from 'state/support/selectors';

/**
 * Connects the Redux store and the low-level support user functions
 * of the wpcom library. When the support user token is changed in the
 * Redux store, the token is sent to the wpcom library. If a token
 * error occurs in a wpcom API call, the error is forwarded to the
 * Redux store via an action. This also forces any data refreshes
 * that are required due to the change of user.
 *
 * @param {Object}  reduxStore  The global redux store instance
 */
export default function( reduxStore ) {
	const user = new User();

	// Called when the support user token was updated in wpcom
	const onTokenChange = () => {
		user.fetch();
		userSettings.fetchSettings();
	}

	// Called when an API call fails due to a token error
	const onTokenError = ( error ) => {
		reduxStore.dispatch( supportUserRestore( error ) );
	}

	// Follow any changes to the support token in the Redux store and
	// update the wpcom API interceptor accordingly.
	reduxStore.subscribe( () => {
		const state = reduxStore.getState();

		if ( wpcom.setSupportUserToken( getSupportUser( state ), getSupportToken( state ) ) ) {
			onTokenChange();
		}
	} );
}
