/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Returns an object with domain validation schemas keyed by tld
 *
 * @param  {object}  state Global state tree
 * @returns {object|null} Validation JSON Schemas by tld
 */
export default function getValidationSchemas( state ) {
	return get( state, 'domains.management.validationSchemas', {} );
}
