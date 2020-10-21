/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { planHasFeature } from 'calypso/lib/plans';
import { FEATURE_GOOGLE_MY_BUSINESS } from 'calypso/lib/plans/constants';

/**
 * Returns true if site has business/ecommerce plan
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  siteId The Site ID
 * @returns {boolean} True if site has business plan
 */
export const siteHasEligibleWpcomPlan = createSelector(
	( state, siteId ) => {
		const slug = getSitePlanSlug( state, siteId );

		return planHasFeature( slug, FEATURE_GOOGLE_MY_BUSINESS );
	},
	( state, siteId ) => [ getSitePlanSlug( state, siteId ) ]
);

/**
 * Returns true if the site is eligible to use Google My Business (GMB)
 *
 * It should be visible if:
 * - site has a business plan on wpcom or Jetpack premium/business
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  siteId The Site ID
 * @returns {boolean} True if we should show the nudge
 */
export default function isSiteGoogleMyBusinessEligible( state, siteId ) {
	return siteHasEligibleWpcomPlan( state, siteId );
}
