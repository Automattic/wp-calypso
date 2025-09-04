import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
	useNavigator,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import getIsNoteHidden from '../../panel/state/selectors/get-is-note-hidden';
import { getFilters } from '../../panel/templates/filters';
import { useAppContext } from '../context';
import { getFields, getActions } from './dataviews';
import type { Note } from '../types';
import type { View } from '@wordpress/dataviews';

import './style.scss';

const NoteList = ( { filterName }: { filterName: keyof ReturnType< typeof getFilters > } ) => {
	const { goTo } = useNavigator();
	const filter = getFilters()[ filterName ];
	const isNoteHidden = useSelector(
		( state ) => ( noteId: number ) => getIsNoteHidden( state, noteId )
	);
	const notes = useSelector( ( state ) =>
		( ( getAllNotes( state ) || [] ) as Note[] ).filter(
			( note ) => filter.filter( note ) && ! isNoteHidden( note.id )
		)
	);

	const isLoading = useSelector( ( state ) => getIsLoading( state ) );
	const { client } = useAppContext();

	const onChangeSelection = ( selection: string[] ) => {
		const noteId = selection[ 0 ];
		goTo( `/${ filterName }/notes/${ noteId }`, {
			focusTargetSelector: `.dataviews-view-list__item[id$="-${ noteId }-item-wrapper"]`,
		} );
	};

	const [ initialView, setView ] = useState< View >( {
		type: 'list',
		titleField: 'title',
		mediaField: 'icon',
		fields: [ 'info' ],
		page: 1,
		infiniteScrollEnabled: true,
	} );

	const view = { ...initialView, perPage: notes.length };

	const fields = getFields();

	const actions = getActions( { onSelect: onChangeSelection } );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( notes, view, fields );

	const infiniteScrollHandler = useCallback( () => {
		if ( ! isLoading ) {
			client?.loadMore();
		}
	}, [ client, isLoading ] );

	useEffect( () => {
		if ( notes.length < 10 && ! isLoading ) {
			infiniteScrollHandler();
		}
	}, [ notes.length, isLoading, infiniteScrollHandler ] );

	return (
		<div className="wpnc__note-list">
			<DataViews< Note >
				data={ filteredData }
				fields={ fields }
				actions={ actions }
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
				<DataViews.Layout />
			</DataViews>
		</div>
	);
};

export default NoteList;
