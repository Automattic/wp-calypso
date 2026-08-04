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
import getFilteredLoading from '../../panel/state/selectors/get-filtered-loading';
import getFilteredNoteIds from '../../panel/state/selectors/get-filtered-note-ids';
import getHiddenNoteIds from '../../panel/state/selectors/get-hidden-note-ids';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import { getIsNoteRead } from '../../panel/state/selectors/get-is-note-read';
import getNotes from '../../panel/state/selectors/get-notes';
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
	const isAllTab = filterName === 'all';
	const allNotes = useSelector( ( state ) => getAllNotes( state ) || [] ) as Note[];
	// This tab's cached id list, keyed by tab name, or undefined until its first
	// fetch. A tab never reads the previous tab's list.
	const cachedNoteIds = useSelector( ( state ) => getFilteredNoteIds( state, filterName ) ) as
		| number[]
		| undefined;
	const hiddenNoteIds = useSelector( ( state ) => getHiddenNoteIds( state ) );
	const isLoading = useSelector( ( state ) => getIsLoading( state ) );
	const filteredLoading = useSelector( ( state ) => getFilteredLoading( state ) );
	const { client } = useAppContext();

	// Everything the render needs that depends on which tab is active, derived in
	// one place so the All-vs-filtered split lives here and nowhere else.
	const tab = useMemo( () => {
		const { filter: matches } = getFilters()[ filterName ];

		// The All tab renders the whole store; a filtered tab renders the server's
		// id list for its filter. `matches` still runs on top so an in-app change
		// (e.g. reading a note on Unread) drops it out before a refetch.
		const notesById = new Map( allNotes.map( ( note ) => [ note.id, note ] ) );
		const source = isAllTab
			? allNotes
			: ( cachedNoteIds ?? [] )
					.map( ( id ) => notesById.get( id ) )
					.filter( ( note ): note is Note => !! note );
		const notes = source.filter( ( note ) => matches( note ) );

		// Loading scoped to this tab, so another tab's fetch (or the background
		// poll) can't show a loader over this one's cached notes. A filtered tab
		// loads only while its own fetch is in flight; the All tab uses the shared
		// flag, but not while a filtered fetch owns it.
		const loading = isAllTab ? isLoading && ! filteredLoading : filteredLoading === filterName;

		// Whether this tab's first load has settled — the All tab once its fetch is
		// done, a filtered tab once its cached list exists (even empty).
		const hasInitiallyLoaded = isAllTab ? ! loading : cachedNoteIds !== undefined;

		return { notes, isLoading: loading, hasInitiallyLoaded };
	}, [ isAllTab, allNotes, cachedNoteIds, isLoading, filteredLoading, filterName ] );

	// Filter out hidden notes, i.e. notes that have been just marked as spam or moved to the trash.
	const visibleNotes = tab.notes.filter( ( note ) => hiddenNoteIds[ note.id ] !== true );

	// DataViews binds its infinite-scroll listener once, on mount, and only after it
	// first renders as not-loading (with its scroll container present). So mount it
	// only once this tab's first load has settled, and pass it isLoading={false}
	// from then on. A cached tab is already settled, so switching back mounts it
	// immediately, with its rows.
	const hasInitiallyLoadedRef = useRef( false );
	if ( tab.hasInitiallyLoaded ) {
		hasInitiallyLoadedRef.current = true;
	}

	// Drive the client's active tab; it refetches (or shows the cached list) on change.
	useEffect( () => {
		client?.setFilter( filterName );
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
	// Pass the rendered tab: the client's own `filterName` lags a render behind
	// a switch, which would answer for the previous tab and stall scroll.
	const hasMoreNotes = client?.hasMoreNotes( filterName ) ?? false;
	const effectivePaginationInfo = hasMoreNotes
		? { ...paginationInfo, totalItems: paginationInfo.totalItems + NOTES_PER_PAGE }
		: paginationInfo;

	const infiniteScrollHandler = useCallback( () => {
		if ( ! isLoading ) {
			client?.loadMore();
		}
	}, [ client, isLoading ] );

	// Fetch pages until the window is filled (a network page can be smaller), so a
	// short list still overflows the panel and gets a scrollbar to drive more.
	// Depend on `cachedNoteIds` by reference, not length: a same-length refresh must
	// still re-run this to retry a `loadMore` the client's in-flight lock had
	// blocked — else a switch back to a short cached tab strands it with no scrollbar.
	useEffect( () => {
		if ( startPosition + NOTES_PER_PAGE > visibleNotes.length && ! isLoading && hasMoreNotes ) {
			infiniteScrollHandler();
		}
	}, [
		startPosition,
		visibleNotes.length,
		cachedNoteIds,
		isLoading,
		hasMoreNotes,
		infiniteScrollHandler,
	] );

	// DataViews drives infinite scroll by advancing `startPosition`; the effect
	// above reacts to that and loads more as the window nears the loaded notes.
	const handleChangeView = useCallback( ( nextView: View ) => setView( nextView ), [] );

	const noteListRef = useRef< HTMLObjectElement >( null );

	useNoteListFocusToLastSelectedNote( { noteListRef, notes: tab.notes } );
	useNoteListNavigationKeyboardShortcuts( { noteListRef, visibleNotes } );

	// Spinner instead of an empty message while the view may still be filling: more
	// notes to page, this tab's fetch in flight, or a tab never fetched yet (no
	// cached list).
	const showEmptyLoader =
		hasMoreNotes || ( ! isAllTab && ( cachedNoteIds === undefined || tab.isLoading ) );

	// `groupBy` forces DataViews' list layout off its infinite-scroll path, which
	// is the only path that renders its built-in load-more spinner — so we render
	// our own at the foot of the list. Key it on "more to load" rather than the
	// in-flight fetch so it's already present when the bottom scrolls into view,
	// not a beat later once `loadMore` dispatches. An empty list uses the `empty`
	// slot above instead.
	const showLoadMore = hasMoreNotes && data.length > 0;

	// Full-panel spinner until this tab's first load settles; after that DataViews
	// is mounted and in-flight loading shows in the `empty` slot or the foot.
	if ( ! hasInitiallyLoadedRef.current ) {
		return (
			<div ref={ noteListRef } className="wpnc__note-list">
				<VStack alignment="center" style={ { padding: '40px 0' } }>
					<Spinner />
				</VStack>
			</div>
		);
	}

	return (
		<div ref={ noteListRef } className="wpnc__note-list">
			<DataViews< Note >
				data={ data }
				fields={ fields }
				view={ view }
				// We drive all loading UI ourselves (full-panel spinner before mount,
				// the `empty` slot and our load-more spinner after), and never want
				// DataViews to hide the cached rows it just mounted with.
				isLoading={ false }
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
				{ showLoadMore && (
					// DataViews suppresses its own load-more spinner when notes are
					// grouped, so this stands in for it, pinned below the list rows.
					<VStack alignment="center" style={ { flexShrink: 0, padding: '12px 0' } }>
						<Spinner />
					</VStack>
				) }
			</DataViews>
		</div>
	);
};

export default NoteList;
