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
import { requestPage } from 'calypso/state/reader/streams/actions';
import { viewStream } from 'calypso/state/reader-ui/actions';
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
		fields: [ 'seen', 'post' ],
	} );

	const data = useSelector( ( state: AppState ) => state.reader?.streams?.recent );

	const posts = useSelector( ( state: AppState ) => {
		const items = data?.items;
		if ( ! items ) {
			return {};
		}

		return items.reduce( ( acc: Record< string, PostItem >, item: ReaderPost ) => {
			const post = getPostByKey( state, {
				feedId: item.blogId,
				postId: item.postId,
			} );
			if ( post ) {
				acc[ `${ item.blogId }-${ item.postId }` ] = post;
			}
			return acc;
		}, {} );
	}, shallowEqual );

	const getPostFromItem = useCallback(
		( item: ReaderPost ) => {
			const postKey = `${ item.blogId }-${ item.postId }`;
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
			},
			{
				id: 'post',
				label: translate( 'Post' ),
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		dispatch( ( requestPage as any )( { streamKey: 'recent' } ) );
	}, [ dispatch ] );

	const { data: shownData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data?.items ?? [], view, fields );
	}, [ data, view, fields ] );

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
							setView( { type: newView.type, fields: newView.fields ?? [], layout: view.layout } )
						}
						paginationInfo={ paginationInfo }
						defaultLayouts={ defaultLayouts as SupportedLayouts }
					/>
				</div>
			</div>
			<div className={ `recent-feed__post-column ${ selectedItem ? 'overlay' : '' }` }>
				{ selectedItem && getPostFromItem( selectedItem ) && (
					<AsyncLoad
						require="calypso/blocks/reader-full-post"
						blogId={ selectedItem.blogId }
						postId={ selectedItem.postId }
						onClose={ () => setSelectedItem( null ) }
						layout="recent"
					/>
				) }
			</div>
		</div>
	);
};

export default Recent;
