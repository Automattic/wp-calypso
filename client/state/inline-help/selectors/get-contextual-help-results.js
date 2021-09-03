import { getContextResults } from 'calypso/blocks/inline-help/contextual-help';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { getSectionName } from 'calypso/state/ui/selectors';

import 'calypso/state/inline-help/init';

/**
 * Returns an array of contextual results
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}         List of contextual results based on route
 */
export default ( state ) => {
	const currentUserId = getCurrentUserId( state );
	const hasPurchases = hasCancelableUserPurchases( state, currentUserId );

	const sectionName = getSectionName( state );
	const contextualResults = getContextResults( sectionName );

	const results = contextualResults.filter( ( { post_id } ) => {
		// Unless searching with Inline Help or on the Purchases section, hide the
		// "Managing Purchases" documentation link for users who have not made a purchase.
		if (
			post_id === 111349 &&
			! hasPurchases &&
			! [ 'purchases', 'site-purchases' ].includes( sectionName )
		) {
			return false;
		}
		return true;
	} );

	return results;
};
