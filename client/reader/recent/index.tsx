import './style.scss';
import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AsyncLoad from 'calypso/components/async-load';
import NavigationHeader from 'calypso/components/navigation-header';
import { useCommentsApiDisabled } from 'calypso/reader/data/comments';
import { useCachedPosts } from 'calypso/reader/data/post/cache';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import {
	isPaddingStreamItem,
	usePaginatedStream,
	type StreamItem,
	type StreamListItem,
} from 'calypso/reader/data/stream';
import { getPostIcon } from 'calypso/reader/get-helpers';
import FollowingEmptyContent from 'calypso/reader/stream/empty';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import Skeleton from '../components/skeleton';
import EngagementBar from './engagement-bar';
import RecentPostField from './recent-post-field';
import RecentPostSkeleton from './recent-post-skeleton';
import type { PostItem } from './types';
import type { AppState } from 'calypso/types';

const loadReaderFullPost = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-reader-full-post" */ 'calypso/blocks/reader-full-post'
	);

interface RecentProps {
	viewToggle?: React.ReactNode;
}

// `postId` is not unique across feeds/blogs; prefix with `b{blogId}` for
// WP.com/Jetpack sites or `f{feedId}` for external feeds so row keys stay unique.
export const getStreamItemKey = ( item: StreamListItem ): string => {
	if ( isPaddingStreamItem( item ) ) {
		return item.postId;
	}
	if ( item.postId == null ) {
		return '';
	}
	const source = item.blogId != null ? `b${ item.blogId }` : `f${ item.feedId ?? '' }`;
	return `${ source }-${ item.postId }`;
};

const Recent = ( { viewToggle }: RecentProps ) => {
	const dispatch = useDispatch();
	const [ selectedItem, setSelectedItem ] = useState< StreamItem | null >( null );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const postColumnRef = useRef< HTMLDivElement | null >( null );
	const itemRefs = useRef< { [ key: string ]: HTMLDivElement | null } >( {} );
	const focusedIndexRef = useRef< string | null >( null ); // Keep track of the currently focused row index

	const handleItemFocus = useCallback( ( itemIndex: string ) => {
		focusedIndexRef.current = itemIndex;
	}, [] );

	const [ view, setView ] = useState< View >( {
		type: 'list',
		search: '',
		fields: [],
		perPage: 15,
		page: 1,
		titleField: 'post',
		mediaField: 'icon',
		showMedia: true,
	} );

	const selectedRecentSidebarFeedId = useSelector< AppState, number | null >(
		getSelectedRecentFeedId
	);

	const streamKey =
		selectedRecentSidebarFeedId !== null ? `recent:${ selectedRecentSidebarFeedId }` : 'recent';

	const data = usePaginatedStream( {
		streamKey,
		page: view.page ?? 1,
		perPage: view.perPage ?? 15,
	} );
	const streamItems = data.items;
	const isLoading = data.isRequesting;

	const postItems = useMemo(
		() => streamItems.filter( ( item ) => ! isPaddingStreamItem( item ) ) as StreamItem[],
		[ streamItems ]
	);
	const postKeys = useMemo(
		() =>
			postItems.map( ( item ) => ( {
				feedId: item.feedId,
				postId: item.postId,
			} ) ),
		[ postItems ]
	);
	const cachedPosts = useCachedPosts( postKeys );
	const { subscriptions } = useSiteSubscriptions();
	const siteIconsByFeedId = useMemo( () => {
		const items = streamItems;
		if ( ! items ) {
			return {};
		}
		const subscriptionsByFeedId = new Map(
			subscriptions.map( ( subscription ) => [ Number( subscription.feed_ID ), subscription ] )
		);

		return items.reduce( ( acc: Record< number, unknown >, item: StreamListItem ) => {
			if ( isPaddingStreamItem( item ) || item.feedId == null ) {
				return acc;
			}

			const feedId = Number( item.feedId );
			const feedSubscription = subscriptionsByFeedId.get( feedId );
			if ( feedSubscription?.site_icon ) {
				acc[ feedId ] = feedSubscription.site_icon;
			}

			return acc;
		}, {} );
	}, [ subscriptions, streamItems ] );

	const posts = useMemo( () => {
		return postItems.reduce( ( acc: Record< string, PostItem >, item, index ) => {
			const post = cachedPosts[ index ];
			if ( ! post ) {
				return acc;
			}

			acc[ getStreamItemKey( item ) ] = {
				...post,
				site_icon: post.site_icon ?? siteIconsByFeedId[ Number( item.feedId ) ],
			} as PostItem;

			return acc;
		}, {} );
	}, [ cachedPosts, postItems, siteIconsByFeedId ] );

	const getPostFromItem = useCallback(
		( item: StreamItem ) => posts[ getStreamItemKey( item ) ],
		[ posts ]
	);

	const selectItem = useCallback( ( item: StreamItem ) => {
		setSelectedItem( item );
		setTimeout( () => {
			postColumnRef.current?.focus();
		}, 0 );
	}, [] );

	const handlePostFieldKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLDivElement >, item: StreamItem ) => {
			if ( event.key !== 'Enter' && event.key !== ' ' ) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			selectItem( item );
		},
		[ selectItem ]
	);

	const selectedPost = selectedItem ? getPostFromItem( selectedItem ) : undefined;
	const commentsApiDisabled = useCommentsApiDisabled( selectedPost?.site_ID );

	const fields = useMemo(
		() => [
			{
				id: 'icon',
				label: translate( 'Icon' ),
				render: ( { item }: { item: StreamListItem } ) => {
					if ( isPaddingStreamItem( item ) ) {
						return <Skeleton height="24px" width="24px" shape="circle" />;
					}
					const post = getPostFromItem( item );
					const iconUrl = getPostIcon( post );
					return iconUrl ? <SiteIcon iconUrl={ iconUrl } size={ 24 } /> : null;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'post',
				label: translate( 'Post' ),
				getValue: ( { item }: { item: StreamListItem } ) =>
					isPaddingStreamItem( item )
						? ''
						: `${ getPostFromItem( item )?.title ?? '' } - ${ item?.site_name ?? '' }`,
				render: ( { item }: { item: StreamListItem } ) => {
					if ( isPaddingStreamItem( item ) ) {
						return (
							<>
								<Skeleton height="10px" width="100%" style={ { marginBottom: '8px' } } />
								<Skeleton height="8px" width="50%" />
							</>
						);
					}
					return (
						<div onFocus={ () => handleItemFocus( getStreamItemKey( item ) ) }>
							<RecentPostField
								ref={ ( el ) => {
									itemRefs.current[ getStreamItemKey( item ) ] = el;
								} }
								post={ getPostFromItem( item ) }
								onClick={ () => selectItem( item ) }
								onKeyDown={ ( event ) => handlePostFieldKeyDown( event, item ) }
							/>
						</div>
					);
				},
				enableHiding: false,
				enableSorting: false,
				enableGlobalSearch: true,
			},
		],
		[ getPostFromItem, handleItemFocus, handlePostFieldKeyDown, selectItem ]
	);

	const fetchData = useCallback( () => {
		dispatch( viewStream( streamKey, window.location.pathname ) as UnknownAction );
	}, [ dispatch, streamKey ] );

	const defaultPaginationInfo = useMemo( () => {
		return {
			totalItems: data?.pagination?.totalItems ?? 0,
			totalPages: data?.pagination?.totalPages ?? 0,
		};
	}, [ data?.pagination ] );

	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( streamItems, view, fields );
	}, [ streamItems, view, fields ] );

	// Fetch the data when the component is mounted.
	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	// Set the first item as selected on the current page.
	useEffect( () => {
		if ( isWide && streamItems.length > 0 ) {
			if ( view.page && view.perPage ) {
				const selectedPost = streamItems[ ( view.page - 1 ) * view.perPage ];
				setSelectedItem(
					selectedPost && ! isPaddingStreamItem( selectedPost ) ? selectedPost : null
				);
			}
		}
	}, [ isWide, streamItems, view ] );

	// When the selected feed changes, clear the selected item and reset the page to 1.
	useEffect( () => {
		setSelectedItem( null );
		setView( ( prevView ) => ( {
			...prevView,
			page: 1,
		} ) );
	}, [ selectedRecentSidebarFeedId ] );

	// Handle key events
	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLDivElement > ) => {
			if ( event.key === 'Enter' && focusedIndexRef.current !== null ) {
				// Use the focused index to determine the selected item
				const focusedItem = shownData.find(
					( item ) => getStreamItemKey( item ) === focusedIndexRef.current
				);
				if ( focusedItem && ! isPaddingStreamItem( focusedItem ) ) {
					selectItem( focusedItem );
				}
			}
		},
		[ selectItem, shownData ]
	);
	return (
		/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
		<div className="recent-feed" onKeyDown={ handleKeyDown }>
			<div className={ `recent-feed__list-column ${ selectedItem ? 'has-overlay' : '' }` }>
				<div className="recent-feed__list-column-header">
					<NavigationHeader title={ translate( 'Recent' ) }>{ viewToggle }</NavigationHeader>
				</div>
				<aside className="recent-feed__list-column-content">
					<DataViews< StreamListItem >
						config={ { perPageSizes: [ 15, 30, 50, 100 ] } }
						getItemId={ ( item: StreamListItem, index = 0 ) =>
							getStreamItemKey( item ) || `item-${ index }`
						}
						view={ view }
						fields={ fields }
						data={ shownData }
						onChangeView={ ( newView ) =>
							setView( {
								...newView,
							} )
						}
						paginationInfo={ view.search === '' ? defaultPaginationInfo : paginationInfo }
						defaultLayouts={ { list: {} } }
						isLoading={ isLoading }
						selection={ selectedItem ? [ getStreamItemKey( selectedItem ) ] : [] }
						onChangeSelection={ ( newSelection: string[] ) => {
							const selectedPost = streamItems.find(
								( item: StreamListItem ) => getStreamItemKey( item ) === newSelection[ 0 ]
							);
							if ( selectedPost && ! isPaddingStreamItem( selectedPost ) ) {
								selectItem( selectedPost );
							} else {
								setSelectedItem( null );
							}
						} }
					/>
				</aside>
			</div>
			<section
				aria-labelledby={ selectedItem ? `post-${ selectedItem.postId }` : undefined }
				ref={ postColumnRef }
				className={ `recent-feed__post-column ${ selectedItem ? 'overlay' : '' }` }
				tabIndex={ -1 }
			>
				{ ! ( selectedItem && getPostFromItem( selectedItem ) ) && isLoading && (
					<RecentPostSkeleton />
				) }
				{ ! isLoading && streamItems.length === 0 && <FollowingEmptyContent view="recent" /> }
				{ streamItems.length > 0 && selectedItem && selectedPost && (
					<>
						<AsyncLoad
							require={ loadReaderFullPost }
							feedId={ selectedItem.feedId }
							postId={ selectedItem.postId }
							onClose={ () => {
								const focusItem = itemRefs.current[ getStreamItemKey( selectedItem ) ];
								if ( ! isWide ) {
									setSelectedItem( null );
								}
								requestAnimationFrame( () => {
									focusItem?.focus();
								} );
							} }
							setSelectedItem={ setSelectedItem }
							layout="recent"
						/>
						<EngagementBar
							feedId={ selectedItem?.feedId }
							postId={ selectedItem?.postId }
							commentsApiDisabled={ commentsApiDisabled }
						/>
					</>
				) }
			</section>
		</div>
	);
};

export default Recent;
