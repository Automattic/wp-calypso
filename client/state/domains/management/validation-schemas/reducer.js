/** @format */

/**
 * Internal dependencies
 */
import { DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD } from 'state/action-types';

export const validationSchemas = ( state = null, action ) => {
	switch ( action.type ) {
		case DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD:
			return action.items;
		default:
			return state;
	}
};

export default validationSchemas;
