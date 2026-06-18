import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
	Spinner,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
		mediaField: 'icon',
		fields: [ 'info' ],
		page: 1,
		infiniteScrollEnabled: true,
		startPosition: 1,
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
	// stale. Swap in the effective read state, reusing the note when unchanged so
	// only the affected row re-renders.
	const notesState = useSelector( getNotes );
	const data = filteredData.map( ( note ) => {
		const isRead = getIsNoteRead( notesState, note );
		return !! note.read === isRead ? note : { ...note, read: isRead ? 1 : 0 };
	} );

	// Report the real loaded count. DataViews advances its infinite-scroll
	// window only while `totalItems` stays ahead of the window; the prefetch
	// effect below keeps a page of notes loaded beyond the window, so the real
	// count stays ahead on its own. An optimistic total instead let DataViews
	// advance the window into not-yet-fetched positions, so the load that filled
	// them arrived asynchronously and DataViews' scroll-anchor restoration then
	// re-applied a stale anchor — yanking the scroll position.
	const hasMoreNotes = client?.hasMoreNotes() ?? false;

	const infiniteScrollHandler = useCallback( () => {
		if ( ! isLoading ) {
			client?.loadMore();
		}
	}, [ client, isLoading ] );

	// Keep a full page of notes loaded *beyond* the current scroll window (and
	// enough to overflow the panel on first paint so a scrollbar exists). This
	// buffer means DataViews only ever advances its window over notes already in
	// hand, so a network page never has to arrive mid-advance — which is what let
	// the scroll-anchor restoration fire against a stale anchor. A network page
	// (`increment_limit`) can be smaller than this window, so fetch one page at a
	// time until the buffer is filled or the server runs out — re-runs after each
	// page as `visibleNotes` grows.
	useEffect( () => {
		if ( startPosition + NOTES_PER_PAGE * 2 > visibleNotes.length && ! isLoading && hasMoreNotes ) {
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

	// DataViews reads `isLoading` as "the list is being (re)built from scratch"
	// and uses its transitions to gate scroll-anchor restoration. Our load-more
	// and the background poll both flip the shared flag while notes are already on
	// screen; surfacing those as loading makes DataViews restore a stale scroll
	// anchor once the async fetch lands, jumping the list. Report loading to
	// DataViews only while there is nothing to show (initial load / empty tab) —
	// incremental appends are not a from-scratch rebuild — and render our own
	// load-more spinner (below) for the in-flight incremental case.
	const isListLoading = isLoading && visibleNotes.length === 0;

	// DataViews' own load-more spinner is gated on the `isLoading` we just scoped
	// off, so render one ourselves into its scroll container — appended after the
	// list so it sits at the end and scrolls with the notes, like the native one.
	const [ scrollContainer, setScrollContainer ] = useState< HTMLElement | null >( null );
	useEffect( () => {
		const node =
			noteListRef.current?.querySelector< HTMLElement >( '.dataviews-layout__container' ) ?? null;
		setScrollContainer( ( prev ) => ( prev === node ? prev : node ) );
	} );
	const showLoadMoreSpinner = isLoading && ! isListLoading && visibleNotes.length > 0;

	return (
		<div ref={ noteListRef } className="wpnc__note-list">
			{ ! showInitialLoader ? (
				<DataViews< Note >
					data={ data }
					fields={ fields }
					view={ view }
					isLoading={ isListLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
					paginationInfo={ paginationInfo }
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
			{ showLoadMoreSpinner &&
				scrollContainer &&
				createPortal(
					<p className="dataviews-loading-more">
						<Spinner />
					</p>,
					scrollContainer
				) }
		</div>
	);
};

export default NoteList;
