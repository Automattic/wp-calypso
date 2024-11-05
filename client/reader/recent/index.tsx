import { DataViews, SupportedLayouts, View } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { FullPostView } from 'calypso/blocks/reader-full-post';
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

	const [ view, setView ] = useState( {
		type: 'table',
		fields: [ 'recent_post', 'seen', 'post' ],
		layout: {
			combinedFields: [
				{
					id: 'recent_post',
					children: [ 'seen', 'post' ],
					direction: 'horizontal',
				},
			],
		},
	} );

	const { data, posts } = useSelector( ( state: AppState ) => {
		const streamData = state.reader?.streams?.following;
		const postsMap: Record< string, PostItem > = {};

		// Create a map of posts for all items
		streamData?.items?.forEach( ( item: ReaderPost ) => {
			const post = getPostByKey( state, {
				feedId: +item.feedId,
				postId: +item.postId,
			} );
			if ( post ) {
				postsMap[ `${ item.feedId }-${ item.postId }` ] = post;
			}
		} );

		return {
			data: streamData,
			posts: postsMap,
		};
	}, shallowEqual );

	const getPostFromItem = ( item: ReaderPost ) => {
		const postKey = `${ item.feedId }-${ item.postId }`;
		return posts[ postKey ];
	};

	const fields = [
		{
			id: 'seen',
			label: translate( 'Seen' ),
			render: ( { item }: { item: ReaderPost } ) => {
				return <RecentSeenField post={ getPostFromItem( item ) } />;
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
	];

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

	// Fetch the data when the component is mounted.
	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	// Set the first item as selected if no item is selected.
	useEffect( () => {
		if ( data?.items?.length > 0 && ! selectedItem ) {
			setSelectedItem( data.items[ 0 ] );
		}
	}, [ data?.items, selectedItem ] );

	return (
		<div className="recent-feed">
			<div className="recent-feed__list-column">
				<h1>{ translate( 'All Recent' ) }</h1>
				<DataViews
					getItemId={ ( item: ReaderPost, index = 0 ) =>
						item.postId?.toString() ?? `item-${ index }`
					}
					view={ view as View }
					fields={ fields }
					data={ data?.items ?? [] }
					onChangeView={ ( newView: View ) =>
						setView( { type: newView.type, fields: newView.fields ?? [], layout: view.layout } )
					}
					paginationInfo={ {
						totalItems: 0,
						totalPages: 0,
					} }
					defaultLayouts={ defaultLayouts as SupportedLayouts }
				/>
			</div>
			<div className="recent-feed__post-column">
				{ selectedItem && getPostFromItem( selectedItem ) && (
					<FullPostView
						post={ getPostFromItem( selectedItem ) }
						referralStream={ window.location.pathname }
						notificationsOpen
					/>
				) }
			</div>
		</div>
	);
};

export default Recent;
