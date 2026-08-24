/**
 * The single boundary between the dashboard and the notifications engine
 * (`@automattic/notifications`). Nothing else in `client/dashboard` may import
 * that package: the inbox screen consumes the engine exclusively through this
 * module. The engine (REST client + Redux store) is a process-wide singleton
 * already booted by the omnibar bell; this adapter joins it, it never owns it.
 *
 * Import allowlist (see REDTEAM-D2 guardrail 9): `src/app/client`,
 * `src/panel/state/**`, `src/panel/templates/filters`. `src/app/types` is
 * type-only and erased at compile time.
 */
import { getClient, initClient } from '@automattic/notifications/src/app/client';
import { store } from '@automattic/notifications/src/panel/state';
import actions from '@automattic/notifications/src/panel/state/actions';
import getAllNotes from '@automattic/notifications/src/panel/state/selectors/get-all-notes';
import getFilteredLoading from '@automattic/notifications/src/panel/state/selectors/get-filtered-loading';
import getFilteredNoteIds from '@automattic/notifications/src/panel/state/selectors/get-filtered-note-ids';
import getHiddenNoteIds from '@automattic/notifications/src/panel/state/selectors/get-hidden-note-ids';
import getIsLoading from '@automattic/notifications/src/panel/state/selectors/get-is-loading';
import getIsNoteRead from '@automattic/notifications/src/panel/state/selectors/get-is-note-read';
import { getFilters } from '@automattic/notifications/src/panel/templates/filters';
import { createContext, createElement } from 'react';
import { Provider, createSelectorHook } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import type { Note } from '@automattic/notifications/src/app/types';
import type { ReactNode } from 'react';
import type { ReactReduxContextValue } from 'react-redux';

export type { Note };

export type FilterName = 'all' | 'unread' | 'comments' | 'follows' | 'likes';

export type VisibleNotes = {
	notes: Note[];
	isLoading: boolean;
	hasInitiallyLoaded: boolean;
};

export const notesStore = store;

// Dedicated context so these hooks never collide with another react-redux
// Provider in the tree.
const NotesContext = createContext< ReactReduxContextValue | null >( null );
const useNotesSelector = createSelectorHook( NotesContext );

export function NotesProvider( { children }: { children: ReactNode } ) {
	return createElement( Provider, { store: notesStore, context: NotesContext, children } );
}

export function normalizeNoteId( id: number | string | undefined ): number | null {
	const noteId = Number( id );
	return Number.isInteger( noteId ) && noteId > 0 ? noteId : null;
}

// Mirrors the redesign note list's tab semantics (apps/notifications
// src/app/note-list/index.tsx): the All tab renders the whole store; a
// filtered tab renders the server's cached id list for its filter, with the
// tab's client predicate on top so in-app changes (e.g. reading a note on
// Unread) drop out before a refetch. Hidden notes (just trashed/spammed) are
// excluded. Loading is scoped to the tab so another tab's fetch can't show a
// loader over this one's cached notes.
export function computeVisibleNotes(
	tab: FilterName,
	allNotes: Note[],
	cachedNoteIds: number[] | undefined,
	hiddenNoteIds: Record< number, boolean >,
	isLoading: boolean,
	filteredLoading: string | null,
	matches: ( note: Note ) => boolean
): VisibleNotes {
	const isAllTab = tab === 'all';

	const notesById = new Map( allNotes.map( ( note ) => [ note.id, note ] ) );
	const source = isAllTab
		? allNotes
		: ( cachedNoteIds ?? [] )
				.map( ( id ) => notesById.get( id ) )
				.filter( ( note ): note is Note => !! note );

	const notes = source
		.filter( ( note ) => matches( note ) )
		.filter( ( note ) => hiddenNoteIds[ note.id ] !== true );

	const loading = isAllTab ? isLoading && ! filteredLoading : filteredLoading === tab;
	const hasInitiallyLoaded = isAllTab ? ! loading : cachedNoteIds !== undefined;

	return { notes, isLoading: loading, hasInitiallyLoaded };
}

/**
 * The visible notes for a tab, with each note's `read` field normalized to its
 * effective state (server value + local optimistic override). Note objects are
 * reused when unchanged so only affected rows re-render.
 */
export function useVisibleNotes( tab: FilterName ): VisibleNotes {
	const result = useNotesSelector( ( state ) => {
		const { notes, isLoading, hasInitiallyLoaded } = computeVisibleNotes(
			tab,
			( getAllNotes( state ) || [] ) as Note[],
			getFilteredNoteIds( state, tab ),
			getHiddenNoteIds( state ),
			getIsLoading( state ),
			getFilteredLoading( state ),
			getFilters()[ tab ].filter
		);

		return {
			notes: notes.map( ( note: Note ) => {
				const isRead = getIsNoteRead( state, note );
				return !! note.read === isRead ? note : { ...note, read: isRead ? 1 : 0 };
			} ),
			isLoading,
			hasInitiallyLoaded,
		};
	}, areVisibleNotesEqual );

	return result;
}

function areVisibleNotesEqual( a: VisibleNotes, b: VisibleNotes ): boolean {
	return (
		a.isLoading === b.isLoading &&
		a.hasInitiallyLoaded === b.hasInitiallyLoaded &&
		a.notes.length === b.notes.length &&
		a.notes.every( ( note, i ) => note === b.notes[ i ] )
	);
}

export function countUnreadNotes(
	allNotes: Note[],
	hiddenNoteIds: Record< number, boolean >,
	matches: ( note: Note ) => boolean
): number {
	return allNotes.filter( ( note ) => matches( note ) && hiddenNoteIds[ note.id ] !== true ).length;
}

/**
 * The number of loaded, non-hidden notes that are unread (server value +
 * local optimistic reads). Counts what the store holds, so it is a lower
 * bound — the engine pages notes in and the API exposes no total. Derived
 * from store data, never from the unseen stream (guardrail 11).
 */
export function useUnreadCount(): number {
	return useNotesSelector( ( state ) =>
		countUnreadNotes(
			( getAllNotes( state ) || [] ) as Note[],
			getHiddenNoteIds( state ),
			getFilters().unread.filter
		)
	);
}

export function useNote( id: number | string | undefined ): Note | undefined {
	const noteId = normalizeNoteId( id );
	return useNotesSelector( ( state ) =>
		noteId === null
			? undefined
			: ( getAllNotes( state ) as Note[] ).find( ( note ) => note.id === noteId )
	);
}

let activeTab: FilterName = 'all';

/**
 * Set the engine's active tab. Call on mount and on every tab change: the
 * client's filter is process-global and the bell dropdown resets it to `all`
 * whenever it opens, so the inbox must re-assert its own tab (REDTEAM-D2
 * finding 2).
 */
export function setActiveTab( tab: FilterName ): void {
	activeTab = tab;
	getClient()?.setFilter( tab );
}

/**
 * Load the next page for a tab. Always re-asserts the filter first — a bare
 * `loadMore()` pages whichever list the global filter last pointed at.
 */
export function loadMoreFor( tab: FilterName ): void {
	const client = getClient();
	if ( ! client ) {
		return;
	}
	client.setFilter( tab );
	client.loadMore();
}

export function hasMoreNotesFor( tab: FilterName ): boolean {
	return getClient()?.hasMoreNotes( tab ) ?? false;
}

/**
 * Open a note: select it in the engine, which marks it read for free via the
 * SELECT_NOTE middleware. If the note isn't loaded yet (deep link, hard
 * reload), fetch it first and select once it lands — the mark-read middleware
 * no-ops when the note is missing from the store. Returns a cancel function
 * for unmount.
 */
export function openNote( id: number | string ): () => void {
	const noteId = normalizeNoteId( id );
	if ( noteId === null ) {
		return () => {};
	}

	const findNote = () =>
		( getAllNotes( notesStore.getState() ) as Note[] ).find( ( note ) => note.id === noteId );
	const select = () => notesStore.dispatch( actions.ui.selectNote( noteId ) );

	if ( findNote() ) {
		select();
		return () => {};
	}

	getClient()?.getNote( noteId );

	let cancelled = false;
	const unsubscribe = notesStore.subscribe( () => {
		if ( cancelled ) {
			return;
		}
		if ( findNote() ) {
			cancelled = true;
			unsubscribe();
			select();
		}
	} );

	return () => {
		cancelled = true;
		unsubscribe();
	};
}

function reassertEngineState() {
	const client = getClient();
	if ( ! client ) {
		return;
	}
	client.setVisibility( { isShowing: true, isVisible: ! document.hidden } );
	client.setFilter( activeTab );
}

/**
 * Declare the inbox visible to the engine for as long as it is mounted.
 * `isShowing` is a single boolean shared with the bell dropdown, which sets it
 * false whenever it closes — even while the inbox is on screen (REDTEAM-D2
 * finding 1). So besides setting it on acquire, re-assert it (and the active
 * tab) on window focus. Returns the release function for unmount.
 */
export function acquireEngineVisibility(): () => void {
	initClient( wpcom );
	reassertEngineState();
	window.addEventListener( 'focus', reassertEngineState );

	return () => {
		window.removeEventListener( 'focus', reassertEngineState );
		getClient()?.setVisibility( { isShowing: false, isVisible: ! document.hidden } );
	};
}
