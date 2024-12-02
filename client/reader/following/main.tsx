import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderOnboarding from 'calypso/reader/onboarding';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import { RecommendedSite } from 'calypso/state/data-layer/wpcom/read/recommendations/sites';
import {
	RecommendedSitesRequestAction,
	requestRecommendedSites,
} from 'calypso/state/reader/recommended-sites/actions';
import { getReaderRecommendedSites } from 'calypso/state/reader/recommended-sites/selectors';
import { READER_RECENT_SIDEBAR_POPULAR_SITES } from '../follow-sources';
import Recent from '../recent';
import ReaderPopularSitesSidebar from '../stream/reader-popular-sites-sidebar';
import { useFollowingView } from './view-preference';
import ViewToggle from './view-toggle';
import './style.scss';

export const RECOMMENDED_SITES_SEED = Math.floor( Math.random() * 10001 );

function FollowingStream( { ...props } ) {
	const { currentView } = useFollowingView();
	const viewToggle = config.isEnabled( 'reader/recent-feed-overhaul' ) ? <ViewToggle /> : null;

	return (
		<>
			{ currentView === 'recent' && config.isEnabled( 'reader/recent-feed-overhaul' ) ? (
				<Recent viewToggle={ viewToggle } />
			) : (
				<ReaderStream
					{ ...props }
					className="following"
					streamSidebar={ () => <ReaderStreamSidebar /> }
				>
					<BloganuaryHeader />
					<NavigationHeader
						title={ translate( 'Recent' ) }
						subtitle={ translate( "Stay current with the blogs you've subscribed to." ) }
						className={ clsx( 'following-stream-header', {
							'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
						} ) }
					>
						{ viewToggle }
					</NavigationHeader>
					<ReaderOnboarding />
				</ReaderStream>
			) }
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
}

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
					feed_URL: s.feed_url,
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

export default SuggestionProvider( withDimensions( FollowingStream ) );
