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

	return url;
};

export default getEditorUrl;
