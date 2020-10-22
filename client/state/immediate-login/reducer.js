/**
 * Internal dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import { IMMEDIATE_LOGIN_SAVE_INFO } from 'calypso/state/action-types';

const initialState = {
	attempt: false,
	success: false,
	reason: null,
	email: null,
	locale: null,
};

export default withoutPersistence( ( state = initialState, action ) => {
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
