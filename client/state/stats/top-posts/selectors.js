/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if current requesting top posts for the specified site ID,
 * period and date, or false otherwise.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {String}  date    Most recent day
 * @param  {String}  period  Period (day, week, month, year) (default: 'day')
 * @param  {Number}  num     Number of periods (default: 1)
 * @return {Boolean}         Whether the top posts are being requested
 */
export function isRequestingTopPosts( state, siteId, date, period = 'day', num = 1 ) {
	return get( state.stats.topPosts.requesting, [ siteId, date + period + num ], false );
}

/**
 * Returns the top posts for the specified period and date.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {String}  date    Most recent day to include
 * @param  {String}  period  Period to fetch (day, week, month, year) (default: 'day')
 * @param  {Number}  num     Number of periods to include (default: 1)
 * @return {Object}          Top posts
 */
export function getTopPosts( state, siteId, date, period = 'day', num = 1 ) {
	return get( state.stats.topPosts.items, [ siteId, date + period + num ], null );
}
