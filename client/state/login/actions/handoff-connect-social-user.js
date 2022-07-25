import { SOCIAL_HANDOFF_CONNECT_ACCOUNT } from 'calypso/state/action-types';

import 'calypso/state/login/init';

/**
 * Hands off the process of connecting a social user.
 *
 * @param  {string}   email    The user's email address.
 * @param  {object}   authInfo Authentication info for the user.
 * @returns {Function}               A thunk that can be dispatched
 */
export const handoffConnectSocialUser = ( email, authInfo ) => ( dispatch ) => {
	dispatch( {
		type: SOCIAL_HANDOFF_CONNECT_ACCOUNT,
		email,
		authInfo,
	} );
};
