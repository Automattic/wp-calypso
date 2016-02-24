/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/invites/constants';

function normalizeSuccessValidations( validations ) {
	if ( Array.isArray( validations ) ) {
		return validations;
	}

	// Since success validations can be returned from the API as an object,
	// let's normalize these so that we store an array.
	return Object.keys( validations ).map( key => validations[ key ] );
}

const initialState = fromJS( {
	success: {},
	errors: {}
} );

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case ActionTypes.RECEIVE_CREATE_INVITE_VALIDATION_SUCCESS:
			return state
				.setIn( [ 'success', action.siteId, action.role ], normalizeSuccessValidations( action.data.success ) )
				.setIn( [ 'errors', action.siteId, action.role ], action.data.errors );
	}
	return state;
}

export { initialState, reducer };
