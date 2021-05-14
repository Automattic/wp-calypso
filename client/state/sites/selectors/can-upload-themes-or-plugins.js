/**
 * Internal dependencies
 */
import getSitePlanSlug from 'calypso/state/sites/selectors/get-site-plan-slug';
import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';

// Only sites with plans Business and Ecommerce can install third-party themes and/or plugins.
export default function siteCanUploadThemesOrPlugins( state, siteId ) {
	const planSlug = getSitePlanSlug( state, siteId );
	return (
		( isBusinessPlan( planSlug ) || isEcommercePlan( planSlug ) ) &&
		isSiteWpcomAtomic( state, siteId )
	);
}
