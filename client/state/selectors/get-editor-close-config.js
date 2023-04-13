import { translate } from 'i18n-calypso';
import getLastNonEditorRoute from 'calypso/state/selectors/get-last-non-editor-route';
import getPostTypeAllPostsUrl from 'calypso/state/selectors/get-post-type-all-posts-url';
import { getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Gets the URL for the close button for the block editor, dependent previous referral state
 *
 * @param {Object} state  Global state tree
 * @param {number|string|undefined|null} siteId Site ID
 * @param {string} postType The type of the current post being edited
 * @returns {{url: string; label: string}} The URL that should be used when the block editor close button is clicked
 * @property {string} url The URL that should be used when the block editor close button is clicked
 * @property {string} label The label that should be used for the block editor back button
 */

export default function getEditorCloseConfig( state, siteId, postType ) {
	// @TODO: See if more generic back navigation would work.

	const lastNonEditorRoute = getLastNonEditorRoute( state );

	const doesRouteMatch = ( matcher ) => lastNonEditorRoute.match( matcher );

	const currentSiteId = state?.ui?.selectedSiteId;
	const currentSite = state?.sites?.items[ currentSiteId ];

	// Redirect user to Launchpad screen if launchpad is enabled
	if ( currentSite?.options?.launchpad_screen === 'full' ) {
		const siteSlug = getSiteSlug( state, currentSiteId );
		const flow = currentSite?.options?.site_intent;
		return {
			url: `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }`,
			label: translate( 'Next steps' ),
		};
	}

	// Back to the themes list.
	if ( doesRouteMatch( /^\/themes\/?/ ) ) {
		return {
			url: `/themes/${ getSiteSlug( state, siteId ) }`,
			label: translate( 'Themes' ),
		};
	}

	// If a user comes from Home or from a fresh page load (i.e. Signup),
	// redirect to Customer Home.
	// If no postType, assume site editor and land on home.
	if ( ! lastNonEditorRoute || ! postType || doesRouteMatch( /^\/home\/?/ ) ) {
		return {
			url: `/home/${ getSiteSlug( state, siteId ) }`,
			label: translate( 'Dashboard' ),
		};
	}

	// Otherwise, just return to post type listings

	let label = translate( 'Back' );
	if ( postType === 'post' ) {
		label = translate( 'View Posts' );
	} else if ( postType === 'page' ) {
		label = translate( 'View Pages' );
	}

	return {
		url: getPostTypeAllPostsUrl( state, postType ),
		label,
	};
}
