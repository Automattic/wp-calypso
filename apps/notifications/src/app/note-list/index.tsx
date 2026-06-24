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
import { getIsNoteRead } from '../../panel/state/selectors/get-is-note-read';
import getNotes from '../../panel/state/selectors/get-notes';
import getUnreadNoteIds from '../../panel/state/selectors/get-unread-note-ids';
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

// Stable empty selection: DataViews' selection styling is left unused (the open
// note is highlighted via our own `is-active` marker), so this never changes.
const NO_SELECTION: string[] = [];

// DataViews 14 only loads more in response to scroll events, so the rendered
// window (`perPage` rows) must be tall enough to overflow the panel and produce
// a scrollbar. The REST client may fetch smaller network pages
// (`increment_limit`); the effect below loads as many as needed to fill this
// window, so it never outruns the loaded notes.
const NOTES_PER_PAGE = 20;

type NoteListProps = {
	filterName: FilterName;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
};

const NoteList = ( { filterName, selectedNoteId, setSelectedNoteId }: NoteListProps ) => {
	const filter = getFilters()[ filterName ];
	const allNotes = useSelector( ( state ) => getAllNotes( state ) || [] ) as Note[];
	const unreadNoteIds = useSelector( ( state ) => getUnreadNoteIds( state ) ) as number[];

	// "Unread" renders the server's id list; other tabs client-filter the cache.
	// `filter.filter` still runs on top so an in-app read drops out before a refetch.
	let notes: Note[];
	if ( filterName === 'unread' ) {
		const notesById = new Map( allNotes.map( ( note ) => [ note.id, note ] ) );
		notes = unreadNoteIds
			.map( ( id ) => notesById.get( id ) )
			.filter( ( note ): note is Note => !! note )
			.filter( ( note ) => filter.filter( note ) );
	} else {
		notes = allNotes.filter( ( note ) => filter.filter( note ) );
	}

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

	// Drive the client's server-side filter from the active tab. Only "unread"
	// maps to a filter today; other tabs stay client-filtered.
	useEffect( () => {
		client?.setFilter( filterName === 'unread' ? { unread: 1 } : null );
	}, [ client, filterName ] );

	const onChangeSelection = ( selection: string[] ) => {
		const noteId = selection[ 0 ];
		// Toggle off when selecting the same note.
		setSelectedNoteId( noteId !== selectedNoteId ? noteId : undefined );
	};

	const [ initialView, setView ] = useState< View >( {
		type: 'list',
		titleField: 'title',
		descriptionField: 'description',
		mediaField: 'icon',
		fields: [],
		page: 1,
		infiniteScrollEnabled: true,
		startPosition: 1,
		// Group notes into time sections ("Today", "Yesterday", …). `direction` is
		// required by the type but inert, since `timeGroup` opts out of sorting.
		groupBy: { field: 'timeGroup', direction: 'asc', showLabel: false },
	} );

	const view = { ...initialView, perPage: NOTES_PER_PAGE };
	const startPosition = view.startPosition ?? 1;

	// Field identities must stay stable or DataViews remounts every cell per re-render.
	const fields = useMemo( () => getFields(), [] );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		visibleNotes,
		view,
		fields
	);

	// DataViews shows the unread dot from `note.read`, which an in-app read leaves
	// stale. Swap in the effective read state, and tag the open note so its row
	// can render the active highlight. Reuse the note object when neither changed
	// so only the affected rows re-render.
	const notesState = useSelector( getNotes );
	const data = filteredData.map( ( note ) => {
		const isRead = getIsNoteRead( notesState, note );
		const isActive = note.id.toString() === selectedNoteId;
		if ( !! note.read === isRead && ! isActive ) {
			return note;
		}
		return { ...note, read: isRead ? 1 : 0, isActive };
	} );

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

	// Keep enough notes loaded to cover the current scroll window, and to
	// overflow the panel on first paint so a scrollbar exists for DataViews to
	// drive further loading. A network page (`increment_limit`) can be smaller
	// than this window, so fetch one page at a time until the window is filled or
	// the server runs out — re-runs after each page as `visibleNotes` grows.
	useEffect( () => {
		if ( startPosition + NOTES_PER_PAGE > visibleNotes.length && ! isLoading && hasMoreNotes ) {
			infiniteScrollHandler();
		}
	}, [ startPosition, visibleNotes.length, isLoading, hasMoreNotes, infiniteScrollHandler ] );

	// DataViews drives infinite scroll by advancing `startPosition`; the effect
	// above reacts to that and loads more as the window nears the loaded notes.
	const handleChangeView = useCallback( ( nextView: View ) => setView( nextView ), [] );

	const noteListRef = useRef< HTMLObjectElement >( null );

	useNoteListFocusToLastSelectedNote( { noteListRef, notes } );
	useNoteListNavigationKeyboardShortcuts( { noteListRef, visibleNotes } );

	// Loader only until DataViews first mounts, then never again: it binds its
	// scroll listener once, on mount, only if the container exists, so a remount
	// mid-load leaves scrolling dead. In-flight loading uses the `empty` slot.
	const showInitialLoader = ! hasRenderedDataViews.current;

	// Spinner instead of an empty message while the view may still be filling —
	// more cache pages to search, or the Unread fetch in flight.
	const showEmptyLoader = hasMoreNotes || ( filterName === 'unread' && isLoading );

	return (
		<div ref={ noteListRef } className="wpnc__note-list">
			{ ! showInitialLoader ? (
				<DataViews< Note >
					data={ data }
					fields={ fields }
					view={ view }
					isLoading={ isLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
					paginationInfo={ effectivePaginationInfo }
					empty={
						// Spinner while still filling; the real message once settled.
						showEmptyLoader ? (
							<VStack alignment="center" style={ { padding: '40px 0' } }>
								<Spinner />
							</VStack>
						) : (
							<VStack alignment="center">
								<Text size={ 15 } weight={ 500 }>
									{ filter.emptyMessage }
								</Text>
								<ExternalLink href={ filter.emptyLink }>{ filter.emptyLinkMessage }</ExternalLink>
							</VStack>
						)
					}
					getItemId={ ( item ) => item.id.toString() }
					// Keep selection empty so DataViews applies none of its own selected-row
					// styling; the open note is highlighted via our `is-active` marker
					// instead. `onChangeSelection` is still the list layout's only row-click
					// hook, so it stays — it's what opens the note.
					selection={ NO_SELECTION }
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
