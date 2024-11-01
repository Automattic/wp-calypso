import { DataViews, SupportedLayouts, View } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { requestPage } from 'calypso/state/reader/streams/actions';
import { viewStream } from 'calypso/state/reader-ui/actions';
import type { AppState } from 'calypso/types';

const Recent = () => {
	const dispatch = useDispatch();

	const [ view, setView ] = useState( {
		type: 'list',
		fields: [ 'site_name' ],
	} );
	const fields = [
		{
			id: 'site_name',
			label: translate( 'Blog' ),
			enableHiding: false,
		},
	];
	const defaultLayouts = [
		{
			label: translate( 'List' ),
			icon: 'list-view',
		},
	];
	const data = useSelector( ( state: AppState ) => {
		return state.reader?.streams?.following;
	}, shallowEqual );

	const fetchData = useCallback( () => {
		dispatch( viewStream( 'following', window.location.pathname ) as AnyAction );
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		dispatch( ( requestPage as any )( { streamKey: 'following' } ) );
	}, [ dispatch ] );

	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	return (
		<DataViews
			getItemId={ ( item: { postId?: number | string }, index = 0 ) =>
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
	);
};

export default Recent;
