/** @format */

/**
 * External dependencies
 */
import { get, toNumber, isInteger } from 'lodash';

/**
 * Internal dependencies
 */
import getInitialQueryArguments from 'state/selectors/get-initial-query-arguments';

/**
 * Returns the partner_id query param if present or null.
 *
 * @param {object}   state Global state tree
 * @return {?number}       The partner ID as an integer or null
 */
export const getPartnerIdFromQuery = function( state ) {
	const partnerId = toNumber( get( getInitialQueryArguments( state ), 'partner_id' ) );
	return isInteger( partnerId ) ? partnerId : null;
};

export default getPartnerIdFromQuery;
