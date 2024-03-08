import { PLAN_FREE, PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import type { AppState } from 'calypso/types';

export interface SitePlan {
	expired: boolean;
	free_trial?: boolean;
	is_free?: boolean;
	product_id: number;
	product_name_short: string;
	product_slug: string; // this should be PlanSlug, but it's defined in calypso-products, while SiteDetails (from getRawSite) in data-stores (one is published on NPM, the other not)
	user_is_owner?: boolean;
}

/**
 * Returns a site's plan object by site ID.
 *
 * The difference between this selector and sites/plans/getPlansBySite is that the latter selectors works
 * with the /sites/$site/plans endpoint while the former selectors works with /sites/$site endpoint.
 * Query these endpoints to see if you need the first or the second one.
 * @param state Global state tree
 * @param siteId Site ID
 * @returns Site's plan object
 */
export default function getSitePlan(
	state: AppState,
	siteId: number | null
): SitePlan | null | undefined {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	if ( site.plan?.expired ) {
		if ( site.jetpack && ! site.is_wpcom_atomic ) {
			return {
				product_id: 2002,
				product_slug: PLAN_JETPACK_FREE,
				product_name_short: 'Free',
				free_trial: false,
				expired: false,
			};
		}

		return {
			product_id: 1,
			product_slug: PLAN_FREE,
			product_name_short: 'Free',
			free_trial: false,
			expired: false,
		};
	}

	return site.plan;
}
