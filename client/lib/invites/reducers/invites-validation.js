/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/invites/constants';

const initialState = fromJS( {
	list: {},
	errors: {}
} );

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case ActionTypes.RECEIVE_INVITE:
			return state.setIn( [ 'list', action.siteId, action.inviteKey ], action.data );
		case ActionTypes.RECEIVE_INVITE_ERROR:
			return state.setIn( [ 'errors', action.siteId, action.inviteKey ], action.error );
	}
	return state;
 }

export { initialState, reducer };
