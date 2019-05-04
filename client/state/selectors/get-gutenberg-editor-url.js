/** @format */
/**
 * Internal dependencies
 */
import isWpAdminGutenbergEnabled from 'state/selectors/is-wp-admin-gutenberg-enabled';
import { getSiteAdminUrl, getSiteSlug } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { isEnabled } from 'config';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import { addQueryArgs } from 'lib/route';

export const getGutenbergEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	if ( isWpAdminGutenbergEnabled( state, siteId ) ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		let url = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

		if ( postId ) {
			url = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
		}

		// We want Calypsoify flows on Atomic sites
		if ( isSiteAtomic( state, siteId ) && isEnabled( 'calypsoify/gutenberg' ) ) {
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
