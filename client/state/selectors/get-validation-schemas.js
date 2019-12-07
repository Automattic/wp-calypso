/** @format */
/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Returns an object with domain validation schemas keyed by tld
 *
 * @param  {Object}  state Global state tree
 * @returns {Object|Null} Validation JSON Schemas by tld
 */
export default function getValidationSchemas( state ) {
	return get( state, 'domains.management.validationSchemas', {} );
}
