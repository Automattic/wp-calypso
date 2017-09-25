/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/invites/constants';

const initialState = fromJS( {
	success: {},
	errors: {}
} );

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case ActionTypes.RECEIVE_SENDING_INVITES_SUCCESS:
			return state.setIn( [ 'success', action.formId ], action.data );
		case ActionTypes.RECEIVE_SENDING_INVITES_ERROR:
			return state.setIn( [ 'error', action.formId ], action.data );
	}
	return state;
};

export { initialState, reducer };
