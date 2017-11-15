/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import eligibility from './eligibility/reducer';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withoutPersistence,
} from 'state/utils';
import { transferStates } from './constants';
import { automatedTransfer as schema } from './schema';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET as SET_STATUS,
	AUTOMATED_TRANSFER_STATUS_REQUEST as REQUEST_STATUS,
	AUTOMATED_TRANSFER_STATUS_REQUEST_FAILURE as REQUEST_STATUS_FAILURE,
	THEME_TRANSFER_INITIATE_REQUEST as INITIATE,
	THEME_TRANSFER_INITIATE_FAILURE as INITIATE_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE as TRANSFER_UPDATE,
} from 'state/action-types';

export const status = ( state = null, action ) =>
	get(
		{
			[ ELIGIBILITY_UPDATE ]: state || transferStates.INQUIRING,
			[ INITIATE ]: transferStates.START,
			[ INITIATE_FAILURE ]: transferStates.FAILURE,
			[ SET_STATUS ]: action.status,
			[ TRANSFER_UPDATE ]: 'complete' === action.status ? transferStates.COMPLETE : state,
		},
		action.type,
		state
	);

export const fetchingStatus = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case REQUEST_STATUS:
			return true;

		case REQUEST_STATUS_FAILURE:
			return false;

		default:
			return state;
	}
} );

export const siteReducer = combineReducers( {
	eligibility,
	status,
	fetchingStatus,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
export default withSchemaValidation( schema, keyedReducer( 'siteId', siteReducer ) );
