/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	TICKET_SUPPORT_CONFIGURATION_REQUEST,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS,
	TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE,
} from 'state/action-types';

const beginHandler = () => true;
const endHandler = () => false;

const reducer = createReducer( false, {
	[ TICKET_SUPPORT_CONFIGURATION_REQUEST ]: beginHandler,
	[ TICKET_SUPPORT_CONFIGURATION_REQUEST_SUCCESS ]: endHandler,
	[ TICKET_SUPPORT_CONFIGURATION_REQUEST_FAILURE ]: endHandler,
} );

export default reducer;
