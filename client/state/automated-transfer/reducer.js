/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import eligibility from './eligibility/reducer';
import {
	keyedReducer,
	withSchemaValidation,
} from 'state/utils';
import { transferStates } from './constants';
import { automatedTransfer as schema } from './schema';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET as SET_STATUS,
	THEME_TRANSFER_INITIATE_REQUEST as INITIATE,
	THEME_TRANSFER_INITIATE_FAILURE as INITIATE_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE as TRANSFER_UPDATE,
} from 'state/action-types';

export const status = ( state = null, action ) => get( {
	[ ELIGIBILITY_UPDATE ]: state || transferStates.INQUIRING,
	[ INITIATE ]: transferStates.START,
	[ INITIATE_FAILURE ]: transferStates.INQUIRING,
	[ SET_STATUS ]: action.status,
	[ TRANSFER_UPDATE ]: 'complete' === action.status ? transferStates.COMPLETE : state,
}, action.type, state );

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
