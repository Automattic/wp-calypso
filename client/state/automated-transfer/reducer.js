/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import eligibility from './eligibility/reducer';
import {
	keyedReducer,
	withSchemaValidation,
} from 'state/utils';
import { AUTOMATED_TRANSFER_STATUS as transferStatus } from './constants';
import { automatedTransfer as schema } from './schema';
import {
	AUTOMATED_TRANSFER_STATUS_SET as SET_STATUS,
} from 'state/action-types';

export const status = ( state = transferStatus.ALOOF, action ) =>
	SET_STATUS === action.type
		? action.automatedTransferStatus
		: state;

export const siteReducer = combineReducers( {
	eligibility,
	status,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
export default withSchemaValidation(
	schema,
	keyedReducer( 'siteId', siteReducer ),
);
