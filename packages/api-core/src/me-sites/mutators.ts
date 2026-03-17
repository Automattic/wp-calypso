import { wpcom } from '../wpcom-fetcher';

export async function setFavoriteSite(
	siteId: number,
	isFavorited: boolean
): Promise< { is_favorited: boolean } > {
	return wpcom.req.post( {
		path: `/me/sites/${ siteId }/favorite`,
		apiNamespace: 'wpcom/v2',
		body: { is_favorited: isFavorited },
	} );
}
