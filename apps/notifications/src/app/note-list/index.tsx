import { useNavigator } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import { getFields } from './dataviews';
import type { View } from '@wordpress/dataviews';

const NoteList = () => {
	const { goTo } = useNavigator();
	const notes = useSelector( ( state ) => getAllNotes( state ) );
	const isLoading = useSelector( ( state ) => getIsLoading( state ) );

	const [ view, setView ] = useState< View >( {
		type: 'list',
		titleField: 'title',
		mediaField: 'icon',
		fields: [ 'content', 'date' ],
		page: 1,
		perPage: 10,
	} );

	const fields = getFields();

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( notes, view, fields );

	const onChangeSelection = ( selection: string[] ) => {
		goTo( `/notes/${ selection[ 0 ] }`, { skipFocus: true } );
	};

	return (
		<DataViews< any >
			data={ filteredData }
			fields={ fields }
			view={ view }
			isLoading={ isLoading }
			defaultLayouts={ { table: {} } }
			paginationInfo={ paginationInfo }
			getItemId={ ( item ) => item.id }
			onChangeView={ setView }
			onChangeSelection={ onChangeSelection }
		>
			<>
				<DataViews.Layout />
				<DataViews.Pagination />
			</>
		</DataViews>
	);
};

export default NoteList;
