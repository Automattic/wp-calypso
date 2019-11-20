/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteSlug } from 'state/sites/selectors';
import getPostTypeAllPostsUrl from 'state/selectors/get-post-type-all-posts-url';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import getLastNonEditorRoute from 'state/selectors/get-last-non-editor-route';

/**
 * Gets the URL for the close button for the block editor, dependent previous referral state
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @param {string} postType The type of the current post being edited
 * @param {string} fseParentPageId The ID of the parent post for the FSE template part
 * @returns {object} The URL that should be used when the block editor close button is clicked
 * @property {string} url The URL that should be used when the block editor close button is clicked
 * @property {string} label The label that should be used for the block editor back button
 */

export default function getEditorCloseConfig( state, siteId, postType, fseParentPageId ) {
	// Handle returning to parent editor for full site editing templates
	if ( 'wp_template_part' === postType ) {
		return {
			url: getGutenbergEditorUrl( state, siteId, fseParentPageId, 'page' ),
			label: fseParentPageId ? translate( 'Back to page' ) : translate( 'Back' ),
		};
	}

	// @TODO: See if more generic back navigation would work.

	// Back to the checklist.
	if ( getLastNonEditorRoute( state ).match( /^\/checklist\/?/ ) ) {
		return {
			url: `/checklist/${ getSiteSlug( state, siteId ) }`,
			label: translate( 'Checklist' ),
		};
	}

	// Customer Home.
	if ( getLastNonEditorRoute( state ).match( /^\/home\/?/ ) ) {
		return {
			url: `/home/${ getSiteSlug( state, siteId ) }`,
			label: translate( 'Home' ),
		};
	}

	// Back to the themes list.
	if ( getLastNonEditorRoute( state ).match( /^\/themes\/?/ ) ) {
		return {
			url: `/themes/${ getSiteSlug( state, siteId ) }`,
			label: translate( 'Themes' ),
		};
	}

	// Otherwise, just return to post type listings
	return {
		url: getPostTypeAllPostsUrl( state, postType ),
	};
}
