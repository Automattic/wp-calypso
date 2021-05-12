/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';

export default function siteHasBusinessOrEcommercePlan( state, siteId ) {
	const currentSite = getSitesItems( state )[ siteId ];
	const planSlug = get( currentSite, 'plan.product_slug' );
	return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
}
