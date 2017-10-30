/** @format */
/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_COMPLETE_FLOW,
	JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE,
} from 'state/action-types';
import { jetpackConnectSelectedPlansSchema } from './schema';
import { urlToSlug } from 'lib/url';

export default function jetpackConnectSelectedPlans( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE:
			const siteSlug = urlToSlug( action.site );
			return Object.assign( {}, state, { [ siteSlug ]: action.plan } );
		case JETPACK_CONNECT_CHECK_URL:
			return { '*': state[ '*' ] };
		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};
	}
	return state;
}
jetpackConnectSelectedPlans.schema = jetpackConnectSelectedPlansSchema;
