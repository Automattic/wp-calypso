/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';

/**
 * Returns the number of times the current user dismissed the nudge
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The Id of the site
 * @returns {number}  Count  the number of times the nudge has been dismissed
 */
export default function getGoogleMyBusinessStatsNudgeDismissCount( state, siteId ) {
	const preference = getPreference( state, 'google-my-business-dismissible-nudge' ) || {};
	const sitePreference = preference[ siteId ] || [];

	return sitePreference.filter( ( event ) => 'dismiss' === event.type ).length;
}
