import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getTerm } from 'calypso/state/terms/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const usePodcastingFeedUrl = (): string => {
	return useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return '';
		}
		const categoryId = getPodcastingCategoryId( state, siteId );
		if ( ! categoryId ) {
			return '';
		}
		const category = getTerm( state, siteId, 'category', Number( categoryId ) ) as {
			feed_url?: string;
		} | null;
		let url: string = category?.feed_url ?? '';
		if ( url && ! isJetpackSite( state, siteId ) ) {
			url = url.replace( /^http:/, 'https:' );
		}
		return url;
	} );
};
