import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, filterSortAndPaginate, SupportedLayouts, View } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { requestPaginatedStream } from 'calypso/state/reader/streams/actions';
import { viewStream } from 'calypso/state/reader-ui/actions';
import EngagementBar from './engagement-bar';
import RecentPostField from './recent-post-field';
import RecentSeenField from './recent-seen-field';
import type { PostItem, ReaderPost } from './types';
import type { AppState } from 'calypso/types';
import './style.scss';

const Recent = () => {
	const dispatch = useDispatch< ThunkDispatch< AppState, void, AnyAction > >();
	const [ selectedItem, setSelectedItem ] = useState< ReaderPost | null >( null );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );

	const [ view, setView ] = useState< View >( {
		type: 'table',
		search: '',
		fields: [ 'seen', 'post' ],
		perPage: 10,
		page: 1,
	} );

	const data = useSelector( ( state: AppState ) => state.reader?.streams?.recent );

	const posts = useSelector( ( state: AppState ) => {
		const items = data?.items;
		if ( ! items ) {
			return {};
		}

		return items.reduce( ( acc: Record< string, PostItem >, item: ReaderPost ) => {
			const post = getPostByKey( state, {
				feedId: item.feedId,
				postId: item.postId,
			} );
			if ( post ) {
				acc[ `${ item.feedId }-${ item.postId }` ] = post;
			}
			return acc;
		}, {} );
	}, shallowEqual );

	const getPostFromItem = useCallback(
		( item: ReaderPost ) => {
			const postKey = `${ item.feedId }-${ item.postId }`;
			return posts[ postKey ];
		},
		[ posts ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'seen',
				label: translate( 'Seen' ),
				render: ( { item }: { item: ReaderPost } ) => {
					return (
						<RecentSeenField
							item={ item }
							post={ getPostFromItem( item ) }
							setSelectedItem={ setSelectedItem }
						/>
					);
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
							item={ item }
							post={ getPostFromItem( item ) }
							setSelectedItem={ setSelectedItem }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
				enableGlobalSearch: true,
			},
		],
		[ getPostFromItem, setSelectedItem ]
	);

	const defaultLayouts = [
		{
			label: translate( 'Table' ),
			icon: 'table-view',
		},
	];

	const fetchData = useCallback( () => {
		dispatch( viewStream( 'recent', window.location.pathname ) as AnyAction );
		dispatch(
			requestPaginatedStream( {
				streamKey: 'recent',
				page: view.page,
				perPage: view.perPage,
			} ) as AnyAction
		);
		// Fetch the next page in advance.
		dispatch(
			requestPaginatedStream( {
				streamKey: 'recent',
				page: view?.page ? view.page + 1 : undefined,
				perPage: view.perPage,
			} ) as AnyAction
		);
	}, [ dispatch, view ] );

	const paginationInfo = useMemo( () => {
		return {
			totalItems: data?.pagination?.totalItems ?? 0,
			totalPages: data?.pagination?.totalPages ?? 0,
		};
	}, [ data?.pagination ] );

	const { data: shownData } = useMemo( () => {
		return filterSortAndPaginate( data?.items ?? [], view, fields );
	}, [ data?.items, view, fields ] );

	// Fetch the data when the component is mounted.
	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	// Set the first item as selected if no item is selected and screen is wide.
	useEffect( () => {
		if ( isWide && data?.items?.length > 0 && ! selectedItem ) {
			setSelectedItem( data.items[ 0 ] );
		}
	}, [ isWide, data?.items, selectedItem ] );

	return (
		<div className="recent-feed">
			<div className={ `recent-feed__list-column ${ selectedItem ? 'has-overlay' : '' }` }>
				<div className="recent-feed__list-column-header">
					<FormattedHeader align="left" headerText={ translate( 'All Recent' ) } />
				</div>
				<div className="recent-feed__list-column-content">
					<DataViews
						getItemId={ ( item: ReaderPost, index = 0 ) =>
							item.postId?.toString() ?? `item-${ index }`
						}
						view={ view as View }
						fields={ fields }
						data={ shownData }
						onChangeView={ ( newView: View ) =>
							setView( {
								type: newView.type,
								fields: newView.fields ?? [],
								layout: view.layout,
								perPage: newView.perPage,
								page: newView.page,
								search: newView.search,
							} )
						}
						paginationInfo={ paginationInfo }
						defaultLayouts={ defaultLayouts as SupportedLayouts }
						isLoading={ data?.isRequesting }
					/>
				</div>
			</div>
			<div className={ `recent-feed__post-column ${ selectedItem ? 'overlay' : '' }` }>
				{ selectedItem && getPostFromItem( selectedItem ) && (
					<>
						<AsyncLoad
							require="calypso/blocks/reader-full-post"
							feedId={ selectedItem.feedId }
							postId={ selectedItem.postId }
							onClose={ () => setSelectedItem( null ) }
							layout="recent"
						/>
						<EngagementBar feedId={ selectedItem?.feedId } postId={ selectedItem?.postId } />
					</>
				) }
			</div>
		</div>
	);
};

export default Recent;
