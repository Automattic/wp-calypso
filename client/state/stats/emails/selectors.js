import { createSelector } from '@automattic/state-utils';
import { get } from 'lodash';
import 'calypso/state/stats/init';

/**
 * Returns true if current requesting email stat for the specified site ID,
 * email ID and stat key, or * false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {number}  period The period (eg day, week, month, year)
 * @param  {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {string}  date The date of the stat
 * @returns {boolean}        Whether email stat is being requested
 */
export function isRequestingEmailStats( state, siteId, postId, period, statType, date ) {
	return state.stats.emails
		? get(
				state.stats.emails.requests,
				[ siteId, postId, period, statType, date, 'requesting' ],
				false
		  )
		: false;
}

/**
 * Returns true if we should show a loading indicator
 * Returns false if we have data or if we are requesting data
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {number}  period The period (eg day, week, month, year)
 * @param  {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {string}  date The date of the stat
 * @param {string}   path The path of the stat
 * @returns {boolean}        Whether email stat is being requested
 */
export function shouldShowLoadingIndicator( state, siteId, postId, period, statType, date, path ) {
	const stats = get(
		state.stats.emails.items,
		[ siteId, postId, period, statType, date, path ],
		null
	);
	// if we have redux stats ready return false
	if ( stats ) {
		return false;
	}
	return isRequestingEmailStats( state, siteId, postId, period, statType, date );
}

/**
 * Returns the stats for the for the specified site ID, postId
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Email Id
 * @returns {object}         Stats
 */
export function getEmailStats( state, siteId, postId ) {
	return state.stats.emails ? get( state.stats.emails.items, [ siteId, postId ], null ) : [];
}

/**
 * Returns an array of emails objects by site ID.
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @returns {Array}         Site emails
 */
export const getSiteEmails = createSelector(
	( state, siteId ) => {
		if ( ! siteId ) {
			return null;
		}

		const manager = state.stats.emails ? state.stats.emails.queries[ siteId ] : null;
		if ( ! manager ) {
			return [];
		}

		return manager.getItems();
	},
	( state ) => ( state.stats.emails ? state.stats.emails.queries : [] )
);

/**
 * Returns a email object by site ID, email ID pair.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {string}  postId Email ID
 * @returns {?object}        Email object
 */
export const getSiteEmail = createSelector(
	( state, siteId, postId ) => {
		if ( ! siteId ) {
			return null;
		}

		const manager =
			state.stats.emails && state.stats.emails.queries
				? state.stats.emails.queries[ siteId ]
				: null;
		if ( ! manager ) {
			return null;
		}

		return manager.getItem( postId );
	},
	( state ) => ( state.stats.emails ? state.stats.emails.queries : [] )
);

/**
 * Returns the stat value for the specified site ID,
 * email ID and stat key
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {number}  postId   Email Id
 * @param  {string}  period   Period
 * @param  {string}  statType Stat type
 * @returns {*}               Stat value
 */
export function getEmailStat( state, siteId, postId, period, statType ) {
	const stats = state.stats.emails
		? get( state.stats.emails.items, [ siteId, postId, period, statType ], null )
		: null;
	return stats ? Object.keys( stats ).map( ( key ) => stats[ key ] ) : null;
}

/**
 * Returns the email stats for the specified site ID,
 * post ID, period, date and stat key
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {number}  postId  Email Id
 * @param  {string} period   Period
 * @param  {string} statType Stat type
 * @param  {string} date     Date
 * @param {string} path      Path
 * @returns {*}              Normalized data
 */
export function getEmailStatsNormalizedData( state, siteId, postId, period, statType, date, path ) {
	return state.stats.emails.items
		? get( state.stats.emails.items, [ siteId, postId, period, statType, date, path ], null )
		: null;
}
