import { isDefaultLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { fixMe, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { UnknownAction } from 'redux';
import ScrollTracker from 'calypso/blocks/reader-full-post/scroll-tracker';
import PostBlocked from 'calypso/blocks/reader-post-card/blocked';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import ListEnd from 'calypso/components/list-end';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ReaderPerformanceTrackerStop } from 'calypso/reader/reader-performance-tracker';
import FollowingEmptyContent from 'calypso/reader/stream/empty';
import PostUnavailable from 'calypso/reader/stream/post-unavailable';
import { useDispatch, useSelector } from 'calypso/state';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { clearStream, requestPage } from 'calypso/state/reader/streams/actions';
import { getStream, getTransformedStreamItems } from 'calypso/state/reader/streams/selectors';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { FullFeedPost } from './full-feed-post';
import type { ReaderFullFeedPost } from './full-feed-post';
import type { AppState } from 'calypso/types';

import './full-feed.scss';

interface FullFeedProps {
	recsStreamKey?: string;
	startDate?: string | null;
	streamKey?: string;
	trackScrollPage?: ( pageNumber: number ) => void;
	viewToggle?: React.ReactNode;
}

interface ReaderStreamItem {
	blogId?: number;
	feedId?: number;
	isGap?: boolean;
	isPromptBlock?: boolean;
	isRecommendationBlock?: boolean;
	isSynthetic?: boolean;
	postId?: number;
}

interface FullFeedStreamState {
	error?: unknown;
	isRequesting: boolean;
	items: ReaderStreamItem[];
	lastPage: boolean;
	pageHandle?: unknown;
}

const pagesByKey = new Map< string, number >();

function getFollowingStreamKey( selectedFeedId: number | null, streamKey = 'following' ) {
	if ( streamKey === 'following' && selectedFeedId ) {
		return `following:feed-${ selectedFeedId }`;
	}

	return streamKey;
}

function isPostStreamItem( item: ReaderStreamItem ) {
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

function getPageHandleKey( pageHandle: unknown ) {
	if ( ! pageHandle ) {
		return 'first-page';
	}

	try {
		return JSON.stringify( pageHandle );
	} catch {
		return String( pageHandle );
	}
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
	recsStreamKey = '',
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
	const stream = useSelector(
		( state: AppState ) => getStream( state, streamKey ) as FullFeedStreamState
	);
	const blockedSites = useSelector< AppState, number[] >( getBlockedSites );
	const posts = useSelector( ( state: AppState ) => {
		const items = getTransformedStreamItems( state, {
			streamKey,
			recsStreamKey,
		} ) as ReaderStreamItem[];

		return items
			.filter( isPostStreamItem )
			.map( ( item ) => getPostByKey( state, item ) )
			.filter( Boolean ) as ReaderFullFeedPost[];
	}, shallowEqual );

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
			is_filtered_feed: Boolean( selectedFeedId ),
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
	}, [ stream.error, stream.isRequesting, stream.pageHandle, streamKey ] );

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

	const getPageHandle = useCallback(
		( pageHandle: unknown ) => {
			if ( pageHandle ) {
				return pageHandle;
			}

			return startDate ? { before: startDate } : null;
		},
		[ startDate ]
	);

	const fetchNextPage = useCallback(
		( options: { force?: boolean; triggeredByScroll?: boolean } = {} ) => {
			if ( ( ! options.force && stream.isRequesting ) || stream.lastPage ) {
				return;
			}

			const pageHandle = getPageHandle( stream.pageHandle );
			const requestKey = `${ streamKey }:${ selectedFeedId ?? 'all' }:${ getPageHandleKey(
				pageHandle
			) }`;

			if ( ! options.force && inFlightPageRequestRef.current === requestKey ) {
				return;
			}

			inFlightPageRequestRef.current = requestKey;

			if ( options.triggeredByScroll && trackScrollPage ) {
				const pageNumber = pagesByKey.get( streamKey ) || 0;
				pagesByKey.set( streamKey, pageNumber + 1 );
				trackScrollPage( pageNumber );
			}

			dispatch(
				requestPage( {
					feedId: selectedFeedId,
					streamKey,
					pageHandle,
					localeSlug,
				} ) as UnknownAction
			);
		},
		[
			dispatch,
			getPageHandle,
			localeSlug,
			selectedFeedId,
			stream.isRequesting,
			stream.lastPage,
			stream.pageHandle,
			streamKey,
			trackScrollPage,
		]
	);

	const fetchFirstPage = useCallback( () => {
		dispatch(
			requestPage( {
				feedId: selectedFeedId,
				streamKey,
				pageHandle: getPageHandle( null ),
				localeSlug,
			} ) as UnknownAction
		);
	}, [ dispatch, getPageHandle, localeSlug, selectedFeedId, streamKey ] );

	useEffect( () => {
		dispatch( viewStream( streamKey, window.location.pathname ) as UnknownAction );
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
			dispatch( clearStream( { streamKey } ) as UnknownAction );
			fetchFirstPage();
			return;
		}

		if ( ! stream.items.length && ! stream.isRequesting && ! stream.lastPage && ! stream.error ) {
			fetchNextPage();
		}
	}, [
		dispatch,
		fetchFirstPage,
		fetchNextPage,
		selectedFeedId,
		scrollContainer,
		stream.error,
		stream.isRequesting,
		stream.items.length,
		stream.lastPage,
		streamKey,
	] );

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
				/>
			);
		},
		[ activeFloatingCollapsePostKey, blockedSites, handleFloatingCollapseChange, scrollContainer ]
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

			<div className="full-feed__content">
				{ postRecords.map( renderPost ) }
				{ stream.isRequesting && (
					<div className="full-feed__loading" role="status">
						{ translate( 'Loading posts…' ) }
					</div>
				) }
				{ hasNoPosts && <FollowingEmptyContent view="full-feed" /> }
				{ stream.error && (
					<div className="full-feed__error" role="alert">
						<p>{ translate( 'Sorry, we had a problem loading posts.' ) }</p>
						<Button variant="secondary" onClick={ () => fetchNextPage( { force: true } ) }>
							{ translate( 'Try again' ) }
						</Button>
					</div>
				) }
				{ ! stream.lastPage && hasLoadedPosts && (
					<div className="full-feed__pagination" ref={ paginationRef }>
						<Button
							variant="secondary"
							onClick={ () => fetchNextPage() }
							disabled={ stream.isRequesting }
						>
							{ translate( 'Load more' ) }
						</Button>
					</div>
				) }
				{ stream.lastPage && postRecords.length > 0 && <ListEnd /> }
				{ ( hasLoadedPosts || hasNoPosts || Boolean( stream.error ) ) && (
					<ReaderPerformanceTrackerStop />
				) }
			</div>
		</ReaderMain>
	);
}
