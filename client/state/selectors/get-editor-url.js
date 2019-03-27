/** @format */
/**
 * Internal dependencies
 */
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import isGutenbergEnabled from 'state/selectors/is-gutenberg-enabled';
import { getSiteSlug } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

export const getEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	if ( isGutenbergEnabled( state, siteId ) && 'gutenberg' === getSelectedEditor( state, siteId ) ) {
		// console.log('inside if getGutenbergEditorUrl: ' + getGutenbergEditorUrl( state, siteId, postId, postType ));
		return getGutenbergEditorUrl( state, siteId, postId, postType );
	}
	// console.log('isGutenbergEnabled: ' + isGutenbergEnabled( state, siteId ) + ' getSelectedEditor: ' + getSelectedEditor( state, siteId ));
	if ( null === getSelectedEditor( state, siteId ) ) {
		console.log( 'editor val is null' );
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
