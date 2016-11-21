/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

const beginHandler = ( state ) => ( {
	...state,
	isRequesting: true,
} );

const endHandler = ( state ) => ( {
	...state,
	isRequesting: false,
} );

const reducer = createReducer( {}, {
	[ TICKET_SUPPORT_CONFIGURATION_REQUEST ]: beginHandler,
	[ TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS ]: endHandler,
	[ TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE ]: endHandler,
} );

export default reducer;
