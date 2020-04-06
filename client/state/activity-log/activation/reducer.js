/**
 * External dependencies
 */

import { stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
} from 'state/action-types';
import { keyedReducer, withoutPersistence } from 'state/utils';

export const activationRequesting = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case REWIND_ACTIVATE_REQUEST:
				return stubTrue( state, action );
			case REWIND_ACTIVATE_FAILURE:
				return stubFalse( state, action );
			case REWIND_ACTIVATE_SUCCESS:
				return stubFalse( state, action );
		}

		return state;
	} )
);
