/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';
import { getEditorPath } from 'calypso/state/editor/selectors';
import { addQueryArgs } from 'calypso/lib/route';
import isClassicEditorForced from 'calypso/state/selectors/is-classic-editor-forced';

export const getEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	// isEligibleForGutenframe deals with the server side checks for classic editor plugin etc.
	// isClassicEditerForced has the client side checks. We should combine these!
	if ( ! isEligibleForGutenframe( state, siteId ) || isClassicEditorForced( state, siteId ) ) {
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
		return getEditorPath( state, siteId, postId, postType );
	}

	const siteSlug = getSiteSlug( state, siteId );

	if ( 'post' === postType || 'page' === postType ) {
		return `/${ postType }/${ siteSlug }`;
	}
	return `/edit/${ postType }/${ siteSlug }`;
};

export default getEditorUrl;
