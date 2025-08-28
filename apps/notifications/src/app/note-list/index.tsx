import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
	useNavigator,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useContext, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import { getFilters } from '../../panel/templates/filters';
import { RestClientContext } from '../context';
import { getFields } from './dataviews';
import type { Note } from '../types';
import type { View } from '@wordpress/dataviews';

const NoteList = ( { filterName }: { filterName: keyof ReturnType< typeof getFilters > } ) => {
	const { goTo } = useNavigator();
	const filter = getFilters()[ filterName ];
	const notes = useSelector( ( state ) =>
		( ( getAllNotes( state ) || [] ) as Note[] ).filter( ( note ) => filter.filter( note ) )
	);

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

	useEffect( () => {
		if ( filterName !== 'all' && notes.length < 10 && ! isLoading ) {
			infiniteScrollHandler();
		}
	}, [ filterName, notes.length, isLoading, infiniteScrollHandler ] );

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
			empty={
				<VStack alignment="center">
					<Text size={ 15 } weight={ 500 }>
						{ filter.emptyMessage }
					</Text>
					<ExternalLink href={ filter.emptyLink }>{ filter.emptyLinkMessage }</ExternalLink>
				</VStack>
			}
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
