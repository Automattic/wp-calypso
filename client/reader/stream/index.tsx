import { Gridicon } from '@automattic/components';
import { isDefaultLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import ReactDom from 'react-dom';
import AppPromo from 'calypso/blocks/app-promo';
import InfiniteList from 'calypso/components/infinite-list';
import ListEnd from 'calypso/components/list-end';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import scrollTo from 'calypso/lib/scroll-to';
import ReaderMain from 'calypso/reader/components/reader-main';
import { isLikeable } from 'calypso/reader/post/capabilities';
import { keysAreEqual, keyToString } from 'calypso/reader/post-key';
import { MAX_POSTS_FOR_LOGGED_OUT_USERS } from 'calypso/reader/reader.const';
import ReaderStreamLoginPrompt from 'calypso/reader/stream/login-prompt';
import PostLifecycle from 'calypso/reader/stream/post-lifecycle';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import { showSelectedPost as showSelectedPostUtil, getStreamType } from 'calypso/reader/utils';
import XPostHelper from 'calypso/reader/xpost-helper';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { like as likePost, unlike as unlikePost } from 'calypso/state/posts/likes/actions';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { INITIAL_FETCH, PER_FETCH } from 'calypso/state/reader/streams/normalize';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { resetCardExpansions } from 'calypso/state/reader-ui/card-expansions/actions';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { ReaderPerformanceTrackerStop } from '../reader-performance-tracker';
import EmptyContent from './empty';
import { StreamError } from './error';
import { useStreamPendingPosts } from './use-stream-pending-posts';
import { useStreamPostKeySelection } from './use-stream-post-key-selection';
import { useStreamPosts, type PostKey } from './use-stream-posts';

import './style.scss';
import 'calypso/reader/update-notice/style.scss';

const GUESSED_POST_HEIGHT = 600;

// Two-column layout breakpoint: 950px content + 64*2 padding + 8*2 margin.
export const WIDE_DISPLAY_CUTOFF = 950 + 64 * 2 + 8 * 2;

const NO_POLL_STREAM_TYPES = new Set( [ 'search', 'custom_recs_posts_with_images', 'discover' ] );
const inputTags = [ 'INPUT', 'SELECT', 'TEXTAREA' ];

// Tracks how many "scroll loads" each stream has triggered, to feed into
// `trackScrollPage`. Module-level so it survives unmounts (matching the
// legacy Stream implementation pattern).
const pagesByKey = new Map< string, number >();

// Effective stream key for the Following stream when a sub-feed is selected
// in the recent sidebar — mirrors the legacy `getStreamKey` helper so the
// React Query cache, polling, and selection state all share one key.
function deriveStreamKey( streamKey: string, selectedFeedId: number | null ): string {
	if ( streamKey === 'following' && selectedFeedId ) {
		return `following:feed-${ selectedFeedId }`;
	}
	return streamKey;
}

function findScrollContainer( element: Element | null ): Element | false {
	if ( ! element || element.ownerDocument === element.parentNode ) {
		return false;
	}
	const { overflowY } = getComputedStyle( element );
	if ( /(auto|scroll)/.test( overflowY ) ) {
		return element;
	}
	return findScrollContainer( element.parentElement );
}

function useViewportWidth(): number {
	const [ width, setWidth ] = useState( () =>
		typeof window === 'undefined' ? 0 : window.innerWidth
	);
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}
		let frame: number | null = null;
		const handle = () => {
			if ( frame !== null ) {
				return;
			}
			frame = window.requestAnimationFrame( () => {
				frame = null;
				setWidth( window.innerWidth );
			} );
		};
		window.addEventListener( 'resize', handle );
		return () => {
			window.removeEventListener( 'resize', handle );
			if ( frame !== null ) {
				window.cancelAnimationFrame( frame );
			}
		};
	}, [] );
	return width;
}

export interface StreamProps {
	streamKey: string;
	className?: string;
	listName?: string;
	isMain?: boolean;
	wideLayout?: boolean;
	useCompactCards?: boolean;
	suppressSiteNameLink?: boolean;
	showFollowButton?: boolean;
	showFollowInHeader?: boolean;
	showSiteNameOnCards?: boolean;
	isDiscoverStream?: boolean;
	hideDefaultEmptyContentIfMissing?: boolean;
	restoreScroll?: boolean;
	forcePlaceholders?: boolean;
	fixedHeaderHeight?: number;
	followSource?: string;
	startDate?: string;
	emptyContent?: () => React.ReactNode;
	intro?: () => React.ReactNode;
	streamHeader?: () => React.ReactNode;
	sidebarTabTitle?: string;
	streamSidebar?: ( isWideLayout: boolean ) => React.ReactNode;
	placeholderFactory?: ( args: { key: string } ) => React.ReactElement | null;
	transformStreamItems?: ( postKey: PostKey ) => PostKey;
	trackScrollPage: ( pageId: number ) => void;
	onUpdatesShown?: () => void;
	children?: React.ReactNode;
}

const defaultEmptyContent = () => <EmptyContent />;

export function Stream( props: StreamProps ) {
	const {
		streamKey: rawStreamKey,
		className = '',
		isMain = true,
		wideLayout = false,
		useCompactCards = false,
		suppressSiteNameLink = false,
		showFollowButton = true,
		showFollowInHeader = false,
		showSiteNameOnCards,
		isDiscoverStream = false,
		hideDefaultEmptyContentIfMissing,
		restoreScroll = true,
		forcePlaceholders = false,
		fixedHeaderHeight,
		followSource,
		startDate,
		emptyContent = defaultEmptyContent,
		intro,
		streamHeader,
		sidebarTabTitle,
		streamSidebar,
		placeholderFactory,
		transformStreamItems,
		trackScrollPage,
		onUpdatesShown,
		children,
	} = props;

	const dispatch = useDispatch();
	const translate = useTranslate();

	const rawLocale = useSelector( getCurrentLocaleSlug );
	const localeSlug = rawLocale && ! isDefaultLocale( rawLocale ) ? rawLocale : null;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const blockedSites = useSelector( getBlockedSites );
	const primarySiteId = useSelector( getPrimarySiteId );
	const notificationsOpen = useSelector( isNotificationsOpen );
	const selectedRecentFeedId = useSelector( getSelectedRecentFeedId );

	// Resolve the effective stream key (Following + selected sub-feed gets a
	// distinct key so the cache and selection state don't bleed across feeds).
	const streamKey = useMemo(
		() => deriveStreamKey( rawStreamKey, selectedRecentFeedId ?? null ),
		[ rawStreamKey, selectedRecentFeedId ]
	);
	const streamType = getStreamType( streamKey );

	// Width-measured wide-layout switch. The legacy stream used the wrapping
	// div's actual width via `withDimensions`; window width is a close proxy
	// since the stream takes the full viewport content area.
	const viewportWidth = useViewportWidth();
	const wideDisplay = viewportWidth > WIDE_DISPLAY_CUTOFF;

	const stream = useStreamPosts( {
		streamKey,
		feedId: selectedRecentFeedId ?? null,
		localeSlug,
		startDate: startDate ?? null,
		options: {
			enabled: ! forcePlaceholders,
		},
	} );
	const { items, isLoading, isFetching, lastPage, error, fetchNextPage } = stream;

	// Polling for new head-of-stream posts is opt-out by stream type and also
	// suppressed while the consumer is forcing skeletons (subscribe modal).
	const shouldPoll = ! NO_POLL_STREAM_TYPES.has( streamType ) && ! forcePlaceholders;
	const { pendingCount, consumePending } = useStreamPendingPosts( {
		streamKey,
		feedId: selectedRecentFeedId ?? null,
		localeSlug,
		startDate: startDate ?? null,
		shouldPoll,
		items,
	} );

	const selection = useStreamPostKeySelection( {
		streamKey,
		localeSlug,
		items,
	} );
	const {
		selectedPostKey: selected,
		selectPostKey: selectItem,
		selectNextPost: selectNext,
		selectPreviousPost: selectPrev,
	} = selection;

	const selectedPost = useSelector( ( state ) =>
		selected ? getPostByKey( state, selected ) : null
	);
	const likedPost = useSelector( ( state ) => {
		if ( ! selectedPost?.site_ID || ! selectedPost?.ID ) {
			return null;
		}
		return isLikedPost( state, selectedPost.site_ID, selectedPost.ID );
	} );

	// Login-prompt + scroll references.
	const [ listContext, setListContext ] = useState< Element | false | null >( null );
	const listRef = useRef< InfiniteList | null >( null );
	const overlayRef = useRef< HTMLDivElement | null >( null );
	const wasSelectedByOpeningPostRef = useRef( false );
	const [ selectedTab, setSelectedTab ] = useState< 'posts' | 'sites' >( 'posts' );

	const isLoginPromptVisible = useCallback(
		() => ! isLoggedIn && items.length > MAX_POSTS_FOR_LOGGED_OUT_USERS,
		[ isLoggedIn, items.length ]
	);

	// Match the legacy stream lifecycle: each route into a stream resets
	// expanded post cards and records a `viewStream` analytics action.
	useEffect( () => {
		dispatch( resetCardExpansions() );
		dispatch( viewStream( streamKey, window.location.pathname ) as never );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ streamKey ] );

	// Manual scroll restoration so the page returns to where the user left off
	// when navigating back, not the top. Restored on unmount so we don't leak
	// the manual mode into pages outside the Reader.
	const scrollToSelectedPost = useCallback(
		( animate: boolean ) => {
			const scrollContainer: Window | Element = listContext || window;
			const containerOffset =
				scrollContainer instanceof Element ? scrollContainer.getBoundingClientRect().top : 0;
			const headerOffset = -1 * ( fixedHeaderHeight || 0 );
			const totalOffset = headerOffset - containerOffset - 20;
			const root = overlayRef.current?.parentElement;
			const selectedNode = root?.querySelector( '.card.is-selected' ) as HTMLElement | null;
			if ( ! selectedNode ) {
				return;
			}
			selectedNode.focus();
			const startTop =
				scrollContainer instanceof Element ? scrollContainer.scrollTop : window.scrollY;
			const bounds = selectedNode.getBoundingClientRect();
			const scrollY = parseInt( String( startTop + bounds.top + totalOffset ), 10 );
			if ( animate ) {
				scrollTo( {
					x: 0,
					y: scrollY,
					duration: 200,
					container: scrollContainer === window ? undefined : ( scrollContainer as HTMLElement ),
				} );
			} else if ( scrollContainer === window ) {
				window.scrollTo( 0, scrollY );
			} else {
				( scrollContainer as Element ).scrollTo( 0, scrollY );
			}
		},
		[ listContext, fixedHeaderHeight ]
	);

	useEffect( () => {
		const handlePopstate = () => {
			if ( selected && window.history.scrollRestoration !== 'manual' && restoreScroll ) {
				scrollToSelectedPost( false );
			}
		};
		window.addEventListener( 'popstate', handlePopstate );
		let priorScrollRestoration: ScrollRestoration | undefined;
		if ( 'scrollRestoration' in window.history ) {
			priorScrollRestoration = window.history.scrollRestoration;
			window.history.scrollRestoration = 'manual';
		}
		return () => {
			window.removeEventListener( 'popstate', handlePopstate );
			if ( priorScrollRestoration && 'scrollRestoration' in window.history ) {
				window.history.scrollRestoration = priorScrollRestoration;
			}
		};
	}, [ selected, restoreScroll, scrollToSelectedPost ] );

	// Briefly mask the layout shift while we scroll-to and focus the
	// previously-selected post on initial mount. Matches the legacy 100ms
	// timer so users navigating back into a stream don't see the unselected
	// list pop in before the scroll lands on the selected card.
	useEffect( () => {
		const overlay = overlayRef.current;
		if ( ! overlay || ! selected ) {
			return;
		}
		overlay.classList.add( 'stream__init-overlay-enabled' );
		const timer = window.setTimeout( () => {
			if ( restoreScroll ) {
				scrollToSelectedPost( false );
			}
			overlay.classList.remove( 'stream__init-overlay-enabled' );
		}, 100 );
		return () => {
			window.clearTimeout( timer );
			overlay.classList.remove( 'stream__init-overlay-enabled' );
		};
		// Initial-mount only; subsequent selection changes go through the
		// focus/scroll effect below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Refocus / scroll when the selected post key changes.
	const previousSelectedRef = useRef< PostKey | null >( null );
	useEffect( () => {
		const previous = previousSelectedRef.current;
		previousSelectedRef.current = selected;
		if ( keysAreEqual( previous, selected ) ) {
			return;
		}
		if ( ! wasSelectedByOpeningPostRef.current ) {
			scrollToSelectedPost( true );
		}
		wasSelectedByOpeningPostRef.current = false;
		// Focus first link inside the selected card. Lookup is by `data-postkey`
		// rather than React refs because `<Stream>` is a function component
		// (string refs would require a class owner; see `captureRef` in
		// `renderPost`).
		const refKey = selected ? keyToString( selected ) : null;
		const node = refKey
			? document.querySelector( `[data-postkey="${ CSS.escape( refKey ) }"]` )
			: null;
		if ( node instanceof Element ) {
			const firstLink = node.querySelector( 'a:not(.user-avatar a)' ) as HTMLAnchorElement | null;
			firstLink?.focus();
		}
	}, [ selected, scrollToSelectedPost ] );

	// Recompute the scroll container whenever the body class changes — e.g.
	// `is-reader-page` being added/removed by `<ReaderMain>` toggles which
	// ancestor scrolls. Without this, fresh route navigations sometimes leave
	// the stream wired to a stale container.
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}
		const observer = new MutationObserver( () => {
			const list = listRef.current;
			if ( ! list ) {
				return;
			}
			const node = ReactDom.findDOMNode( list );
			if ( ! ( node instanceof Element ) ) {
				return;
			}
			const next = findScrollContainer( node );
			setListContext( ( previous ) => ( previous === next ? previous : next ) );
		} );
		observer.observe( document.body, { attributeFilter: [ 'class' ] } );
		return () => observer.disconnect();
	}, [] );

	// Keyboard shortcuts (j/k/arrows/Enter/v/l).
	const handleOpenSelection = useCallback( () => {
		if ( ! selected ) {
			return;
		}
		dispatch(
			showSelectedPostUtil( {
				postKey: selected as Parameters< typeof showSelectedPostUtil >[ 0 ][ 'postKey' ],
			} ) as never
		);
	}, [ selected, dispatch ] );

	const handleOpenSelectionNewTab = useCallback( () => {
		if ( selected?.url ) {
			window.open( selected.url as string, '_blank', 'noreferrer,noopener' );
		}
	}, [ selected ] );

	const toggleLikeOnSelectedPost = useCallback( () => {
		if ( ! selectedPost ) {
			return;
		}
		const xPostMetadata = XPostHelper.getXPostMetadata( selectedPost ) as
			| { postURL?: string }
			| undefined;
		if ( xPostMetadata?.postURL ) {
			return;
		}
		if ( ! isLikeable( selectedPost ) || likedPost === null ) {
			return;
		}
		const toggler = likedPost ? unlikePost : likePost;
		dispatch( toggler( selectedPost.site_ID, selectedPost.ID, { source: 'reader' } ) as never );
	}, [ selectedPost, likedPost, dispatch ] );

	const selectFirstVisible = useCallback( () => {
		// Mirrors the "magic" walk in legacy `<Stream>`: pick the first item
		// whose top is on-screen so users can scroll then press 'j'/arrow and
		// have the selection land where they're looking, not where they were.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const visible = ( listRef.current as any )?.getVisibleItemIndexes?.( {
			offsetTop: fixedHeaderHeight || 0,
		} ) as Array< { index: number; bounds: { top: number } } > | undefined;
		if ( ! visible || visible.length === 0 ) {
			return;
		}
		let pickIndex = visible[ 0 ].index;
		for ( const v of visible ) {
			if ( v.bounds.top > 0 && ! items[ v.index ]?.isRecommendationBlock ) {
				pickIndex = v.index;
				break;
			}
		}
		const target = items[ pickIndex ];
		if ( ! target ) {
			return;
		}
		if ( keysAreEqual( target, selected ) ) {
			selectNext( items );
		} else {
			selectItem( target );
		}
	}, [ items, selected, selectNext, selectItem, fixedHeaderHeight ] );

	useEffect( () => {
		const handleKeydown = ( event: KeyboardEvent ) => {
			if ( notificationsOpen ) {
				return;
			}
			const target = event.target as Element | Document | null;
			if ( target instanceof Element ) {
				if ( inputTags.includes( target.tagName ) || ( target as HTMLElement ).isContentEditable ) {
					return;
				}
			}
			if ( event.metaKey || event.ctrlKey ) {
				return;
			}
			switch ( event.key ) {
				case 'ArrowRight':
				case 'j': {
					const selectedCard = ( listContext || document ).querySelector?.( '.card.is-selected' );
					if ( selected && selectedCard ) {
						selectNext( items );
					} else {
						selectFirstVisible();
					}
					return;
				}
				case 'ArrowLeft':
				case 'k': {
					if ( selected ) {
						selectPrev( items );
					}
					return;
				}
				case 'Enter':
					return handleOpenSelection();
				case 'v':
					return handleOpenSelectionNewTab();
				case 'l':
					return toggleLikeOnSelectedPost();
			}
		};

		document.addEventListener( 'keydown', handleKeydown, true );
		return () => {
			document.removeEventListener( 'keydown', handleKeydown, true );
		};
	}, [
		notificationsOpen,
		listContext,
		items,
		selected,
		selectNext,
		selectPrev,
		selectFirstVisible,
		handleOpenSelection,
		handleOpenSelectionNewTab,
		toggleLikeOnSelectedPost,
	] );

	const handleListContextRef = useCallback( ( component: InfiniteList | null ) => {
		listRef.current = component;
		if ( ! component ) {
			return;
		}
		const node = ReactDom.findDOMNode( component );
		if ( ! ( node instanceof Element ) ) {
			return;
		}
		setListContext( findScrollContainer( node ) );
	}, [] );

	const tryAgain = useCallback( () => {
		stream.refetch();
	}, [ stream ] );

	const handleShowUpdates = useCallback( () => {
		consumePending();
		// `InfiniteList.scrollToTop` is implemented on the class component but
		// not exposed in its TypeScript surface yet.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( listRef.current as any )?.scrollToTop?.();
		onUpdatesShown?.();
	}, [ consumePending, onUpdatesShown ] );

	const handleFetchNextPage = useCallback(
		( options?: { triggeredByScroll?: boolean } ) => {
			if ( isLoginPromptVisible() ) {
				return;
			}
			if ( options?.triggeredByScroll ) {
				const pageId = pagesByKey.get( streamKey ) || 0;
				pagesByKey.set( streamKey, pageId + 1 );
				trackScrollPage( pageId );
			}
			fetchNextPage();
		},
		[ streamKey, trackScrollPage, fetchNextPage, isLoginPromptVisible ]
	);

	const renderLoadingPlaceholders = useCallback( () => {
		const count = items.length === 0 ? INITIAL_FETCH : PER_FETCH;
		return times( count, ( i ) => {
			if ( placeholderFactory ) {
				return placeholderFactory( { key: 'feed-post-placeholder-' + i } );
			}
			return <PostPlaceholder key={ 'feed-post-placeholder-' + i } />;
		} );
	}, [ items.length, placeholderFactory ] );

	const getPostRef = useCallback( ( postKey: PostKey ) => keyToString( postKey ), [] );

	const renderAppPromo = useCallback(
		( index: number ) => {
			// Discover-only mid-stream Jetpack mobile app promo at index 3 to
			// match the legacy placement.
			if ( index !== 3 || ! isDiscoverStream ) {
				return null;
			}
			return (
				<AppPromo
					iconSize={ 40 }
					campaign="calypso-reader-stream"
					title={ translate( 'Read on the go with the Jetpack Mobile App' ) }
					hasQRCode
					hasGetAppButton={ false }
				/>
			);
		},
		[ isDiscoverStream, translate ]
	);

	const renderPost = useCallback(
		( postKey: PostKey, index: number ) => {
			const visibleKey = transformStreamItems ? transformStreamItems( postKey ) : postKey;
			const isSelectedItem = !! ( selected && keysAreEqual( selected, visibleKey ) );
			const itemKey = keyToString( visibleKey );
			const handleClick = () => {
				if ( ! isSelectedItem ) {
					selectItem( visibleKey );
					wasSelectedByOpeningPostRef.current = true;
				}
				dispatch(
					showSelectedPostUtil( {
						postKey: visibleKey as Parameters< typeof showSelectedPostUtil >[ 0 ][ 'postKey' ],
					} ) as never
				);
			};
			const captureRef = ( node: HTMLDivElement | null ) => {
				const list = listRef.current as
					| ( InfiniteList & { refs: Record< string, unknown > } )
					| null;
				if ( ! list || ! itemKey ) {
					return;
				}
				if ( node ) {
					list.refs[ itemKey ] = node;
				} else {
					delete list.refs[ itemKey ];
				}
			};
			return (
				<React.Fragment key={ itemKey }>
					{ renderAppPromo( index ) }
					<div ref={ captureRef } data-postkey={ itemKey }>
						<PostLifecycle
							isSelected={ isSelectedItem }
							handleClick={ handleClick }
							postKey={ visibleKey }
							suppressSiteNameLink={ suppressSiteNameLink }
							showFollowInHeader={ showFollowInHeader }
							isDiscoverStream={ isDiscoverStream }
							showSiteName={ showSiteNameOnCards }
							selectedPostKey={ undefined }
							followSource={ followSource }
							blockedSites={ blockedSites }
							streamKey={ streamKey }
							index={ index }
							compact={ useCompactCards }
							siteId={ primarySiteId }
							showFollowButton={ showFollowButton }
							fixedHeaderHeight={ fixedHeaderHeight }
						/>
					</div>
					{ index === 0 && <ReaderPerformanceTrackerStop /> }
				</React.Fragment>
			);
		},
		[
			selected,
			transformStreamItems,
			selectItem,
			suppressSiteNameLink,
			showFollowInHeader,
			isDiscoverStream,
			showSiteNameOnCards,
			followSource,
			blockedSites,
			streamKey,
			useCompactCards,
			primarySiteId,
			showFollowButton,
			fixedHeaderHeight,
			dispatch,
			renderAppPromo,
		]
	);

	let body: React.ReactNode;
	let showingStream = false;
	let baseClassNames = [ 'following', className ].filter( Boolean ).join( ' ' );
	const sidebarContent = typeof streamSidebar === 'function' ? streamSidebar( wideDisplay ) : null;
	let visibleItems = items;
	let fetching = isFetching;

	if ( forcePlaceholders ) {
		visibleItems = [];
		fetching = true;
	}

	const hasNoPosts = ! isLoading && visibleItems.length === 0 && ! fetching && ! error;

	if ( error ) {
		body = (
			<StreamError
				onTryAgain={ tryAgain }
				streamKey={ streamKey }
				error={ {
					message: ( error as { message?: string } )?.message ?? '',
				} }
			/>
		);
	} else if ( hasNoPosts ) {
		const renderedEmpty = emptyContent();
		const emptyBody = renderedEmpty ?? ( hideDefaultEmptyContentIfMissing ? null : null );
		if ( wideDisplay && sidebarContent && streamType !== 'search' ) {
			body = (
				<div className="stream__two-column">
					<div className="reader__content">{ emptyBody }</div>
					<div className="stream__right-column">{ sidebarContent }</div>
				</div>
			);
			baseClassNames = [ 'is-two-columns', baseClassNames ].filter( Boolean ).join( ' ' );
		} else {
			body = emptyBody;
		}
	} else {
		showingStream = true;
		const streamList = (
			<InfiniteList
				ref={ handleListContextRef }
				items={ visibleItems }
				lastPage={ lastPage }
				fetchingNextPage={ fetching }
				guessedItemHeight={ GUESSED_POST_HEIGHT }
				fetchNextPage={ handleFetchNextPage }
				getItemRef={ getPostRef }
				renderItem={ renderPost }
				renderLoadingPlaceholders={ renderLoadingPlaceholders }
				className="stream__list"
				context={ listContext }
				selectedItem={ selected }
				restoreScroll={ restoreScroll }
			/>
		);
		if ( ! sidebarContent || streamType === 'search' ) {
			body = (
				<div className="reader__content">
					{ streamHeader?.() }
					{ streamList }
				</div>
			);
		} else if ( wideDisplay ) {
			body = (
				<div className="stream__two-column">
					<div className="reader__content">
						{ streamHeader?.() }
						{ streamList }
					</div>
					<div className="stream__right-column">{ sidebarContent }</div>
				</div>
			);
			baseClassNames = [ 'is-two-columns', baseClassNames ].filter( Boolean ).join( ' ' );
		} else {
			// Narrow viewport with a sidebar: render Posts/Subscriptions tabs so
			// the sidebar content stays reachable on phones and tablets.
			body = (
				<>
					{ streamHeader?.() }
					<div className="stream__container">
						<div className="stream__header">
							<SectionNav selectedText={ selectedTab }>
								<NavTabs label={ translate( 'Status' ) }>
									<NavItem
										key="posts"
										selected={ selectedTab === 'posts' }
										onClick={ () => setSelectedTab( 'posts' ) }
									>
										{ translate( 'Posts' ) }
									</NavItem>
									<NavItem
										key="sites"
										selected={ selectedTab === 'sites' }
										onClick={ () => setSelectedTab( 'sites' ) }
									>
										{ sidebarTabTitle || translate( 'Subscriptions' ) }
									</NavItem>
								</NavTabs>
							</SectionNav>
						</div>
						{ selectedTab === 'posts' && <div className="reader__content">{ streamList }</div> }
						{ selectedTab === 'sites' && (
							<div className="stream__right-column">{ sidebarContent }</div>
						) }
					</div>
				</>
			);
		}
	}

	const inner = (
		<>
			<div ref={ overlayRef } className="stream__init-overlay" />
			{ pendingCount > 0 && (
				<button
					type="button"
					className="reader-update-notice is-active"
					onClick={ handleShowUpdates }
				>
					<Gridicon icon="arrow-up" size={ 18 } />
					{ translate( '%s new post', '%s new posts', {
						args: [ String( pendingCount ) ],
						count: pendingCount,
						comment: '%s is the number of new posts. For example: "1" or "40+"',
					} ) }
				</button>
			) }
			{ children }
			{ showingStream && visibleItems.length > 0 && intro?.() }
			{ body }
			{ showingStream && visibleItems.length > 0 && ! fetching && <ListEnd /> }
			{ isLoginPromptVisible() && (
				<ReaderStreamLoginPrompt redirectPath={ window.location.pathname } />
			) }
		</>
	);

	const wrapperClassName = [ 'is-reader-page', baseClassNames ].filter( Boolean ).join( ' ' );

	if ( isMain ) {
		return (
			<ReaderMain className={ wrapperClassName } wideLayout={ wideLayout }>
				{ inner }
			</ReaderMain>
		);
	}
	return <div className={ wrapperClassName }>{ inner }</div>;
}

export default Stream;
