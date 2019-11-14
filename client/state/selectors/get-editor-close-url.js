/**
 * Internal dependencies
 */
import { getSiteSlug } from 'state/sites/selectors';
import getPostTypeAllPostsUrl from 'state/selectors/get-post-type-all-posts-url';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import isLastNonEditorRouteChecklist from 'state/selectors/is-last-non-editor-route-checklist';

/**
 * Gets the URL for the close button for the block editor, dependent previous referral state
 * @param {Object} state  Global state tree
 * @param {Object} siteId Site ID
 * @param {string} postType The type of the current post being edited
 * @param {string} fseParentPageId The ID of the parent post for the FSE template part
 * @return {string} The URL that should be used when the block editor close button is clicked
 */

export default function getEditorCloseUrl( state, siteId, postType, fseParentPageId ) {
	// Handle returning to parent editor for full site editing templates
	if ( 'wp_template_part' === postType ) {
		return getGutenbergEditorUrl( state, siteId, fseParentPageId, 'page' );
	}

	// Checking if we should navigate back to the checklist
	if ( isLastNonEditorRouteChecklist( state ) ) {
		return `/checklist/${ getSiteSlug( state, siteId ) }`;
	}

	// Otherwise, just return to post type listings
	return getPostTypeAllPostsUrl( state, postType );
}
