import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderOnboarding from 'calypso/reader/onboarding';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';
import Recent from '../recent';
import { useFollowingView } from './view-preference';
import ViewToggle from './view-toggle';
import './style.scss';

function FollowingStream( { ...props } ) {
	const { currentView } = useFollowingView();
	const { data: subscriptionsCount, isLoading: isLoadingCount } =
		SubscriptionManager.useSubscriptionsCountQuery();
	const { data: siteSubscriptions, isLoading: isLoadingSiteSubscriptions } =
		SubscriptionManager.useSiteSubscriptionsQuery();

	const isLoading = isLoadingCount || isLoadingSiteSubscriptions;

	const hasNonSelfSubscriptions = useMemo( () => {
		if ( ! subscriptionsCount?.blogs || subscriptionsCount?.blogs === 0 ) {
			return false;
		}

		// If we have site subscriptions data, filter out self-owned blogs.
		if ( siteSubscriptions?.subscriptions ) {
			const nonSelfSubscriptions = siteSubscriptions.subscriptions.filter(
				( sub ) => ! sub.is_owner
			);
			return nonSelfSubscriptions.length > 0;
		}

		return subscriptionsCount.blogs > 0;
	}, [ subscriptionsCount, siteSubscriptions ] );

	const viewToggle = config.isEnabled( 'reader/recent-feed-overhaul' ) ? <ViewToggle /> : null;

	if ( ! isLoading && ! hasNonSelfSubscriptions ) {
		return (
			<div className="following-stream--no-subscriptions">
				<NavigationHeader title={ translate( 'Recent' ) } />
				<p>
					{ translate(
						'{{strong}}Welcome!{{/strong}} Follow your favorite sites and their latest posts will appear here. Read, like, and comment in a distraction-free environment. Get started by selecting your interests below:',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
				<ReaderOnboarding forceShow />
			</div>
		);
	}

	return (
		<>
			{ currentView === 'recent' && config.isEnabled( 'reader/recent-feed-overhaul' ) ? (
				<Recent viewToggle={ viewToggle } />
			) : (
				<ReaderStream
					{ ...props }
					className="following"
					streamSidebar={ () => <ReaderListFollowedSites path={ window.location.pathname } /> }
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

export default SuggestionProvider( withDimensions( FollowingStream ) );
