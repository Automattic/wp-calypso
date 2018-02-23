/** @format */

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteOption, getSitePlanSlug } from 'state/sites/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { getPreference } from 'state/preferences/selectors';

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const TWO_WEEKS_IN_SECONDS = 2 * WEEK_IN_SECONDS;

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
 * Returns true if nudge for the site had not yet been dismissed
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The Site ID
 * @return {Boolean} True if nudge has not been dismissed for site
 */
const notYetDismissed = createSelector(
	( state, siteId ) =>
		null === getPreference( state, 'google-my-business-dimissible-nudge-' + siteId.toString() ),
	( state, siteId ) => [
		getPreference( state, 'google-my-business-dimissible-nudge-' + siteId.toString() ),
	]
);

/**
 * Returns true if the nudge for the site been dismissed more than two weeks ago
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The Site ID
 * @return {Boolean} True if the nudge for the site been dismissed more than two weeks ago
 */
const twoWeeksSinceFirstDismissal = ( state, siteId ) => {
	const preference = getPreference(
		state,
		'google-my-business-dimissible-nudge-' + siteId.toString()
	);
	return (
		preference &&
		preference.timesDismissed === 1 &&
		preference.lastDismissed + TWO_WEEKS_IN_SECONDS * 1000 < Date.now()
	);
};

/**
 * Returns true if the Google My Business (GMB) nudge should be visible in stats
 *
 * It should be visible if:
 * - site is older than 1 week,
 * - site has a business plan
 * - site has a promote goal
 * - user had not dismissed nudge
 *   OR nudge dismissed for the first time over two weeks ago
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
		siteHasPromoteGoal( state, siteId ) &&
		( notYetDismissed( state, siteId ) || twoWeeksSinceFirstDismissal( state, siteId ) )
	);
};

export default isGoogleMyBusinessStatsNudgeVisible;
