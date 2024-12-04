import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { RecommendedSite } from 'calypso/state/data-layer/wpcom/read/recommendations/sites';
import {
	RecommendedSitesRequestAction,
	requestRecommendedSites,
} from 'calypso/state/reader/recommended-sites/actions';
import { getReaderRecommendedSites } from 'calypso/state/reader/recommended-sites/selectors';
import { READER_RECENT_SIDEBAR_POPULAR_SITES } from '../follow-sources';
import ReaderPopularSitesSidebar from '../stream/reader-popular-sites-sidebar';

export const RECOMMENDED_SITES_SEED = Math.floor( Math.random() * 10001 );

function ReaderStreamSidebar(): JSX.Element | null {
	const dispatch = useDispatch< Dispatch< RecommendedSitesRequestAction > >();
	const recommendedSites = useSelector( ( state ) => {
		return getReaderRecommendedSites< RecommendedSite >( state, RECOMMENDED_SITES_SEED ) || [];
	} );

	useEffect( () => {
		// Avoid fetching recommended sites if they are already present in the store.
		if ( recommendedSites.length > 0 ) {
			return;
		}

		dispatch( requestRecommendedSites( { seed: RECOMMENDED_SITES_SEED, number: 10 } ) );
	}, [ dispatch, recommendedSites ] );

	if ( recommendedSites.length === 0 ) {
		return null;
	}

	return (
		<ReaderPopularSitesSidebar
			followSource={ READER_RECENT_SIDEBAR_POPULAR_SITES }
			items={ recommendedSites.map( ( s ) => {
				return {
					blogId: s.blogId,
					feed_ID: s.feedId,
					feed_URL: s.feedUrl,
					site_name: s.title,
					site_description: s.description,
					site_icon: s.icon,
					url: s.url,
				};
			} ) }
			title={ translate( 'Popular sites' ) }
		/>
	);
}

export default ReaderStreamSidebar;
