/** @format */
/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import { domainTransferSchema } from './schema';
import { DOMAIN_TRANSFER_UPDATE } from 'state/action-types';

/**
 * Returns the updated state after an action has been dispatched. The
 * state maps domain to the domain's transfer object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer(
	{},
	{
		[ DOMAIN_TRANSFER_UPDATE ]: ( state, { domain, options } ) => ( {
			...state,
			[ domain ]: options,
		} ),
	},
	domainTransferSchema
);

export default combineReducers( {
	items,
} );
