/** @format */
/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/invites/constants';

export const initialState = {
	success: {},
	errors: {},
};

export const reducer = ( state = initialState, { action: { type, data, formId } } ) => {
	switch ( type ) {
		case ActionTypes.RECEIVE_SENDING_INVITES_ERROR:
			return {
				...state,
				errors: {
					...state.errors,
					[ formId ]: data,
				},
			};

		case ActionTypes.RECEIVE_SENDING_INVITES_SUCCESS:
			return {
				...state,
				success: {
					...state.success,
					[ formId ]: data,
				},
			};

		default:
			return state;
	}
};
