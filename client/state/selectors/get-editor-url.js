/**
 * Internal dependencies
 */
import getGutenbergEditorUrl from 'calypso/state/selectors/get-gutenberg-editor-url';
import isClassicEditorForced from 'calypso/state/selectors/is-classic-editor-forced';
import isEligibleForGutenframe from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';

export const getEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	// isEligibleForGutenframe deals with the server side checks for classic editor plugin etc.
	// isClassicEditerForced has the client side checks. We should combine these!
	if ( ! isEligibleForGutenframe( state, siteId ) || isClassicEditorForced( state, siteId ) ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		let url = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

		if ( postId ) {
			url = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
		}

		return url;
	}

	return getGutenbergEditorUrl( state, siteId, postId, postType );
};

export default getEditorUrl;
