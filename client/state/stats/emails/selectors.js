import { createSelector } from '@automattic/state-utils';
import { get } from 'lodash';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';
import 'calypso/state/stats/init';

/**
 * Returns an array containing the path the data is to be found at.
 * Omits the date key when period is all time
 *
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {string}  period The period (eg day, week, month, year)
 * @param  {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {string|null?}  date The date of the stat
 * @returns {Array}  The path to the data
 */
function getDataPath( siteId, postId, period, statType, date = null ) {
	if ( period === PERIOD_ALL_TIME ) {
		return [ siteId, postId, period, statType ];
	}
	return [ siteId, postId, period, statType, date ];
}

/**
 * Returns true if current requesting email stat for the specified site ID,
 * email ID, period and stat key, or * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {string}  period The period (eg day, week, month, year)
 * @param  {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {string?}  date The date of the stat
 * @returns {boolean}        Whether email stat is being requested
 */
export function isRequestingEmailStats( state, siteId, postId, period, statType, date ) {
	return state.stats.emails
		? get(
				state.stats.emails.requests,
				[ ...getDataPath( siteId, postId, period, statType, date ), 'requesting' ],
				false
		  )
		: false;
}

/**
 * Returns true if current requesting all time email stat for the specified site ID,
 * email ID, period and stat key, or * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @returns {boolean}        Whether email stat is being requested
 */
export function isRequestingAlltimeEmailStats( state, siteId, postId, statType ) {
	return state.stats.emails
		? get(
				state.stats.emails.requests,
				[ ...getDataPath( siteId, postId, PERIOD_ALL_TIME, statType ), 'requesting' ],
				false
		  )
		: false;
}

/**
 * Returns true if we should show a loading indicator
 * Returns false if we have data or if we are requesting data
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {string}  period The period (eg day, week, month, year)
 * @param  {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {string}  date The date of the stat
 * @param {string}   path The path of the stat
 * @returns {boolean}        Whether email stat is being requested
 */
export function shouldShowLoadingIndicator( state, siteId, postId, period, statType, date, path ) {
	const stats = get(
		state.stats.emails.items,
		getDataPath( siteId, postId, period, statType, date, path ),
		null
	);
	// if we have redux stats ready return false
	if ( stats ) {
		return false;
	}
	return isRequestingEmailStats( state, siteId, postId, period, statType, date );
}

/**
 * Returns the stats for the specified site ID, postId
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Email Id
 * @returns {Object}         Stats
 */
export function getEmailStats( state, siteId, postId ) {
	return state.stats.emails ? get( state.stats.emails.items, [ siteId, postId ], null ) : [];
}

/**
 * Returns an array of emails objects by site ID.
 *
 * @param   {Object} state  Global state tree
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
 * @param   {Object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {string}  postId Email ID
 * @returns {?Object}        Email object
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
 * @param  {Object}  state    Global state tree
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
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {number}  postId  Email
 * @param  {string} period   Period
 * @param  {string} statType Stat typeId
 * @param  {string} date     Date
 * @param {string} path      Path
 * @returns {*}              Normalized data
 */
export function getEmailStatsNormalizedData( state, siteId, postId, period, statType, date, path ) {
	return state.stats.emails.items
		? get(
				state.stats.emails.items,
				[ ...getDataPath( siteId, postId, period, statType ), path ],
				null
		  )
		: null;
}

/**
 * Returns the email stats for the specified site ID, post ID
 * This is for alltime stats
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {number}  postId  Email Id
 * @param  {string} statType Stat type
 */
export function getAlltimeStats( state, siteId, postId, statType ) {
	return state.stats.emails.items
		? get( state.stats.emails.items, [ siteId, postId, PERIOD_ALL_TIME, statType ], null )
		: {};
}
