/** @format */

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteOption, getSitePlanSlug } from 'state/sites/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';

/**
 * Returns true if the Google My Business (GMB) nudge should be visible in stats
 *
 * It should be visible if:
 * - site is older than 2 weeks,
 * - site has a business plan
 * - site has a promote goal
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The Site ID
 * @return {Boolean} True if we should show the nudge
 */
export default createSelector(
	( state, siteId ) => {
		const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
		const createdAt = getSiteOption( state, siteId, 'created_at' );

		if ( Date.parse( createdAt ) + WEEK_IN_SECONDS * 1000 > Date.now() ) {
			return false;
		}

		const siteGoals = ( getSiteOption( state, siteId, 'site_goals' ) || '' ).split( ',' );
		const sitePlan = getSitePlanSlug( state, siteId );
		return siteGoals.indexOf( 'promote' ) !== -1 && sitePlan === PLAN_BUSINESS;
	},
	( state, siteId ) => [
		getSitePlanSlug( state ),
		getSiteOption( state, siteId, 'site_goals' ),
		getSiteOption( state, siteId, 'created_at' ),
	]
);
