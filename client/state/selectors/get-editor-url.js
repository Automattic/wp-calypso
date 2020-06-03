/**
 * Internal dependencies
 */
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { shouldLoadGutenberg } from 'state/selectors/should-load-gutenberg';
import { getSiteSlug } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import inEditorDeprecationGroup from 'state/editor-deprecation-group/selectors/in-editor-deprecation-group';
import { isEnabled } from 'config';
import getWpAdminClassicEditorRedirectionUrl from 'state/selectors/get-wp-admin-classic-editor-redirection-url';

export const getEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	if ( isEnabled( 'editor/after-deprecation' ) && inEditorDeprecationGroup( state ) ) {
		return getWpAdminClassicEditorRedirectionUrl( state, siteId, postId );
	}

	if ( shouldLoadGutenberg( state, siteId ) ) {
		return getGutenbergEditorUrl( state, siteId, postId, postType );
	}

	if ( postId ) {
		return getEditorPath( state, siteId, postId, postType );
	}

	const siteSlug = getSiteSlug( state, siteId );

	if ( 'post' === postType || 'page' === postType ) {
		return `/${ postType }/${ siteSlug }`;
	}
	return `/edit/${ postType }/${ siteSlug }`;
};

export default getEditorUrl;
