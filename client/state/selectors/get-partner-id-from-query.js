/**
 * External dependencies
 */
import { get, toNumber, isInteger } from 'lodash';

/**
 * Internal dependencies
 */
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';

/**
 * Returns the partner_id query param if present or null.
 *
 * @param {object}   state Global state tree
 * @returns {?number}       The partner ID as an integer or null
 */
export const getPartnerIdFromQuery = function ( state ) {
	const partnerId = toNumber( get( getCurrentQueryArguments( state ), 'partner_id' ) );
	return isInteger( partnerId ) ? partnerId : null;
};

export default getPartnerIdFromQuery;
