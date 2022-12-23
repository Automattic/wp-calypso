import { createSelector } from '@automattic/state-utils';
import { get } from 'lodash';

import 'calypso/state/stats/init';

/**
 * Returns true if current requesting email stat for the specified site ID,
 * email ID and stat key, or * false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Email Id
 * @param  {object}  fields Stat fields
 * @returns {boolean}        Whether email stat is being requested
 */
export function isRequestingEmailStats( state, siteId, postId, fields = [] ) {
	return state.stats.email
		? get( state.stats.email.requesting, [ siteId, postId, fields.join() ], false )
		: false;
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
