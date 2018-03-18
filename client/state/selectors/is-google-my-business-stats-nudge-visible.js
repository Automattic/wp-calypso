/** @format */

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteOption, getSitePlanSlug } from 'state/sites/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

/**
 * Returns true if site has promote goal set
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The Site ID
 * @return {Boolean} True if site has "promote" goal
 */
const siteHasPromoteGoal = createSelector(
	( state, siteId ) => {
		const siteGoals = ( getSiteOption( state, siteId, 'site_goals' ) || '' ).split( ',' );
		return siteGoals.indexOf( 'promote' ) !== -1;
	},
	( state, siteId ) => [ getSiteOption( state, siteId, 'site_goals' ) ]
);

/**
 * Returns true if site has business plan
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The Site ID
 * @return {Boolean} True if site has business plan
 */
const siteHasBusinessPlan = createSelector(
	( state, siteId ) => getSitePlanSlug( state, siteId ) === PLAN_BUSINESS,
	( state, siteId ) => [ getSitePlanSlug( state, siteId ) ]
);

/**
 * Returns true if the Google My Business (GMB) nudge should be visible in stats
 *
 * It should be visible if:
 * - site is older than 1 week,
 * - site has a business plan
 * - site has a promote goal
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The Site ID
 * @return {Boolean} True if we should show the nudge
 */
const isGoogleMyBusinessStatsNudgeVisible = ( state, siteId ) => {
	const createdAt = getSiteOption( state, siteId, 'created_at' );
	const isWeekPassedSinceSiteCreation =
		Date.parse( createdAt ) + WEEK_IN_SECONDS * 1000 < Date.now();

	return (
		isWeekPassedSinceSiteCreation &&
		siteHasBusinessPlan( state, siteId ) &&
		siteHasPromoteGoal( state, siteId )
	);
};

export default isGoogleMyBusinessStatsNudgeVisible;
