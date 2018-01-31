/** @format */

/**
 * Internal dependencies
 */
import { DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD } from 'state/action-types';

export const validationSchemas = ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD:
			return { ...state, ...action.schemas };
		default:
			return state;
	}
};

export default validationSchemas;
