/**
 * Internal dependencies
 */
import { DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_ADD } from 'calypso/state/action-types';

export const validationSchemas = ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_ADD:
			// action.schemas should contain schema objects keyed by tld, like:
			// { uk: ukValidationSchema, fr: frValidationSchema, ... }
			return { ...state, ...action.schemas };
		default:
			return state;
	}
};

export default validationSchemas;
