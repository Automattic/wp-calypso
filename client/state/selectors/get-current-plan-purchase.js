/**
 * Internal dependencies
 */
import getCurrentPlanPurchaseId from 'state/selectors/get-current-plan-purchase-id';
import { getByPurchaseId } from 'state/purchases/selectors';

/**
 * Return the purchase object for a site's current plan or null if not found.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Purchase object or null if not found
 */
export default function getCurrentPlanPurchase( state, siteId ) {
	const result = getByPurchaseId( state, getCurrentPlanPurchaseId( state, siteId ) );
	// getByPurchaseId may return `undefined`. Ensure our return is [ purchase object | null ]
	return 'undefined' !== typeof result ? result : null;
}
