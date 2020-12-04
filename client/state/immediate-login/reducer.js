/**
 * Internal dependencies
 */

import { withoutPersistence, withStorageKey } from 'calypso/state/utils';
import { IMMEDIATE_LOGIN_SAVE_INFO } from 'calypso/state/action-types';

const initialState = {
	attempt: false,
	success: false,
	reason: null,
	email: null,
	locale: null,
};

const reducer = withoutPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case IMMEDIATE_LOGIN_SAVE_INFO: {
			const { success, reason, email, locale } = action;

			return {
				attempt: true,
				success: !! success,
				reason: reason || null,
				email: email || null,
				locale: locale || null,
			};
		}
	}

	return state;
} );

export default withStorageKey( 'immediateLogin', reducer );
