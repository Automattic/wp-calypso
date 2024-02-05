import { addQueryArgs } from 'calypso/lib/route';
import { getEditorPath } from 'calypso/state/editor/selectors';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { shouldCalypsoifyJetpack } from 'calypso/state/selectors/should-calypsoify-jetpack';
import shouldLoadGutenframe from 'calypso/state/selectors/should-load-gutenframe';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';

export const getEditorUrl = (
	state: AppState,
	siteId: number,
	postId: string | number | null | undefined = '',
	postType = 'post'
): string => {
	if ( ! shouldLoadGutenframe( state, siteId, postType ) ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		let url = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

		if ( postId ) {
			url = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
		}

		if ( ! isVipSite( state, siteId ) && shouldCalypsoifyJetpack( state, siteId ) ) {
			url = addQueryArgs( { calypsoify: '1' }, url );
		}

		if ( typeof window !== 'undefined' && window.location.origin !== 'https://wordpress.com' ) {
			url = addQueryArgs( { calypso_origin: window.location.origin }, url );
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
