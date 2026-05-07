import { isDefaultLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { fixMe, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { shallowEqual } from 'react-redux';
import { UnknownAction } from 'redux';
import ScrollTracker from 'calypso/blocks/reader-full-post/scroll-tracker';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import ListEnd from 'calypso/components/list-end';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import FollowingEmptyContent from 'calypso/reader/stream/empty';
import { useDispatch, useSelector } from 'calypso/state';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { clearStream, requestPage } from 'calypso/state/reader/streams/actions';
import { getStream, getTransformedStreamItems } from 'calypso/state/reader/streams/selectors';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { FullFeedPost } from './full-feed-post';
import './full-feed.scss';
import type { ReaderFullFeedPost } from './full-feed-post';
import type { AppState } from 'calypso/types';

interface FullFeedProps {
	recsStreamKey?: string;
	startDate?: string | null;
	streamKey?: string;
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

function findScrollableContainer( node: HTMLElement | null ): HTMLElement | null {
	let element = node;

	while ( element && element !== document.body ) {
		const style = window.getComputedStyle( element );
		const overflowY = style.overflowY || style.overflow;
		const isScrollable = element.scrollHeight > element.clientHeight;

		if ( isScrollable && [ 'auto', 'scroll' ].includes( overflowY ) ) {
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
	viewToggle,
}: FullFeedProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const recordReaderTracksEventRef = useRef( recordReaderTracksEvent );
	const readerMainRef = useRef< HTMLDivElement | null >( null );
	const nextPageObserverRef = useRef< IntersectionObserver | null >( null );
	const selectedFeedIdRef = useRef< number | null | undefined >( undefined );
	const selectedFeedId = useSelector< AppState, number | null >( getSelectedRecentFeedId );
	let localeSlug = useSelector< AppState, string | null >( getCurrentLocaleSlug );

	if ( localeSlug && isDefaultLocale( localeSlug ) ) {
		localeSlug = null;
	}

	const streamKey = getFollowingStreamKey( selectedFeedId, baseStreamKey );
	const stream = useSelector(
		( state: AppState ) => getStream( state, streamKey ) as FullFeedStreamState
	);
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
		recordReaderTracksEvent( 'calypso_reader_full_feed_viewed', {
			feed_id: selectedFeedId ?? undefined,
			is_filtered_feed: Boolean( selectedFeedId ),
			stream_key: streamKey,
		} );
	}, [ recordReaderTracksEvent, selectedFeedId, streamKey ] );

	useEffect( () => {
		const scrollTracker = new ScrollTracker();
		const scrollableContainer = findScrollableContainer( readerMainRef.current );
		let maxWindowScrollDepth = 0;
		const updateWindowScrollDepth = () => {
			maxWindowScrollDepth = Math.max( maxWindowScrollDepth, getWindowScrollDepth() );
		};

		if ( scrollableContainer ) {
			scrollTracker.setContainer( scrollableContainer );
		} else {
			updateWindowScrollDepth();
			window.addEventListener( 'scroll', updateWindowScrollDepth );
		}

		return () => {
			recordReaderTracksEventRef.current( 'calypso_reader_full_feed_scroll_depth', {
				feed_id: selectedFeedId ?? undefined,
				scroll_depth: scrollableContainer
					? scrollTracker.getMaxScrollDepthAsPercentage()
					: Math.round( maxWindowScrollDepth * 100 ),
				stream_key: streamKey,
			} );
			window.removeEventListener( 'scroll', updateWindowScrollDepth );
			scrollTracker.cleanup();
		};
	}, [ selectedFeedId, streamKey ] );

	const getPageHandle = useCallback(
		( pageHandle: unknown ) => {
			if ( pageHandle ) {
				return pageHandle;
			}

			return startDate ? { before: startDate } : null;
		},
		[ startDate ]
	);

	const fetchNextPage = useCallback( () => {
		if ( stream.isRequesting || stream.lastPage ) {
			return;
		}

		dispatch(
			requestPage( {
				feedId: selectedFeedId,
				streamKey,
				pageHandle: getPageHandle( stream.pageHandle ),
				localeSlug,
			} ) as UnknownAction
		);
	}, [
		dispatch,
		getPageHandle,
		localeSlug,
		selectedFeedId,
		stream.isRequesting,
		stream.lastPage,
		stream.pageHandle,
		streamKey,
	] );

	const fetchFirstPage = useCallback( () => {
		dispatch(
			requestPage( {
				feedId: selectedFeedId,
				streamKey,
				pageHandle: null,
				localeSlug,
			} ) as UnknownAction
		);
	}, [ dispatch, localeSlug, selectedFeedId, streamKey ] );

	useEffect( () => {
		dispatch( viewStream( streamKey, window.location.pathname ) as UnknownAction );
	}, [ dispatch, streamKey ] );

	useEffect( () => {
		if ( selectedFeedIdRef.current === undefined ) {
			selectedFeedIdRef.current = selectedFeedId;
		} else if ( selectedFeedIdRef.current !== selectedFeedId ) {
			selectedFeedIdRef.current = selectedFeedId;
			findScrollableContainer( readerMainRef.current )?.scrollTo( 0, 0 );
			window.scrollTo( 0, 0 );
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
						fetchNextPage();
					}
				},
				{ rootMargin: '600px 0px' }
			);
			nextPageObserverRef.current.observe( node );
		},
		[ fetchNextPage, stream.isRequesting, stream.lastPage ]
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
				{ postRecords.map( ( { key, post } ) => (
					<FullFeedPost key={ key } post={ post } />
				) ) }
				{ stream.isRequesting && (
					<div className="full-feed__loading" role="status">
						{ translate( 'Loading posts…' ) }
					</div>
				) }
				{ hasNoPosts && <FollowingEmptyContent view="full-feed" /> }
				{ stream.error && (
					<div className="full-feed__error" role="alert">
						<p>{ translate( 'Sorry, we had a problem loading posts.' ) }</p>
						<Button variant="secondary" onClick={ fetchNextPage }>
							{ translate( 'Try again' ) }
						</Button>
					</div>
				) }
				{ ! stream.lastPage && hasLoadedPosts && (
					<div className="full-feed__pagination" ref={ paginationRef }>
						<Button variant="secondary" onClick={ fetchNextPage } disabled={ stream.isRequesting }>
							{ translate( 'Load more' ) }
						</Button>
					</div>
				) }
				{ stream.lastPage && postRecords.length > 0 && <ListEnd /> }
			</div>
		</ReaderMain>
	);
}
