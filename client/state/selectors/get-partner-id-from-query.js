/**
 * Internal dependencies
 */
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

/**
 * Returns the partner_id query param if present or null.
 *
 * @param {object}   state Global state tree
 * @returns {?number}       The partner ID as an integer or null
 */
export const getPartnerIdFromQuery = function ( state ) {
	const queryArgs = getCurrentQueryArguments( state );
	const partnerId = Number( queryArgs?.partner_id );
	return Number.isInteger( partnerId ) ? partnerId : null;
};

export default getPartnerIdFromQuery;
