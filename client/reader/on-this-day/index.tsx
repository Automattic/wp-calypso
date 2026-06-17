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
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import Skeleton from '../components/skeleton';
import { getOnThisDayHeaderDateLabel } from './get-stream-key';
import { OnThisDayPostField } from './on-this-day-post-field';
import { OnThisDayPostSkeleton } from './on-this-day-post-skeleton';

const loadReaderFullPost = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-reader-full-post" */ 'calypso/blocks/reader-full-post'
	);

interface PostItem {
	title?: string;
	excerpt?: string;
	content?: string;
	featured_image?: string;
	site_icon: {
		img: string;
	};
	author: {
		avatar_URL: string;
	};
	site_name?: string;
	site_ID?: number;
	date?: string;
}

function postKeyForItem( item: StreamItem ) {
	if ( item.feedId ) {
		return { feedId: item.feedId, postId: item.postId };
	}
	return { blogId: item.blogId, postId: item.postId };
}

function itemKeyString( item: StreamItem ) {
	if ( item.feedId ) {
		return `${ item.feedId }-${ item.postId }`;
	}
	return `${ item.blogId }-${ item.postId }`;
}

interface OnThisDayProps {
	viewToggle?: React.ReactNode;
	streamKey: string;
}

const postIdString = ( item: StreamListItem ) => item.postId?.toString() ?? '';

export const OnThisDay = ( { viewToggle, streamKey }: OnThisDayProps ) => {
	const query = useSelector( getCurrentQueryArguments );
	const dispatch = useDispatch();
	const [ selectedItem, setSelectedItem ] = useState< StreamItem | null >( null );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const postColumnRef = useRef< HTMLDivElement | null >( null );
	const itemRefs = useRef< { [ key: string ]: HTMLDivElement | null } >( {} );
	const focusedIndexRef = useRef< string | null >( null );

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
	const postKeys = useMemo( () => postItems.map( postKeyForItem ), [ postItems ] );
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
			if ( isPaddingStreamItem( item ) ) {
				return acc;
			}

			if ( item.feedId ) {
				const feedId = Number( item.feedId );
				const feedSubscription = subscriptionsByFeedId.get( feedId );
				if ( feedSubscription?.site_icon ) {
					acc[ feedId ] = feedSubscription.site_icon;
				}
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

			acc[ itemKeyString( item ) ] = {
				...post,
				site_icon:
					post.site_icon ??
					( item.feedId ? siteIconsByFeedId[ Number( item.feedId ) ] : undefined ),
			} as PostItem;

			return acc;
		}, {} );
	}, [ cachedPosts, postItems, siteIconsByFeedId ] );

	const getPostFromItem = useCallback(
		( item: StreamItem ) => {
			return posts[ itemKeyString( item ) ];
		},
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
						<div onFocus={ () => handleItemFocus( postIdString( item ) ) }>
							<OnThisDayPostField
								ref={ ( el: HTMLDivElement | null ) => {
									itemRefs.current[ postIdString( item ) ] = el;
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
		const pathForView =
			typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
		dispatch( viewStream( streamKey, pathForView ) as UnknownAction );
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

	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

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

	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLDivElement > ) => {
			if ( event.key === 'Enter' && focusedIndexRef.current !== null ) {
				const focusedItem = shownData.find(
					( item ) => item.postId?.toString() === focusedIndexRef.current
				);
				if ( focusedItem && ! isPaddingStreamItem( focusedItem ) ) {
					setSelectedItem( focusedItem );
					setTimeout( () => {
						postColumnRef.current?.focus();
					}, 0 );
				}
			}
		},
		[ shownData ]
	);

	const headerDateLabel = getOnThisDayHeaderDateLabel( query );

	return (
		/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
		<div className="on-this-day" onKeyDown={ handleKeyDown }>
			<div className={ `on-this-day__list-column ${ selectedItem ? 'has-overlay' : '' }` }>
				<div className="on-this-day__list-column-header">
					<NavigationHeader title={ translate( 'On This Day' ) } subtitle={ headerDateLabel }>
						{ viewToggle }
					</NavigationHeader>
				</div>
				<aside className="on-this-day__list-column-content">
					<DataViews< StreamListItem >
						config={ { perPageSizes: [ 15, 30, 50, 100 ] } }
						getItemId={ ( item: StreamListItem, index = 0 ) =>
							item.postId?.toString() ?? `item-${ index }`
						}
						view={ view }
						fields={ fields }
						data={ shownData }
						onChangeView={ ( newView ) => setView( { ...newView } ) }
						paginationInfo={ view.search === '' ? defaultPaginationInfo : paginationInfo }
						defaultLayouts={ { list: {} } }
						isLoading={ isLoading }
						selection={ selectedItem ? [ postIdString( selectedItem ) ] : [] }
						onChangeSelection={ ( newSelection: string[] ) => {
							const selectedPost = streamItems.find(
								( item: StreamListItem ) => item.postId?.toString() === newSelection[ 0 ]
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
				className={ `on-this-day__post-column ${ selectedItem ? 'overlay' : '' }` }
				tabIndex={ -1 }
			>
				{ ! ( selectedItem && getPostFromItem( selectedItem ) ) && isLoading && (
					<OnThisDayPostSkeleton />
				) }
				{ ! isLoading && streamItems.length === 0 && <FollowingEmptyContent view="on-this-day" /> }
				{ streamItems.length > 0 && selectedItem && getPostFromItem( selectedItem ) && (
					<AsyncLoad
						require={ loadReaderFullPost }
						feedId={ selectedItem.feedId }
						blogId={ selectedItem.blogId }
						postId={ selectedItem.postId }
						onClose={ () => {
							const focusItem = itemRefs.current[ selectedItem?.postId?.toString() ?? '' ];
							if ( ! isWide ) {
								setSelectedItem( null );
							}
							requestAnimationFrame( () => {
								focusItem?.focus();
							} );
						} }
						layout="recent"
					/>
				) }
			</section>
		</div>
	);
};
