/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';

/**
 * Returns a site's plan object by site ID.
 *
 * The difference between this selector and sites/plans/getPlansBySite is that the latter selectors works
 * with the /sites/$site/plans endpoint while the former selectors works with /sites/$site endpoint.
 * Query these endpoints to see if you need the first or the second one.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Site's plan object
 */
export default function getSitePlan( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	if ( get( site.plan, 'expired', false ) ) {
		if ( site.jetpack ) {
			return {
				product_id: 2002,
				product_slug: 'jetpack_free',
				product_name_short: 'Free',
				free_trial: false,
				expired: false,
			};
		}

		return {
			product_id: 1,
			product_slug: 'free_plan',
			product_name_short: 'Free',
			free_trial: false,
			expired: false,
		};
	}

	return site.plan;
}
