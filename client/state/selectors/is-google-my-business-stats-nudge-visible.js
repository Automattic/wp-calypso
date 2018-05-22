/** @format */

/**
 * Internal dependencies
 */
import isGoogleMyBusinessLocationConnected from 'state/selectors/is-google-my-business-location-connected';
import isSiteGoogleMyBusinessEligible from 'state/selectors/is-site-google-my-business-eligible';
import { isRequestingSiteSettings, getSiteSettings } from 'state/site-settings/selectors';

/**
 * Returns true if the Google My Business (GMB) nudge should be visible in stats
 *
 * It should be visible if:
 * - it meets the Google My Business Site Eligiblility Critera ( see isSiteGoogleMyBusinessEligible ),
 * - site has NOT been connected to a location
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The Site ID
 * @return {Boolean} True if we should show the nudge
 */
export default function isGoogleMyBusinessStatsNudgeVisible( state, siteId ) {
	// We don't want to show the nudge, and then hide it when it's obvious
	// the site is actually already connected, therefore we must wait for the site
	// settings to be fetched so we could verify site does not have connection connected
	if ( getSiteSettings( state, siteId ) === null || isRequestingSiteSettings( state, siteId ) ) {
		return false;
	}

	if ( isGoogleMyBusinessLocationConnected( state, siteId ) ) {
		return false;
	}

	return isSiteGoogleMyBusinessEligible( state, siteId );
}
