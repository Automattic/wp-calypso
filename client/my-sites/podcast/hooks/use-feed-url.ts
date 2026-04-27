import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getTerm, getTerms } from 'calypso/state/terms/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const useFeedUrl = (): string => {
	return useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return '';
		}
		const categoryId = getPodcastingCategoryId( state, siteId );
		const terms = getTerms( state, siteId, 'category' );
		const fallbackCategoryId = Array.isArray( terms )
			? terms.find( ( term ) => term?.name?.toLowerCase?.() === 'podcast' )?.ID
			: null;
		const resolvedCategoryId = Number( categoryId || fallbackCategoryId || 0 );
		if ( ! resolvedCategoryId ) {
			return '';
		}
		const category = getTerm( state, siteId, 'category', resolvedCategoryId ) as {
			feed_url?: string;
		} | null;
		let url: string = category?.feed_url ?? '';
		if ( url && ! isJetpackSite( state, siteId ) ) {
			url = url.replace( /^http:/, 'https:' );
		}
		return url;
	} );
};
