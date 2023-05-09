import { addQueryArgs } from 'calypso/lib/route';
import { getEditorPath } from 'calypso/state/editor/selectors';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { shouldCalypsoifyJetpack } from 'calypso/state/selectors/should-calypsoify-jetpack';
import shouldLoadGutenframe from 'calypso/state/selectors/should-load-gutenframe';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';

export const getEditorUrl = ( state, siteId, postId = '', postType = 'post' ) => {
	if ( ! shouldLoadGutenframe( state, siteId, postType ) ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		let url = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

		if ( postId ) {
			url = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
		}

		if ( ! isVipSite( state, siteId ) && shouldCalypsoifyJetpack( state, siteId ) ) {
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
