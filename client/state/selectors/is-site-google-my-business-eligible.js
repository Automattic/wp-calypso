/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSitePlanSlug } from 'state/sites/selectors';
import { planHasFeature, planMatches } from 'lib/plans';
import { FEATURE_GOOGLE_MY_BUSINESS, TYPE_BUSINESS, GROUP_JETPACK } from 'lib/plans/constants';

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
 * Returns true if site has Jetpack premium/business plan
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  siteId The Site ID
 * @returns {boolean} True if site has business plan
 */
export const siteHasEligibleJetpackPlan = createSelector(
	( state, siteId ) => {
		const slug = getSitePlanSlug( state, siteId );

		return planMatches( slug, { group: GROUP_JETPACK, type: TYPE_BUSINESS } );
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
	return siteHasEligibleWpcomPlan( state, siteId ) || siteHasEligibleJetpackPlan( state, siteId );
}
