/** @format */

/**
 * Internal dependencies
 */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { PRIVACY_POLICY_ADD } from 'state/action-types';

import { privacyPolicySchema } from './schema';

export const entities = createReducer(
	{},
	{
		[ PRIVACY_POLICY_ADD ]: ( state, actions ) => actions.entities,
	},
	privacyPolicySchema
);

export default combineReducers( {
	entities,
} );
