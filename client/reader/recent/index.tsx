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
import EmptyContent from 'calypso/components/empty-content';
import NavigationHeader from 'calypso/components/navigation-header';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { requestPaginatedStream } from 'calypso/state/reader/streams/actions';
import { viewStream } from 'calypso/state/reader-ui/actions';
import EngagementBar from './engagement-bar';
import RecentPostField from './recent-post-field';
import RecentPostSkeleton from './recent-post-skeleton';
import type { PostItem, ReaderPost } from './types';
import type { AppState } from 'calypso/types';

import './style.scss';

interface RecentProps {
	viewToggle?: React.ReactNode;
}

const Recent = ( { viewToggle }: RecentProps ) => {
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const [ selectedItem, setSelectedItem ] = useState< ReaderPost | null >( null );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const [ isLoading, setIsLoading ] = useState( false );
	const postColumnRef = useRef< HTMLDivElement | null >( null );
	const itemRefs = useRef< { [ key: string ]: HTMLDivElement | null } >( {} );

	const [ view, setView ] = useState< View >( {
		type: 'list',
		search: '',
		fields: [ 'icon', 'post' ],
		perPage: 10,
		page: 1,
		layout: {
			primaryField: 'post',
			mediaField: 'icon',
		},
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

		return items.reduce( ( acc: Record< string, PostItem >, item: ReaderPost ) => {
			// if item is undefined, skip it
			if ( ! item ) {
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
				render: ( { item }: { item: ReaderPost } ) => {
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
				getValue: ( { item }: { item: ReaderPost } ) =>
					`${ getPostFromItem( item )?.title ?? '' } - ${ item?.site_name ?? '' }`,
				render: ( { item }: { item: ReaderPost } ) => {
					return (
						<RecentPostField
							ref={ ( el ) => {
								itemRefs.current[ item.postId?.toString() ?? '' ] = el;
							} }
							post={ getPostFromItem( item ) }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
				enableGlobalSearch: true,
			},
		],
		[ getPostFromItem ]
	);

	const fetchData = useCallback( () => {
		console.log( 'fetching data' );
		setIsLoading( true );
		dispatch( viewStream( streamKey, window.location.pathname ) as UnknownAction );
		dispatch(
			requestPaginatedStream( {
				streamKey,
				page: view.page,
				perPage: view.perPage,
			} ) as UnknownAction
		);
	}, [ dispatch, view.page, view.perPage, streamKey ] );

	const defaultPaginationInfo = useMemo( () => {
		return {
			totalItems: data?.pagination?.totalItems ?? 0,
			totalPages: data?.pagination?.totalPages ?? 0,
		};
	}, [ data?.pagination ] );

	const { data: shownData, paginationInfo } = useMemo( () => {
		console.log( 'isRequesting', data?.isRequesting );
		const filteredItems = data?.items?.filter( ( item ) => ! item?.isGap );
		console.log( 'filteredItems', filteredItems );
		return filterSortAndPaginate( filteredItems, view, fields );
	}, [ data?.items, view, fields ] );

	console.log( 'shownData', shownData );

	// Fetch the data when the component is mounted or the view changes.
	useEffect( () => {
		console.log( 'view changed', view );
		fetchData();
	}, [ fetchData ] );

	// Set the first item as selected on the current page.
	useEffect( () => {
		if ( isWide && shownData?.length > 0 ) {
			setSelectedItem( shownData[0] || null );
		}
	}, [ isWide, shownData, view ] );

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

	return (
		<div className="recent-feed">
			<div className={ `recent-feed__list-column ${ selectedItem ? 'has-overlay' : '' }` }>
				<div className="recent-feed__list-column-header">
					<NavigationHeader title={ translate( 'Recent' ) }>{ viewToggle }</NavigationHeader>
				</div>
				<aside className="recent-feed__list-column-content">
					<DataViews
						getItemId={ ( item: ReaderPost, index = 0 ) =>
							item.postId?.toString() ?? `item-${ index }`
						}
						view={ view as View }
						fields={ fields }
						data={ shownData }
						onChangeView={ ( newView: View ) => {
							console.log( 'changing view', newView );
							setView( ( prevView ) => ( {
								...prevView,
								type: newView.type,
								fields: newView.fields ?? prevView.fields,
								layout: newView.layout ?? prevView.layout,
								perPage: newView.perPage ?? prevView.perPage,
								page: newView.page ?? prevView.page,
								search: newView.search ?? prevView.search,
							} ) );
						} }
						paginationInfo={ view.search === '' ? defaultPaginationInfo : paginationInfo }
						defaultLayouts={ { list: {} } }
						isLoading={ isLoading }
						selection={ selectedItem ? [ selectedItem.postId?.toString() ] : [] }
						onChangeSelection={ ( newSelection: string[] ) => {
							console.log( 'changing selection', newSelection );
							const selectedPost = shownData?.find(
								( item: ReaderPost ) => item?.postId?.toString() === newSelection[ 0 ]
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
				{ ! isLoading && shownData.length === 0 && (
					<EmptyContent
						title={ translate( 'Nothing Posted Yet' ) }
						line={ translate( 'This feed is currently empty.' ) }
						illustration="/calypso/images/illustrations/illustration-empty-results.svg"
						illustrationWidth={ 400 }
					/>
				) }
				{ shownData.length > 0 && selectedItem && getPostFromItem( selectedItem ) && (
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
