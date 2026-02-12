import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
	useNavigator,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getHiddenNoteIds from '../../panel/state/selectors/get-hidden-note-ids';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import { getFilters } from '../../panel/templates/filters';
import { useAppContext } from '../context';
import { getFields } from './dataviews';
import {
	useNoteListFocusToLastSelectedNote,
	useNoteListNavigationKeyboardShortcuts,
} from './hooks';
import type { Note } from '../types';
import type { View } from '@wordpress/dataviews';

import './style.scss';

const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};

const NoteList = ( { filterName }: { filterName: keyof ReturnType< typeof getFilters > } ) => {
	const { goTo } = useNavigator();
	const filter = getFilters()[ filterName ];
	const allNotes = useSelector( ( state ) => getAllNotes( state ) || [] ) as Note[];
	const notes = allNotes.filter( ( note ) => filter.filter( note ) );
	// Filter out hidden notes, i.e. notes that have been just marked as spam or moved to the trash.
	const hiddenNoteIds = useSelector( ( state ) => getHiddenNoteIds( state ) );
	const visibleNotes = notes.filter( ( note ) => hiddenNoteIds[ note.id ] !== true );

	const isLoading = useSelector( ( state ) => getIsLoading( state ) );
	const { client } = useAppContext();

	const onChangeSelection = ( selection: string[] ) => {
		const noteId = selection[ 0 ];
		goTo( `/${ filterName }/notes/${ noteId }` );
	};

	const [ initialView, setView ] = useState< View >( {
		type: 'list',
		titleField: 'title',
		mediaField: 'icon',
		fields: [ 'info' ],
		page: 1,
		infiniteScrollEnabled: true,
	} );

	const view = { ...initialView, perPage: visibleNotes.length };

	const fields = getFields();

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		visibleNotes,
		view,
		fields
	);

	const infiniteScrollHandler = useCallback( () => {
		if ( ! isLoading ) {
			client?.loadMore();
		}
	}, [ client, isLoading ] );

	useEffect( () => {
		if ( visibleNotes.length <= 10 && ! isLoading ) {
			infiniteScrollHandler();
		}
	}, [ visibleNotes.length, isLoading, infiniteScrollHandler ] );

	const noteListRef = useRef< HTMLObjectElement >( null );

	useNoteListFocusToLastSelectedNote( { noteListRef, notes } );
	useNoteListNavigationKeyboardShortcuts( { noteListRef, visibleNotes } );

	return (
		<div ref={ noteListRef } className="wpnc__note-list">
			<DataViews< Note >
				data={ filteredData }
				fields={ fields }
				view={ view }
				isLoading={ isLoading }
				defaultLayouts={ DEFAULT_LAYOUTS }
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
