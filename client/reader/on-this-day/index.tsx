import './style.scss';

import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AsyncLoad from 'calypso/components/async-load';
import NavigationHeader from 'calypso/components/navigation-header';
import { useCachedPosts } from 'calypso/reader/data/post-cache';
import { getPostIcon } from 'calypso/reader/get-helpers';
import FollowingEmptyContent from 'calypso/reader/stream/empty';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';
import { requestPaginatedStream } from 'calypso/state/reader/streams/actions';
import { viewStream } from 'calypso/state/reader-ui/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import Skeleton from '../components/skeleton';
import { getOnThisDayHeaderDateLabel } from './get-stream-key';
import { OnThisDayPostField } from './on-this-day-post-field';
import { OnThisDayPostSkeleton } from './on-this-day-post-skeleton';
import type { ReadPostBlogKey, ReadPostFeedKey } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

const loadReaderFullPost = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-reader-full-post" */ 'calypso/blocks/reader-full-post'
	);

type Post = {
	site_name: string;
	postId: number;
	feedId?: ReadPostFeedKey[ 'feedId' ];
	blogId?: ReadPostBlogKey[ 'blogId' ];
};

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

interface PaddingItem {
	isPadding: true;
	postId: string;
}

function isPaddingItem( item: Post | PaddingItem ): item is PaddingItem {
	return 'isPadding' in item;
}

function postKeyForItem( item: Post ) {
	if ( item.feedId ) {
		return { feedId: item.feedId, postId: item.postId };
	}
	return { blogId: item.blogId, postId: item.postId };
}

function itemKeyString( item: Post ) {
	if ( item.feedId ) {
		return `${ item.feedId }-${ item.postId }`;
	}
	return `${ item.blogId }-${ item.postId }`;
}

interface OnThisDayProps {
	viewToggle?: React.ReactNode;
	streamKey: string;
}

export const OnThisDay = ( { viewToggle, streamKey }: OnThisDayProps ) => {
	const query = useSelector( getCurrentQueryArguments );
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const [ selectedItem, setSelectedItem ] = useState< Post | null >( null );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const [ isLoading, setIsLoading ] = useState( false );
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

	const data = useSelector( ( state: AppState ) => state.reader?.streams?.[ streamKey ] );

	const postItems = useMemo(
		() =>
			( ( data?.items ?? [] ) as Array< Post | PaddingItem > ).filter(
				( item ) => ! isPaddingItem( item )
			) as Post[],
		[ data?.items ]
	);
	const postKeys = useMemo( () => postItems.map( postKeyForItem ), [ postItems ] );
	const cachedPosts = useCachedPosts( postKeys );
	const siteIconsByFeedId = useSelector( ( state: AppState ) => {
		const items = data?.items;
		if ( ! items ) {
			return {};
		}

		return items.reduce( ( acc: Record< number, unknown >, item: Post | PaddingItem ) => {
			if ( isPaddingItem( item ) ) {
				return acc;
			}

			if ( item.feedId ) {
				const feedSubscription = getReaderFollowForFeed( state, item.feedId );
				if ( feedSubscription?.site_icon ) {
					acc[ item.feedId ] = feedSubscription.site_icon;
				}
			}

			return acc;
		}, {} );
	}, shallowEqual );

	const posts = useMemo( () => {
		return postItems.reduce( ( acc: Record< string, PostItem >, item, index ) => {
			const post = cachedPosts[ index ];
			if ( ! post ) {
				return acc;
			}

			acc[ itemKeyString( item ) ] = {
				...post,
				site_icon: post.site_icon ?? ( item.feedId ? siteIconsByFeedId[ item.feedId ] : undefined ),
			} as PostItem;

			return acc;
		}, {} );
	}, [ cachedPosts, postItems, siteIconsByFeedId ] );

	const getPostFromItem = useCallback(
		( item: Post ) => {
			return posts[ itemKeyString( item ) ];
		},
		[ posts ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'icon',
				label: translate( 'Icon' ),
				render: ( { item }: { item: Post | PaddingItem } ) => {
					if ( isPaddingItem( item ) ) {
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
				getValue: ( { item }: { item: Post | PaddingItem } ) =>
					isPaddingItem( item )
						? ''
						: `${ getPostFromItem( item )?.title ?? '' } - ${ item?.site_name ?? '' }`,
				render: ( { item }: { item: Post | PaddingItem } ) => {
					if ( isPaddingItem( item ) ) {
						return (
							<>
								<Skeleton height="10px" width="100%" style={ { marginBottom: '8px' } } />
								<Skeleton height="8px" width="50%" />
							</>
						);
					}
					return (
						<div onFocus={ () => handleItemFocus( item.postId?.toString() ) }>
							<OnThisDayPostField
								ref={ ( el: HTMLDivElement | null ) => {
									itemRefs.current[ item.postId?.toString() ?? '' ] = el;
								} }
								post={ getPostFromItem( item ) }
							/>
						</div>
					);
				},
				enableHiding: false,
				enableSorting: false,
				enableGlobalSearch: true,
			},
		],
		[ getPostFromItem, handleItemFocus ]
	);

	const fetchData = useCallback( () => {
		const pathForView =
			typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
		dispatch( viewStream( streamKey, pathForView ) as UnknownAction );
		dispatch(
			requestPaginatedStream( {
				streamKey,
				page: view.page,
				perPage: view.perPage,
			} )
		);
	}, [ dispatch, view, streamKey ] );

	const defaultPaginationInfo = useMemo( () => {
		return {
			totalItems: data?.pagination?.totalItems ?? 0,
			totalPages: data?.pagination?.totalPages ?? 0,
		};
	}, [ data?.pagination ] );

	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data?.items ?? [], view, fields );
	}, [ data?.items, view, fields ] );

	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	useEffect( () => {
		if ( isWide && data?.items?.length > 0 ) {
			if ( view.page && view.perPage ) {
				const selectedPost = data?.items?.[ ( view.page - 1 ) * view.perPage ];
				setSelectedItem( selectedPost || null );
			}
		}
	}, [ isWide, data?.items, view ] );

	useLayoutEffect( () => {
		setIsLoading( data?.isRequesting );
	}, [ data?.isRequesting ] );

	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLDivElement > ) => {
			if ( event.key === 'Enter' && focusedIndexRef.current !== null ) {
				const focusedItem = shownData.find(
					( item ) => item.postId?.toString() === focusedIndexRef.current
				);
				if ( focusedItem && ! isPaddingItem( focusedItem ) ) {
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
					<DataViews< Post | PaddingItem >
						config={ { perPageSizes: [ 15, 30, 50, 100 ] } }
						getItemId={ ( item: Post | PaddingItem, index = 0 ) =>
							item.postId?.toString() ?? `item-${ index }`
						}
						view={ view }
						fields={ fields }
						data={ shownData }
						onChangeView={ ( newView ) => setView( { ...newView } ) }
						paginationInfo={ view.search === '' ? defaultPaginationInfo : paginationInfo }
						defaultLayouts={ { list: {} } }
						isLoading={ isLoading }
						selection={ selectedItem ? [ selectedItem.postId?.toString() ] : [] }
						onChangeSelection={ ( newSelection: string[] ) => {
							const selectedPost = data?.items?.find(
								( item: Post ) => item.postId?.toString() === newSelection[ 0 ]
							);
							setSelectedItem( selectedPost || null );
							setTimeout( () => {
								postColumnRef.current?.focus();
							}, 0 );
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
				{ ! isLoading && data?.items.length === 0 && <FollowingEmptyContent view="on-this-day" /> }
				{ data?.items.length > 0 && selectedItem && getPostFromItem( selectedItem ) && (
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
