import { shouldReportOmitSiteMainProduct } from 'calypso/lib/analytics/utils';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { ANALYTICS_PAGE_VIEW_RECORD } from 'calypso/state/action-types';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Enhances any Redux action that denotes the recording of a page view analytics event with an additional property
 * to specify the main product of this site:
 * `domain` - domain only, without email subscription
 * `email` - domain only with email subscription
 * `site` - regular site
 *
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithSiteMainProduct( action, getState ) {
	if ( action.type !== ANALYTICS_PAGE_VIEW_RECORD ) {
		return action;
	}

	const path = action.meta.analytics[ 0 ].payload.url;
	if ( shouldReportOmitSiteMainProduct( path ) ) {
		return action;
	}

	const state = getState();
	const siteId = getSelectedSiteId( state );
	let mainProduct = 'site';

	if ( isDomainOnly( state, siteId ) ) {
		mainProduct = 'domain';

		// Domain-only sites should only have one non-wpcom domain.
		const nonWPCOMDomain = getDomainsBySiteId( state, siteId ).find(
			( domain ) => ! domain.isWPCOMDomain
		);

		if ( hasTitanMailWithUs( nonWPCOMDomain ) || hasGSuiteWithUs( nonWPCOMDomain ) ) {
			mainProduct = 'email';
		}
	}

	const updatedAction = JSON.parse( JSON.stringify( action ) );

	// Be sure to return a new copy instead of mutating the original Redux action.
	updatedAction.meta.analytics[ 0 ].payload.site_main_product = mainProduct;

	return updatedAction;
}
