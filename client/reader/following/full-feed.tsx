import { isDefaultLocale } from '@automattic/i18n-utils';
import { fixMe, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReaderFullPostContentPlaceholder from 'calypso/blocks/reader-full-post/placeholders/content';
import ScrollTracker from 'calypso/blocks/reader-full-post/scroll-tracker';
import PostBlocked from 'calypso/blocks/reader-post-card/blocked';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import ListEnd from 'calypso/components/list-end';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useCachedPosts } from 'calypso/reader/data/post-cache';
import { ReaderPerformanceTrackerStop } from 'calypso/reader/reader-performance-tracker';
import FollowingEmptyContent from 'calypso/reader/stream/empty';
import PostUnavailable from 'calypso/reader/stream/post-unavailable';
import { useStreamPosts, type PostKey } from 'calypso/reader/stream/use-stream-posts';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { FullFeedPost } from './full-feed-post';
import type { ReaderFullFeedPost } from './full-feed-post';
import type { AppState } from 'calypso/types';

import './full-feed.scss';

interface FullFeedProps {
	recsStreamKey?: string;
	showSiteNameOnCards?: boolean;
	startDate?: string | null;
	streamKey?: string;
	trackScrollPage?: ( pageNumber: number ) => void;
	viewToggle?: React.ReactNode;
}

const pagesByKey = new Map< string, number >();

function getFollowingStreamKey( selectedFeedId: number | null, streamKey = 'following' ) {
	if ( streamKey === 'following' && selectedFeedId ) {
		return `following:feed-${ selectedFeedId }`;
	}

	return streamKey;
}

function isPostStreamItem( item: PostKey ) {
	return (
		item &&
		! item.isGap &&
		! item.isPromptBlock &&
		! item.isRecommendationBlock &&
		! item.isSynthetic &&
		!! item.postId &&
		!! ( item.feedId || item.blogId )
	);
}

function getFullFeedPostKey( post: ReaderFullFeedPost ) {
	if ( post.global_ID ) {
		return post.global_ID;
	}

	return `${ post.feed_ID || post.site_ID }-${ post.feed_item_ID || post.ID }`;
}

function findScrollableContainer( node: HTMLElement | null ): HTMLElement | null {
	let element = node;

	while ( element && element !== document.body ) {
		const style = window.getComputedStyle( element );
		const overflowY = style.overflowY || style.overflow;

		if ( [ 'auto', 'scroll' ].includes( overflowY ) ) {
			return element;
		}

		element = element.parentElement;
	}

	return null;
}

function getWindowScrollDepth() {
	const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
	const scrollHeight = Math.max(
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		document.body.offsetHeight,
		document.documentElement.offsetHeight
	);
	const clientHeight = window.innerHeight || document.documentElement.clientHeight || 0;
	const denominator = scrollHeight - clientHeight;

	return denominator <= 0 ? 0 : Math.min( 1, Math.max( 0, scrollTop / denominator ) );
}

export function FullFeed( {
	showSiteNameOnCards = true,
	startDate = null,
	streamKey: baseStreamKey = 'following',
	trackScrollPage,
	viewToggle,
}: FullFeedProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const recordReaderTracksEventRef = useRef( recordReaderTracksEvent );
	const readerMainRef = useRef< HTMLDivElement | null >( null );
	const nextPageObserverRef = useRef< IntersectionObserver | null >( null );
	const inFlightPageRequestRef = useRef< string | null >( null );
	const selectedFeedIdRef = useRef< number | null | undefined >( undefined );
	const scrollDepthTrackerRef = useRef< ScrollTracker | null >( null );
	const scrollDepthScrollContainerRef = useRef< HTMLElement | null >( null );
	const maxWindowScrollDepthRef = useRef( 0 );
	const [ scrollContainer, setScrollContainer ] = useState< HTMLElement | null >( null );
	const [ activeFloatingCollapsePostKey, setActiveFloatingCollapsePostKey ] = useState<
		string | null
	>( null );
	const selectedFeedId = useSelector< AppState, number | null >( getSelectedRecentFeedId );
	let localeSlug = useSelector< AppState, string | null >( getCurrentLocaleSlug );

	if ( localeSlug && isDefaultLocale( localeSlug ) ) {
		localeSlug = null;
	}

	const streamKey = getFollowingStreamKey( selectedFeedId, baseStreamKey );
	const streamPostsQuery = useStreamPosts( {
		streamKey,
		feedId: selectedFeedId,
		localeSlug,
		startDate,
	} );
	const stream = useMemo(
		() => ( {
			error: streamPostsQuery.error,
			isRequesting:
				streamPostsQuery.isLoading ||
				streamPostsQuery.isFetchingNextPage ||
				streamPostsQuery.isRefetching,
			items: streamPostsQuery.items,
			lastPage: streamPostsQuery.lastPage,
		} ),
		[
			streamPostsQuery.error,
			streamPostsQuery.isFetchingNextPage,
			streamPostsQuery.isLoading,
			streamPostsQuery.isRefetching,
			streamPostsQuery.items,
			streamPostsQuery.lastPage,
		]
	);
	const blockedSites = useSelector< AppState, number[] >( getBlockedSites );
	const postKeys = useMemo( () => stream.items.filter( isPostStreamItem ), [ stream.items ] );
	const cachedPosts = useCachedPosts( postKeys );
	const posts = useMemo(
		() => cachedPosts.filter( Boolean ) as ReaderFullFeedPost[],
		[ cachedPosts ]
	);

	const postRecords = useMemo(
		() =>
			posts.map( ( post ) => ( {
				key: getFullFeedPostKey( post ),
				post,
			} ) ),
		[ posts ]
	);

	useEffect( () => {
		recordReaderTracksEventRef.current = recordReaderTracksEvent;
	}, [ recordReaderTracksEvent ] );

	useEffect( () => {
		recordReaderTracksEventRef.current( 'calypso_reader_full_feed_viewed', {
			feed_id: selectedFeedId ?? undefined,
			is_filtered_feed: selectedFeedId ? 1 : 0,
			stream_key: streamKey,
		} );
	}, [ selectedFeedId, streamKey ] );

	useEffect( () => {
		const nextScrollContainer = findScrollableContainer( readerMainRef.current );
		setScrollContainer( nextScrollContainer );
	}, [ postRecords.length, streamKey ] );

	useEffect( () => {
		if ( ! stream.isRequesting || stream.error ) {
			inFlightPageRequestRef.current = null;
		}
	}, [ stream.error, stream.isRequesting, streamKey ] );

	const lastReportedErrorRef = useRef< unknown >( null );
	useEffect( () => {
		if ( stream.error && lastReportedErrorRef.current !== stream.error ) {
			lastReportedErrorRef.current = stream.error;
			dispatch(
				errorNotice( translate( 'Sorry, we had a problem loading posts.' ), {
					duration: 5000,
				} )
			);
		} else if ( ! stream.error ) {
			lastReportedErrorRef.current = null;
		}
	}, [ dispatch, stream.error, translate ] );

	useEffect( () => {
		const scrollTracker = new ScrollTracker();
		scrollDepthTrackerRef.current = scrollTracker;
		maxWindowScrollDepthRef.current = 0;

		const updateWindowScrollDepth = () => {
			maxWindowScrollDepthRef.current = Math.max(
				maxWindowScrollDepthRef.current,
				getWindowScrollDepth()
			);
		};

		updateWindowScrollDepth();
		window.addEventListener( 'scroll', updateWindowScrollDepth );

		if ( scrollDepthScrollContainerRef.current ) {
			scrollTracker.setContainer( scrollDepthScrollContainerRef.current );
		}

		return () => {
			const currentScrollContainer = scrollDepthScrollContainerRef.current;

			recordReaderTracksEventRef.current( 'calypso_reader_full_feed_scroll_depth', {
				feed_id: selectedFeedId ?? undefined,
				scroll_depth: currentScrollContainer
					? scrollTracker.getMaxScrollDepthAsPercentage()
					: Math.round( maxWindowScrollDepthRef.current * 100 ),
				stream_key: streamKey,
			} );
			window.removeEventListener( 'scroll', updateWindowScrollDepth );
			scrollTracker.cleanup();
			scrollDepthTrackerRef.current = null;
		};
	}, [ selectedFeedId, streamKey ] );

	useEffect( () => {
		scrollDepthScrollContainerRef.current = scrollContainer;
		scrollDepthTrackerRef.current?.setContainer( scrollContainer );
	}, [ scrollContainer ] );

	const fetchNextPage = useCallback(
		( options: { force?: boolean; triggeredByScroll?: boolean } = {} ) => {
			if ( ( ! options.force && stream.isRequesting ) || stream.lastPage ) {
				return;
			}

			const requestKey = `${ streamKey }:${ selectedFeedId ?? 'all' }`;
			if ( ! options.force && inFlightPageRequestRef.current === requestKey ) {
				return;
			}

			inFlightPageRequestRef.current = requestKey;

			if ( options.triggeredByScroll && trackScrollPage ) {
				const pageNumber = pagesByKey.get( streamKey ) || 0;
				pagesByKey.set( streamKey, pageNumber + 1 );
				trackScrollPage( pageNumber );
			}

			streamPostsQuery.fetchNextPage();
		},
		[
			selectedFeedId,
			streamPostsQuery,
			stream.isRequesting,
			stream.lastPage,
			streamKey,
			trackScrollPage,
		]
	);

	useEffect( () => {
		dispatch( viewStream( streamKey, window.location.pathname ) );
	}, [ dispatch, streamKey ] );

	useEffect( () => {
		if ( selectedFeedIdRef.current === undefined ) {
			selectedFeedIdRef.current = selectedFeedId;
		} else if ( selectedFeedIdRef.current !== selectedFeedId ) {
			selectedFeedIdRef.current = selectedFeedId;
			( scrollContainer ?? findScrollableContainer( readerMainRef.current ) )?.scrollTo( 0, 0 );
			window.scrollTo( 0, 0 );
			inFlightPageRequestRef.current = null;
			setActiveFloatingCollapsePostKey( null );
		}
	}, [ selectedFeedId, scrollContainer ] );

	const paginationRef = useCallback(
		( node: HTMLDivElement | null ) => {
			nextPageObserverRef.current?.disconnect();

			if (
				! node ||
				stream.isRequesting ||
				stream.lastPage ||
				typeof IntersectionObserver === 'undefined'
			) {
				return;
			}

			nextPageObserverRef.current = new IntersectionObserver(
				( entries ) => {
					const [ entry ] = entries;
					if ( entry?.isIntersecting ) {
						nextPageObserverRef.current?.disconnect();
						fetchNextPage( { triggeredByScroll: true } );
					}
				},
				{ root: scrollContainer, rootMargin: '600px 0px' }
			);
			nextPageObserverRef.current.observe( node );
		},
		[ fetchNextPage, scrollContainer, stream.isRequesting, stream.lastPage ]
	);

	useEffect( () => {
		return () => nextPageObserverRef.current?.disconnect();
	}, [] );

	const headerSubtitle = useMemo(
		() =>
			fixMe( {
				text: 'Full posts from your subscriptions.',
				newCopy: translate( 'Full posts from your subscriptions.' ),
				oldCopy: translate( 'Latest posts from blogs you follow.' ),
			} ),
		[ translate ]
	);

	const hasLoadedPosts = postRecords.length > 0;
	const hasNoPosts = ! stream.isRequesting && ! hasLoadedPosts && ! stream.error;
	const handleFloatingCollapseChange = useCallback( ( postKey: string, isVisible: boolean ) => {
		setActiveFloatingCollapsePostKey( ( currentPostKey ) => {
			if ( isVisible ) {
				return postKey;
			}

			return currentPostKey === postKey ? null : currentPostKey;
		} );
	}, [] );
	const renderPost = useCallback(
		( { key, post }: { key: string; post: ReaderFullFeedPost } ) => {
			if ( post.is_error ) {
				return <PostUnavailable key={ key } post={ post } />;
			}

			if (
				( ! post.is_external || post.is_jetpack ) &&
				post.site_ID &&
				blockedSites.includes( +post.site_ID )
			) {
				return <PostBlocked key={ key } post={ post } />;
			}

			return (
				<FullFeedPost
					key={ key }
					activeFloatingCollapsePostKey={ activeFloatingCollapsePostKey }
					onFloatingCollapseChange={ handleFloatingCollapseChange }
					post={ post }
					scrollContainer={ scrollContainer }
					showSiteName={ showSiteNameOnCards }
				/>
			);
		},
		[
			activeFloatingCollapsePostKey,
			blockedSites,
			handleFloatingCollapseChange,
			scrollContainer,
			showSiteNameOnCards,
		]
	);

	return (
		<ReaderMain className="following full-feed" forwardRef={ readerMainRef }>
			<BloganuaryHeader />
			<NavigationHeader
				title={ translate( 'Full feed' ) }
				subtitle={ headerSubtitle }
				className="following-stream-header full-feed__header"
			>
				<div className="full-feed__header-actions">{ viewToggle }</div>
			</NavigationHeader>

			<div className="full-feed__content reader__content">
				{ postRecords.map( renderPost ) }
				{ stream.isRequesting && (
					<div
						className="full-feed__loading"
						role="status"
						aria-label={ translate( 'Loading posts' ) }
					>
						<ReaderFullPostContentPlaceholder />
					</div>
				) }
				{ hasNoPosts && <FollowingEmptyContent view="full-feed" /> }
				{ ! stream.lastPage && hasLoadedPosts && (
					<div className="full-feed__pagination" ref={ paginationRef } aria-hidden="true" />
				) }
				{ stream.lastPage && postRecords.length > 0 && <ListEnd /> }
				{ ( hasLoadedPosts || hasNoPosts || Boolean( stream.error ) ) && (
					<ReaderPerformanceTrackerStop />
				) }
			</div>
		</ReaderMain>
	);
}
