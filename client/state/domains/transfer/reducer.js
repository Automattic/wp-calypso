/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { domainTransferSchema } from './schema';
import { DOMAIN_TRANSFER_UPDATE } from 'calypso/state/action-types';

/**
 * Returns the updated state after an action has been dispatched. The
 * state maps domain to the domain's transfer object.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( domainTransferSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_TRANSFER_UPDATE: {
			const { domain, options } = action;

			return {
				...state,
				[ domain ]: options,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
