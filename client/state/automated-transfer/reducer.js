import { withStorageKey } from '@automattic/state-utils';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET as SET_STATUS,
	AUTOMATED_TRANSFER_STATUS_REQUEST as REQUEST_STATUS,
	AUTOMATED_TRANSFER_STATUS_REQUEST_ONCE as REQUEST_STATUS_ONCE,
	AUTOMATED_TRANSFER_STATUS_REQUEST_FAILURE as REQUEST_STATUS_FAILURE,
} from 'calypso/state/action-types';
import {
	THEME_TRANSFER_INITIATE_REQUEST as INITIATE,
	THEME_TRANSFER_INITIATE_FAILURE as INITIATE_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE as TRANSFER_UPDATE,
} from 'calypso/state/themes/action-types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { transferStates } from './constants';
import eligibility from './eligibility/reducer';
import { automatedTransfer as schema } from './schema';

export const status = withPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case ELIGIBILITY_UPDATE:
			return state || transferStates.INQUIRING;
		case INITIATE:
			return transferStates.START;
		case INITIATE_FAILURE:
			return transferStates.FAILURE;
		case SET_STATUS:
			return action.status;
		case TRANSFER_UPDATE:
			return 'complete' === action.status ? transferStates.COMPLETE : state;
		case REQUEST_STATUS_FAILURE:
			// TODO : [MARKETPLACE] rely on a tangible status from the backend instead of this message
			return action.error === 'An invalid transfer ID was passed.'
				? transferStates.NONE
				: transferStates.REQUEST_FAILURE;
	}

	return state;
} );

export const fetchingStatus = ( state = false, action ) => {
	switch ( action.type ) {
		case REQUEST_STATUS:
			return true;
		case REQUEST_STATUS_ONCE:
			return true;
		case SET_STATUS:
			return false;
		case REQUEST_STATUS_FAILURE:
			return false;

		default:
			return state;
	}
};

export const siteReducer = combineReducers( {
	eligibility,
	status,
	fetchingStatus,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
const validatedReducer = withSchemaValidation( schema, keyedReducer( 'siteId', siteReducer ) );

const automatedTransferReducer = withStorageKey( 'automatedTransfer', validatedReducer );

export default automatedTransferReducer;
