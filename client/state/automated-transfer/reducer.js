/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import eligibility from './eligibility/reducer';
import plugin from './plugin/reducer';
import theme from './theme/reducer';
import {
	keyedReducer,
	withSchemaValidation,
} from 'state/utils';
import { automatedTransfer as schema } from './schema';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET as SET_STATUS,
	AUTOMATED_TRANSFER_STATUS_UPDATE as STATUS_UPDATE,
} from 'state/action-types';

export const status = ( state = null, action ) => get( {
	[ SET_STATUS ]: action.status,
	[ ELIGIBILITY_UPDATE ]: action.status,
	[ STATUS_UPDATE ]: action.status,
}, action.type, state );

export const siteReducer = combineReducers( {
	eligibility,
	plugin,
	status,
	theme,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
export default withSchemaValidation(
	schema,
	keyedReducer( 'siteId', siteReducer ),
);
