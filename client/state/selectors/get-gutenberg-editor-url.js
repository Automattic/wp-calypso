/**
 * Internal dependencies
 */
import { shouldRedirectGutenberg } from 'state/selectors/should-redirect-gutenberg';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { getSiteAdminUrl, getSiteSlug } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { addQueryArgs } from 'lib/route';

export const getGutenbergEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	if ( shouldRedirectGutenberg( state, siteId ) ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		let url = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

		if ( postId ) {
			url = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
		}

		if ( 'gutenberg-redirect-and-style' === getSelectedEditor( state, siteId ) ) {
			url = addQueryArgs( { calypsoify: '1' }, url );
		}

		return url;
	}

	if ( postId ) {
		return `/block-editor${ getEditorPath( state, siteId, postId, postType ) }`;
	}

	const siteSlug = getSiteSlug( state, siteId );

	if ( 'post' === postType || 'page' === postType ) {
		return `/block-editor/${ postType }/${ siteSlug }`;
	}
	return `/block-editor/edit/${ postType }/${ siteSlug }`;
};

export default getGutenbergEditorUrl;
