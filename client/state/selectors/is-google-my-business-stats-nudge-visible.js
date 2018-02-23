/** @format */

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteOption, getSitePlanSlug } from 'state/sites/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { getPreference } from 'state/preferences/selectors';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DISMISS = 2;

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
 * Returns the number of times the current user dismissed the nudge
 *
 * @param  {Object}  state  Global state tree
 * @return {Number}  Count the number of times the nudge has been dismissed
 */
const getDismissCount = state => {
	const preference = getPreference( state, 'google-my-business-dismissible-nudge' );
	return preference.timesDismissed || 0;
};

/**
 * Returns the last time the nudge was dismissed by the current user or 0 if it was never dismissed
 *
 * @param  {Object}  state  Global state tree
 * @return {Number}  Timestamp marking the last time the nudge was dismissed
 */
const getLastDismissTime = state => {
	const preference = getPreference( state, 'google-my-business-dismissible-nudge' );
	return preference.timesDismissed || 0;
};

/**
 * Returns false if the Google My Business nudge has been dismissed by the current user
 * - less than MAX_DISMISS times
 * - more than 2 weeks ago
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean} True if the nudge has been dismissed
 */
const isGoogleMyBusinessStatsNudgeDismissed = state =>
	getDismissCount( state ) < MAX_DISMISS
		? getLastDismissTime( state ) + 2 * WEEK_IN_MS > Date.now()
		: false;

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
	const isWeekPassedSinceSiteCreation = Date.parse( createdAt ) + WEEK_IN_MS < Date.now();

	return (
		isWeekPassedSinceSiteCreation &&
		siteHasBusinessPlan( state, siteId ) &&
		siteHasPromoteGoal( state, siteId ) &&
		! isGoogleMyBusinessStatsNudgeDismissed( state )
	);
};

export default isGoogleMyBusinessStatsNudgeVisible;
