/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_CURRENT_FLOW_DETAILS_SET } from 'state/action-types';

export default function( state = {}, { type, name, step } ) {
	switch ( type ) {
		case SIGNUP_CURRENT_FLOW_DETAILS_SET:
			return {
				...state,
				name,
				step,
			};
	}
	return state;
}
