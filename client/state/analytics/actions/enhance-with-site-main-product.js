import { set } from 'lodash';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { ANALYTICS_PAGE_VIEW_RECORD } from 'calypso/state/action-types';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Enhances any Redux action that denotes the recording of a page view analytics event with an additional property
 * to specifies the main product of this site:
 * `domain` - domain only, without email subscription
 * `email` - domain only with email subscription
 * `site` - regular site
 *
 * @param {object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithSiteMainProduct( action, getState ) {
	if ( action.type === ANALYTICS_PAGE_VIEW_RECORD ) {
		const state = getState();
		const site = getSelectedSite( state );

		if ( site !== null ) {
			const siteId = getSelectedSiteId( state, site );
			let mainProduct = 'site';

			if ( isDomainOnly( state, siteId ) ) {
				mainProduct = 'domain';

				const nonWPCOMDomains = getDomainsBySiteId( state, siteId ).filter(
					( domain ) => ! domain.isWPCOMDomain
				);

				// Domain only site should only have one single domain non-wpcom domain.
				if (
					hasTitanMailWithUs( nonWPCOMDomains[ 0 ] ) ||
					hasGSuiteWithUs( nonWPCOMDomains[ 0 ] )
				) {
					mainProduct = 'email';
				}
			}

			set( action, 'meta.analytics[0].payload.site_main_product', mainProduct );
		}
	}

	return action;
}
