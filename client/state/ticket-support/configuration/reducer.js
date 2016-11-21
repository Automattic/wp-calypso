/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
} from 'state/action-types';

const reducer = createReducer( {}, {
	[ TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS ]: ( state, { is_user_eligible } ) => ( {
		...state,
		isUserEligible: is_user_eligible,
	} ),
} );

export default reducer;
