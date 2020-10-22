/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteSlug, isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const getPostTypeAllPostsUrl = ( state, postType ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isSingleUSer = isSingleUserSite( state, siteId );

	const postTypeUrl = get( { page: 'pages', post: 'posts' }, postType, `types/${ postType }` );

	if ( postType === 'post' && ! isJetpack && ! isSingleUSer ) {
		return `/${ postTypeUrl }/my/${ siteSlug }`;
	}

	return `/${ postTypeUrl }/${ siteSlug }`;
};

export default getPostTypeAllPostsUrl;
