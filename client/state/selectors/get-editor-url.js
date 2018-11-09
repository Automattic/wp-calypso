/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { getSiteSlug } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

export const getEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	if ( isEnabled( 'gutenberg' ) && 'gutenberg' === getSelectedEditor( state, siteId ) ) {
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
