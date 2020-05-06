/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Returns the marketing price group of the current user.
 *
 * @param {object} state Global state tree
 * @returns {string?} The price group slug
 */
export default ( state ) => {
	const currentUser = getCurrentUser( state );

	return ( currentUser && currentUser.meta.marketing_price_group ) || null;
};
