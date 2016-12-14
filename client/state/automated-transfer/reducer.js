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
import { automatedTransfer as schema } from './schema';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET as SET_STATUS,
} from 'state/action-types';

export const status = ( state = null, action ) => get( {
	[ SET_STATUS ]: action.status,
	[ UPDATE ]: action.status,
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
