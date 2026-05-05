import { isDefaultLocale } from '@automattic/i18n-utils';
import { times } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import ReactDom from 'react-dom';
import InfiniteList from 'calypso/components/infinite-list';
import ListEnd from 'calypso/components/list-end';
import scrollTo from 'calypso/lib/scroll-to';
import ReaderMain from 'calypso/reader/components/reader-main';
import { isLikeable } from 'calypso/reader/post/capabilities';
import { keysAreEqual, keyToString } from 'calypso/reader/post-key';
import { MAX_POSTS_FOR_LOGGED_OUT_USERS } from 'calypso/reader/reader.const';
import ReaderStreamLoginPrompt from 'calypso/reader/stream/login-prompt';
import PostLifecycle from 'calypso/reader/stream/post-lifecycle';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import { showSelectedPost as showSelectedPostUtil } from 'calypso/reader/utils';
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
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { ReaderPerformanceTrackerStop } from '../reader-performance-tracker';
import EmptyContent from '../stream/empty';
import { StreamError } from '../stream/error';
import { useStreamPostKeySelection } from './use-stream-post-key-selection';
import { useStreamPosts, type PostKey } from './use-stream-posts';

import 'calypso/reader/stream/style.scss';

const GUESSED_POST_HEIGHT = 600;
const inputTags = [ 'INPUT', 'SELECT', 'TEXTAREA' ];

// Tracks how many "scroll loads" each stream has triggered, to feed into
// `trackScrollPage`. Module-level so it survives unmounts (the legacy Stream
// uses the same pattern in `client/reader/stream/index.jsx`).
const pagesByKey = new Map< string, number >();

export interface StreamV2Props {
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

export function StreamV2( props: StreamV2Props ) {
	const {
		streamKey,
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
		fixedHeaderHeight,
		followSource,
		startDate,
		emptyContent = defaultEmptyContent,
		intro,
		streamHeader,
		streamSidebar,
		placeholderFactory,
		transformStreamItems,
		trackScrollPage,
		children,
	} = props;

	const dispatch = useDispatch();

	const rawLocale = useSelector( getCurrentLocaleSlug );
	const localeSlug = rawLocale && ! isDefaultLocale( rawLocale ) ? rawLocale : null;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const blockedSites = useSelector( getBlockedSites );
	const primarySiteId = useSelector( getPrimarySiteId );
	const notificationsOpen = useSelector( isNotificationsOpen );

	const stream = useStreamPosts( {
		streamKey,
		feedId: null,
		localeSlug,
		startDate: startDate ?? null,
	} );
	const { items, isLoading, isFetching, lastPage, error, fetchNextPage } = stream;
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

	// Scroll restoration on `popstate` (browser back). Manual restoration so
	// the page returns to where the user left off — not the top.
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
		if ( 'scrollRestoration' in window.history ) {
			window.history.scrollRestoration = 'manual';
		}
		return () => {
			window.removeEventListener( 'popstate', handlePopstate );
		};
	}, [ selected, restoreScroll, scrollToSelectedPost ] );

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
		// rather than React refs because `<StreamV2>` is a function component
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
			// `event.target` may be the `document` itself (no `tagName`) when the
			// shortcut is fired with focus outside the stream — that should still
			// route through to navigation. We only bail when the target is an
			// element that actually accepts text input.
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
					// Has selection AND a visible selected card → just advance.
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
		// Walk up looking for the nearest scrollable ancestor.
		const node = ReactDom.findDOMNode( component );
		if ( ! ( node instanceof Element ) ) {
			return;
		}
		const findScrollContainer = ( element: Element | null ): Element | false => {
			if ( ! element || element.ownerDocument === element.parentNode ) {
				return false;
			}
			const { overflowY } = getComputedStyle( element );
			if ( /(auto|scroll)/.test( overflowY ) ) {
				return element;
			}
			return findScrollContainer( element.parentElement );
		};
		setListContext( findScrollContainer( node ) );
	}, [] );

	const tryAgain = useCallback( () => {
		stream.refetch();
	}, [ stream ] );

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
			// Populate `InfiniteList.refs[itemKey]` from outside since string refs
			// (`ref={ itemKey }` in legacy `<Stream>`) only resolve when the owning
			// component is a class — V2 is a function component. `InfiniteList`
			// reads `this.refs[ref]` for `getItemBoundingClientRect`; a raw DOM
			// node works there because `findDOMNode( domNode )` is the identity.
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
		]
	);

	// Compose the body.
	let body: React.ReactNode;
	let showingStream = false;
	let baseClassNames = [ 'following', className ].filter( Boolean ).join( ' ' );
	const sidebarContent =
		typeof streamSidebar === 'function' ? streamSidebar( Boolean( wideLayout ) ) : null;

	const hasNoPosts = ! isLoading && items.length === 0 && ! error;

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
		if ( wideLayout && sidebarContent ) {
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
				items={ items }
				lastPage={ lastPage }
				fetchingNextPage={ isFetching }
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
		if ( wideLayout && sidebarContent ) {
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
			body = (
				<div className="reader__content">
					{ streamHeader?.() }
					{ streamList }
				</div>
			);
		}
	}

	const inner = (
		<>
			<div ref={ overlayRef } className="stream__init-overlay" />
			{ children }
			{ showingStream && items.length > 0 && intro?.() }
			{ body }
			{ showingStream && items.length > 0 && ! isFetching && <ListEnd /> }
			{ isLoginPromptVisible() && (
				<ReaderStreamLoginPrompt redirectPath={ window.location.pathname } />
			) }
		</>
	);

	// `is-reader-page` is normally added to `<body>` from
	// `<ReaderMain>`'s `componentDidMount`, but on the first paint of a fresh
	// route navigation the class isn't there yet — placeholder cards then
	// render with their default `<Card>` chrome (border + padding) and only
	// "snap" to the slim Reader-style skeleton once the body class lands.
	// Mirroring the class on the wrapper here makes the
	// `.is-reader-page .reader__card.card.is-placeholder` overrides match
	// from the very first paint.
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

export default StreamV2;
