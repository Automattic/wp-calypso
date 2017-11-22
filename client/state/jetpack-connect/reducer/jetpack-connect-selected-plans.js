/** @format */
/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_CHECK_URL, JETPACK_CONNECT_COMPLETE_FLOW } from 'state/action-types';
import { jetpackConnectSelectedPlansSchema } from './schema';

export default function jetpackConnectSelectedPlans( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return { '*': state[ '*' ] };
		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};
	}
	return state;
}
jetpackConnectSelectedPlans.schema = jetpackConnectSelectedPlansSchema;
