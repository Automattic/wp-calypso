import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AsyncLoad from 'calypso/components/async-load';
import NavigationHeader from 'calypso/components/navigation-header';
import FollowingEmptyContent from 'calypso/reader/stream/empty';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { requestPaginatedStream } from 'calypso/state/reader/streams/actions';
import { viewStream } from 'calypso/state/reader-ui/actions';
import Skeleton from '../components/skeleton';
import EngagementBar from './engagement-bar';
import RecentPostField from './recent-post-field';
import RecentPostSkeleton from './recent-post-skeleton';
import type { PostItem, ReaderPost } from './types';
import type { AppState } from 'calypso/types';

import './style.scss';

interface RecentProps {
	viewToggle?: React.ReactNode;
}

interface PaddingItem {
	isPadding: true;
	postId: string;
}

function isPaddingItem( item: ReaderPost | PaddingItem ): item is PaddingItem {
	return 'isPadding' in item;
}

const Recent = ( { viewToggle }: RecentProps ) => {
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const [ selectedItem, setSelectedItem ] = useState< ReaderPost | null >( null );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const [ isLoading, setIsLoading ] = useState( false );
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
		perPage: 10,
		page: 1,
		titleField: 'post',
		mediaField: 'icon',
		showMedia: true,
	} );

	const selectedRecentSidebarFeedId = useSelector< AppState, number | null >(
		( state ) => state.readerUi.sidebar.selectedRecentSite
	);

	const streamKey =
		selectedRecentSidebarFeedId !== null ? `recent:${ selectedRecentSidebarFeedId }` : 'recent';

	const data = useSelector( ( state: AppState ) => state.reader?.streams?.[ streamKey ] );

	const posts = useSelector( ( state: AppState ) => {
		const items = data?.items;
		if ( ! items ) {
			return {};
		}

		return items.reduce( ( acc: Record< string, PostItem >, item: ReaderPost | PaddingItem ) => {
			if ( isPaddingItem( item ) ) {
				return acc;
			}
			const post = getPostByKey( state, {
				feedId: item.feedId,
				postId: item.postId,
			} );
			if ( post ) {
				acc[ `${ item?.feedId }-${ item?.postId }` ] = post;
			}
			return acc;
		}, {} );
	}, shallowEqual );

	const getPostFromItem = useCallback(
		( item: ReaderPost ) => {
			const postKey = `${ item?.feedId }-${ item?.postId }`;
			return posts[ postKey ];
		},
		[ posts ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'icon',
				label: translate( 'Icon' ),
				render: ( { item }: { item: ReaderPost | PaddingItem } ) => {
					if ( isPaddingItem( item ) ) {
						return <Skeleton height="24px" width="24px" shape="circle" />;
					}
					const post = getPostFromItem( item );
					const iconUrl = post?.site_icon?.img || post?.author?.avatar_URL || '';
					return iconUrl ? <ReaderAvatar siteIcon={ iconUrl } iconSize={ 24 } /> : null;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'post',
				label: translate( 'Post' ),
				getValue: ( { item }: { item: ReaderPost | PaddingItem } ) =>
					isPaddingItem( item )
						? ''
						: `${ getPostFromItem( item )?.title ?? '' } - ${ item?.site_name ?? '' }`,
				render: ( { item }: { item: ReaderPost | PaddingItem } ) => {
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
							<RecentPostField
								ref={ ( el ) => {
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
		dispatch( viewStream( streamKey, window.location.pathname ) as UnknownAction );
		dispatch(
			requestPaginatedStream( {
				streamKey,
				page: view.page,
				perPage: view.perPage,
			} ) as UnknownAction
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

	// Fetch the data when the component is mounted.
	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	// Set the first item as selected on the current page.
	useEffect( () => {
		if ( isWide && data?.items?.length > 0 ) {
			if ( view.page && view.perPage ) {
				const selectedPost = data?.items?.[ ( view.page - 1 ) * view.perPage ];
				setSelectedItem( selectedPost || null );
			}
		}
	}, [ isWide, data?.items, view ] );

	// When the selected feed changes, clear the selected item and reset the page to 1.
	useEffect( () => {
		setSelectedItem( null );
		setView( ( prevView ) => ( {
			...prevView,
			page: 1,
		} ) );
	}, [ selectedRecentSidebarFeedId ] );

	useLayoutEffect( () => {
		setIsLoading( data?.isRequesting );
	}, [ data?.isRequesting ] );

	// Handle key events
	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLDivElement > ) => {
			if ( event.key === 'Enter' && focusedIndexRef.current !== null ) {
				// Use the focused index to determine the selected item
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
	return (
		/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
		<div className="recent-feed" onKeyDown={ handleKeyDown }>
			<div className={ `recent-feed__list-column ${ selectedItem ? 'has-overlay' : '' }` }>
				<div className="recent-feed__list-column-header">
					<NavigationHeader title={ translate( 'Recent' ) }>{ viewToggle }</NavigationHeader>
				</div>
				<aside className="recent-feed__list-column-content">
					<DataViews< ReaderPost | PaddingItem >
						getItemId={ ( item: ReaderPost | PaddingItem, index = 0 ) =>
							item.postId?.toString() ?? `item-${ index }`
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
						selection={ selectedItem ? [ selectedItem.postId?.toString() ] : [] }
						onChangeSelection={ ( newSelection: string[] ) => {
							const selectedPost = data?.items?.find(
								( item: ReaderPost ) => item.postId?.toString() === newSelection[ 0 ]
							);
							setSelectedItem( selectedPost || null );
							// Focus the post column after a short delay to ensure DOM updates.
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
				className={ `recent-feed__post-column ${ selectedItem ? 'overlay' : '' }` }
				tabIndex={ -1 }
			>
				{ ! ( selectedItem && getPostFromItem( selectedItem ) ) && isLoading && (
					<RecentPostSkeleton />
				) }
				{ ! isLoading && data?.items.length === 0 && <FollowingEmptyContent /> }
				{ data?.items.length > 0 && selectedItem && getPostFromItem( selectedItem ) && (
					<>
						<AsyncLoad
							require="calypso/blocks/reader-full-post"
							feedId={ selectedItem.feedId }
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
						<EngagementBar feedId={ selectedItem?.feedId } postId={ selectedItem?.postId } />
					</>
				) }
			</section>
		</div>
	);
};

export default Recent;
