import { addQueryArgs } from 'calypso/lib/route';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { shouldCalypsoifyJetpack } from 'calypso/state/selectors/should-calypsoify-jetpack';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';

export const getEditorUrl = (
	state: AppState,
	siteId: number,
	postId: string | number | null | undefined = '',
	postType = 'post'
): string => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	let url = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

	if ( postId ) {
		url = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
	}

	if ( ! isVipSite( state, siteId ) && shouldCalypsoifyJetpack( state, siteId ) ) {
		url = addQueryArgs( { calypsoify: '1' }, url );
	}

	return url;
};

export default getEditorUrl;
