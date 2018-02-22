/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { domainStepSchema } from './schema';

export default createReducer(
	{},
	{
		[ SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET ]: ( state, action ) => {
			const { overwrite, prefill } = action;

			// Only set prefill if the value hasn't already been set.
			if ( typeof state.prefill === 'string' && state.prefill.length > 0 && ! overwrite ) {
				return state;
			}

			return {
				...state,
				prefill,
			};
		},
	},
	domainStepSchema
);
