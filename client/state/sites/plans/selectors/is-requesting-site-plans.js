/**
 * Internal dependencies
 */
import { getPlansBySiteId } from 'state/sites/plans/selectors/get-plans-by-site';

export function isRequestingSitePlans( state, siteId ) {
	const plans = getPlansBySiteId( state, siteId );
	return plans.isRequesting;
}
