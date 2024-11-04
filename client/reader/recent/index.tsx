import { Button } from '@wordpress/components';
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
import type { AppState } from 'calypso/types';
import './style.scss';

interface ReaderPost {
	site_name: string;
	postId: number;
	feedId: number;
}

const Recent = () => {
	const dispatch = useDispatch< ThunkDispatch< AppState, void, AnyAction > >();

	const [ selectedItem, setSelectedItem ] = useState< ReaderPost | null >( null );

	const [ view, setView ] = useState( {
		type: 'list',
		fields: [ 'post' ],
	} );

	const { data, post } = useSelector(
		( state: AppState ) => ( {
			data: state.reader?.streams?.following,
			post: selectedItem
				? getPostByKey( state, {
						feedId: +selectedItem.feedId,
						postId: +selectedItem.postId,
				  } )
				: null,
		} ),
		shallowEqual
	);

	const fields = [
		{
			id: 'post',
			label: translate( 'Blog' ),
			render: ( { item }: { item: ReaderPost } ) => {
				return <Button onClick={ () => setSelectedItem( item ) }>{ item.site_name }</Button>;
			},
			enableHiding: false,
		},
	];

	const defaultLayouts = [
		{
			label: translate( 'List' ),
			icon: 'list-view',
		},
	];

	const fetchData = useCallback( () => {
		dispatch( viewStream( 'following', window.location.pathname ) as AnyAction );
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		dispatch( ( requestPage as any )( { streamKey: 'following' } ) );
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
						setView( { type: newView.type, fields: newView.fields ?? [] } )
					}
					paginationInfo={ {
						totalItems: 0,
						totalPages: 0,
					} }
					defaultLayouts={ defaultLayouts as SupportedLayouts }
				/>
			</div>
			<div className="recent-feed__post-column">
				{ selectedItem && post && (
					<FullPostView
						post={ post }
						referralStream={ window.location.pathname }
						notificationsOpen
					/>
				) }
			</div>
		</div>
	);
};

export default Recent;
