import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import { fixMe, translate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import ResurrectedWelcomeModalGate from 'calypso/components/resurrected-welcome-modal';
import DiscoverNewBlogs from 'calypso/reader/new-blogs';
import { useOonRecs } from 'calypso/reader/new-blogs/use-oon-recs';
import ReaderOnboardingGate from 'calypso/reader/onboarding-rsm/gate';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream from 'calypso/reader/stream';
import { useDispatch } from 'calypso/state';
import { selectSidebarRecentSite } from 'calypso/state/reader-ui/sidebar/actions';
import Recent from '../recent';
import { useFollowingView } from './view-preference';
import ViewToggle from './view-toggle';
import { WriteButton } from './write-button';
import './style.scss';

const loadTrackResurrections = () =>
	import(
		/* webpackChunkName: "async-load-calypso-lib-analytics-track-resurrections" */ 'calypso/lib/analytics/track-resurrections'
	);

function FollowingStream( { ...props } ) {
	const { currentView } = useFollowingView();
	const dispatch = useDispatch();
	const [ isResurrectedModalVisible, setIsResurrectedModalVisible ] = useState( false );
	const [ shouldDelayReaderOnboarding, setShouldDelayReaderOnboarding ] = useState( false );
	const [ readerOnboardingShouldShow, setReaderOnboardingShouldShow ] = useState( false );

	const handleReaderOnboardingRender = useCallback(
		( willRender: boolean ) => {
			setReaderOnboardingShouldShow( willRender );
			if ( willRender && isResurrectedModalVisible ) {
				setShouldDelayReaderOnboarding( true );
			}
			if ( ! willRender ) {
				setShouldDelayReaderOnboarding( false );
			}
		},
		[ isResurrectedModalVisible ]
	);

	useEffect( () => {
		if ( shouldDelayReaderOnboarding && ! isResurrectedModalVisible ) {
			setShouldDelayReaderOnboarding( false );
		}
	}, [ shouldDelayReaderOnboarding, isResurrectedModalVisible ] );

	const suppressReaderOnboarding =
		readerOnboardingShouldShow && ( isResurrectedModalVisible || shouldDelayReaderOnboarding );

	// "Discover new blogs" (READ-542): one bounded block in the Recent feed,
	// in the third spot (after two recent posts), per the READ-542 thread. Only
	// on the "all subscriptions" feed, never on a single site's feed, and not
	// mounted at all for cold-start users or once the user hides it.
	const { recs, isColdStart, isHidden, dismissBlog, hide } = useOonRecs();
	const showNewBlogs =
		isEnabled( 'reader/discover-new-blogs' ) &&
		! props.feedId &&
		! isColdStart &&
		! isHidden &&
		recs.length > 0;
	// Memoised so the stream only rebuilds its item list when the recs change.
	const newBlogsBlock = useMemo(
		() =>
			showNewBlogs ? (
				<DiscoverNewBlogs recs={ recs } dismissBlog={ dismissBlog } hide={ hide } />
			) : null,
		[ showNewBlogs, recs, dismissBlog, hide ]
	);

	// Set the selected feed based on route param.
	useEffect( () => {
		// Note that 'null' specifically sets the all view.
		dispatch( selectSidebarRecentSite( { feedId: Number( props.feedId ) || null } ) );
	}, [ props.feedId, dispatch ] );

	return (
		<>
			{ currentView === 'recent' ? (
				<Recent
					viewToggle={
						<>
							<ViewToggle />
							<WriteButton />
						</>
					}
				/>
			) : (
				<ReaderStream
					{ ...props }
					className="following"
					inStreamBlock={ newBlogsBlock }
					inStreamBlockPosition={ 2 }
				>
					<BloganuaryHeader />
					<NavigationHeader
						title={ translate( 'Recent' ) }
						subtitle={ fixMe( {
							text: 'Latest from your subscriptions.',
							newCopy: translate( 'Latest from your subscriptions.' ),
							oldCopy: translate( 'Fresh content from blogs you follow.' ),
						} ) }
						className={ clsx( 'following-stream-header' ) }
					>
						<ViewToggle />
						<WriteButton />
					</NavigationHeader>
					<ReaderOnboardingGate
						onRender={ handleReaderOnboardingRender }
						isSuppressed={ suppressReaderOnboarding }
					/>
				</ReaderStream>
			) }
			<ResurrectedWelcomeModalGate onVisibilityChange={ setIsResurrectedModalVisible } />
			<AsyncLoad require={ loadTrackResurrections } placeholder={ null } />
		</>
	);
}

export default SuggestionProvider( FollowingStream );
