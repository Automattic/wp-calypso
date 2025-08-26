import { useNavigator } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useContext, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import { RestClientContext } from '../context';
import { getFields } from './dataviews';
import type { Note } from '../types';
import type { View } from '@wordpress/dataviews';

const NoteList = () => {
	const { goTo } = useNavigator();
	const notes = useSelector( ( state ) => getAllNotes( state ) );
	const isLoading = useSelector( ( state ) => getIsLoading( state ) );
	const restClient = useContext( RestClientContext );

	const [ view, setView ] = useState< View >( {
		type: 'list',
		titleField: 'title',
		mediaField: 'icon',
		fields: [ 'content', 'date' ],
		page: 1,
		perPage: 10,
		infiniteScrollEnabled: true,
	} );

	const fields = getFields();

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( notes, view, fields );

	const onChangeSelection = ( selection: string[] ) => {
		goTo( `/notes/${ selection[ 0 ] }`, { skipFocus: true } );
	};

	const infiniteScrollHandler = useCallback( () => {
		if ( ! isLoading ) {
			restClient?.loadMore();
		}
	}, [ restClient, isLoading ] );

	useEffect( () => {
		setView( ( currentView ) => ( { ...currentView, perPage: notes.length } ) );
	}, [ notes.length ] );

	return (
		<DataViews< Note >
			data={ filteredData }
			fields={ fields }
			view={ view }
			isLoading={ isLoading }
			defaultLayouts={ { table: {} } }
			paginationInfo={ {
				...paginationInfo,
				infiniteScrollHandler,
			} }
			getItemId={ ( item ) => item.id.toString() }
			onChangeView={ setView }
			onChangeSelection={ onChangeSelection }
		>
			<>
				<DataViews.Layout />
			</>
		</DataViews>
	);
};

export default NoteList;
