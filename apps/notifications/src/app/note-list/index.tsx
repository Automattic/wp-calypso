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

// DataViews 14 only loads more in response to scroll events, so the rendered
// window (`perPage` rows) must be tall enough to overflow the panel and
// produce a scrollbar. It must also match the REST client's `increment_limit`
// so the window never advances past the notes already fetched.
const NOTES_PER_PAGE = 20;

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
		startPosition: 1,
	} );

	const view = { ...initialView, perPage: NOTES_PER_PAGE };

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

	// Bootstrap: keep loading until enough notes exist to fill a window and
	// overflow the panel. Without this the initial batch can be too short to
	// produce a scrollbar, and scroll-driven loading would never start.
	useEffect( () => {
		if ( visibleNotes.length <= NOTES_PER_PAGE && ! isLoading ) {
			infiniteScrollHandler();
		}
	}, [ visibleNotes.length, isLoading, infiniteScrollHandler ] );

	const handleChangeView = useCallback(
		( nextView: View ) => {
			setView( nextView );

			// DataViews drives infinite scroll by advancing `startPosition`.
			// Load more notes once the scroll window nears the end of those
			// already loaded.
			const start = nextView.startPosition ?? 1;
			const perPage = nextView.perPage ?? NOTES_PER_PAGE;
			if ( start + perPage > visibleNotes.length ) {
				infiniteScrollHandler();
			}
		},
		[ visibleNotes.length, infiniteScrollHandler ]
	);

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
				paginationInfo={ paginationInfo }
				empty={
					<VStack alignment="center">
						<Text size={ 15 } weight={ 500 }>
							{ filter.emptyMessage }
						</Text>
						<ExternalLink href={ filter.emptyLink }>{ filter.emptyLinkMessage }</ExternalLink>
					</VStack>
				}
				getItemId={ ( item ) => item.id.toString() }
				onChangeView={ handleChangeView }
				onChangeSelection={ onChangeSelection }
			>
				<DataViews.Layout />
			</DataViews>
		</div>
	);
};

export default NoteList;
