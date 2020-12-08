/**
 * External dependencies
 */

import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'calypso/lib/invites/constants';

const initialState = fromJS( {
	success: {},
	errors: {},
} );

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case ActionTypes.RECEIVE_CREATE_INVITE_VALIDATION_SUCCESS:
			return state
				.setIn( [ 'success', action.siteId, action.role ], action.data.success )
				.setIn( [ 'errors', action.siteId, action.role ], action.data.errors );
	}
	return state;
};

export { initialState, reducer };
