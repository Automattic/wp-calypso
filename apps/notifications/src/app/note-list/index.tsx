import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
	Spinner,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import type { FilterName, Note } from '../types';
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

type NoteListProps = {
	filterName: FilterName;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
};

const NoteList = ( { filterName, selectedNoteId, setSelectedNoteId }: NoteListProps ) => {
	const filter = getFilters()[ filterName ];
	const allNotes = useSelector( ( state ) => getAllNotes( state ) || [] ) as Note[];
	const notes = allNotes.filter( ( note ) => filter.filter( note ) );
	// Filter out hidden notes, i.e. notes that have been just marked as spam or moved to the trash.
	const hiddenNoteIds = useSelector( ( state ) => getHiddenNoteIds( state ) );
	const visibleNotes = notes.filter( ( note ) => hiddenNoteIds[ note.id ] !== true );

	const isLoading = useSelector( ( state ) => getIsLoading( state ) );
	const { client } = useAppContext();

	// DataViews 14 binds its infinite-scroll listener in an effect that runs
	// once and only attaches if the scroll container exists at that point.
	// That container is rendered only after DataViews' `hasInitiallyLoaded`
	// turns true, which is seeded from `! isLoading` on the first render. If
	// DataViews first renders while notes are still loading, the listener is
	// never bound and scroll-driven loading stays dead until the list
	// remounts (e.g. on a tab switch). Defer mounting DataViews until the
	// first load settles so it always mounts with the container present.
	const hasRenderedDataViews = useRef( false );
	if ( ! isLoading ) {
		hasRenderedDataViews.current = true;
	}

	const onChangeSelection = ( selection: string[] ) => {
		const noteId = selection[ 0 ];
		// Toggle off when selecting the same note.
		setSelectedNoteId( noteId !== selectedNoteId ? noteId : undefined );
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

	// Field identities must stay stable or DataViews remounts every cell per re-render.
	const fields = useMemo( () => getFields(), [] );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		visibleNotes,
		view,
		fields
	);

	// `filterSortAndPaginate` reports `totalItems` as the count of notes loaded
	// so far. DataViews advances its infinite-scroll window only while
	// `totalItems` stays ahead of the window, so reporting the loaded count
	// alone stalls scrolling after the first page: the window catches up, no
	// `onChangeView` fires, and `loadMore()` is never called again. Report an
	// optimistic total while the REST client still has notes left to fetch so
	// DataViews keeps advancing the window and driving `loadMore()`.
	const hasMoreNotes = client?.hasMoreNotes() ?? false;
	const effectivePaginationInfo = hasMoreNotes
		? { ...paginationInfo, totalItems: paginationInfo.totalItems + NOTES_PER_PAGE }
		: paginationInfo;

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
			{ hasRenderedDataViews.current ? (
				<DataViews< Note >
					data={ filteredData }
					fields={ fields }
					view={ view }
					isLoading={ isLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
					paginationInfo={ effectivePaginationInfo }
					empty={
						<VStack alignment="center">
							<Text size={ 15 } weight={ 500 }>
								{ filter.emptyMessage }
							</Text>
							<ExternalLink href={ filter.emptyLink }>{ filter.emptyLinkMessage }</ExternalLink>
						</VStack>
					}
					getItemId={ ( item ) => item.id.toString() }
					selection={ selectedNoteId ? [ selectedNoteId ] : [] }
					onChangeView={ handleChangeView }
					onChangeSelection={ onChangeSelection }
				>
					<DataViews.Layout />
				</DataViews>
			) : (
				<VStack alignment="center" style={ { padding: '40px 0' } }>
					<Spinner />
				</VStack>
			) }
		</div>
	);
};

export default NoteList;
