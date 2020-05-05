/**
 * Internal dependencies
 */
import isSiteGoogleMyBusinessEligible from 'state/selectors/is-site-google-my-business-eligible';
import { isRequestingSiteKeyrings, getSiteKeyrings } from 'state/site-keyrings/selectors';

/**
 * Returns true if the Google My Business (GMB) nudge should be visible in stats
 *
 * It should be visible if:
 * - it meets the Google My Business Site Eligiblility Critera ( see isSiteGoogleMyBusinessEligible ),
 * - site has NOT been connected to a location
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  siteId The Site ID
 * @returns {boolean} True if we should show the nudge
 */
export default function isGoogleMyBusinessStatsNudgeVisible( state, siteId ) {
	// We don't want to show the nudge, and then hide it when it's obvious
	// the site is actually already connected, therefore we must wait for the site
	// settings to be fetched so we could verify site does not have connection connected
	if ( getSiteKeyrings( state, siteId ) === null || isRequestingSiteKeyrings( state, siteId ) ) {
		return false;
	}

	// Don't show the nudge if the site is already connected (can be from another admin)
	const siteKeyrings = state.siteKeyrings.items[ siteId ] ?? [];
	const googleMyBusinessSiteKeyring = siteKeyrings.find(
		( keyring ) => keyring.service === 'google_my_business' && !! keyring.external_user_id
	);

	if ( googleMyBusinessSiteKeyring ) {
		return false;
	}

	return isSiteGoogleMyBusinessEligible( state, siteId );
}
