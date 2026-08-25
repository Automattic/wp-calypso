/**
 * The single boundary between the dashboard and the notifications engine
 * (`@automattic/notifications`). Nothing else in `client/dashboard` may import
 * that package: the inbox screen consumes the engine exclusively through this
 * module. The engine (REST client + Redux store) is a process-wide singleton
 * already booted by the omnibar bell; this adapter joins it, it never owns it.
 *
 * Import allowlist (REDTEAM-D2 guardrail 9, extended for Phase 3):
 * `src/app/client`, `src/panel/state/**`, `src/panel/rest-client/**`,
 * `src/panel/helpers/**`, `src/panel/templates/filters`. `src/app/types` is
 * type-only and erased at compile time.
 */
import { getClient, initClient } from '@automattic/notifications/src/app/client';
import {
	getActions,
	getEditCommentLink,
	getReferenceId,
} from '@automattic/notifications/src/panel/helpers/notes';
import { recordTracksEvent } from '@automattic/notifications/src/panel/helpers/stats';
import { bumpStat } from '@automattic/notifications/src/panel/rest-client/bump-stat';
import { wpcom as getWpcom } from '@automattic/notifications/src/panel/rest-client/wpcom';
import { store } from '@automattic/notifications/src/panel/state';
import actions from '@automattic/notifications/src/panel/state/actions';
import {
	setApproveStatus as setApproveStatusThunk,
	setLikeStatus as setLikeStatusThunk,
	spamNote as spamNoteThunk,
	trashNote as trashNoteThunk,
} from '@automattic/notifications/src/panel/state/notes/thunks';
import getAllNotes from '@automattic/notifications/src/panel/state/selectors/get-all-notes';
import getFilteredLoading from '@automattic/notifications/src/panel/state/selectors/get-filtered-loading';
import getFilteredNoteIds from '@automattic/notifications/src/panel/state/selectors/get-filtered-note-ids';
import getHiddenNoteIds from '@automattic/notifications/src/panel/state/selectors/get-hidden-note-ids';
import getIsLoading from '@automattic/notifications/src/panel/state/selectors/get-is-loading';
import getIsNoteApproved from '@automattic/notifications/src/panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '@automattic/notifications/src/panel/state/selectors/get-is-note-liked';
import getIsNoteRead from '@automattic/notifications/src/panel/state/selectors/get-is-note-read';
import { getFilters } from '@automattic/notifications/src/panel/templates/filters';
import { createContext, createElement, useSyncExternalStore } from 'react';
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
 * Load the next page for a tab. Re-asserts the filter only when the client
 * points elsewhere — `setFilter` on a filtered tab kicks off a head refetch
 * whose in-flight lock would swallow the `loadMore()` right after it, so
 * calling it unconditionally refetches the head forever without ever paging.
 */
export function loadMoreFor( tab: FilterName ): void {
	const client = getClient();
	if ( ! client ) {
		return;
	}
	if ( ( client as { filterName?: string } ).filterName !== tab ) {
		client.setFilter( tab );
	}
	client.loadMore();
}

export function hasMoreNotesFor( tab: FilterName ): boolean {
	return getClient()?.hasMoreNotes( tab ) ?? false;
}

export type ListEndReason = 'exhausted' | 'cap';

/**
 * Why a tab's list stopped loading more: 'exhausted' when the server has no
 * older notes left, 'cap' when the engine's fixed window limit (200 notes on
 * the All tab) was reached while the server may still have more, or null while
 * more can still load. Only meaningful once the tab has initially loaded.
 */
export function getListEndReason( tab: FilterName ): ListEndReason | null {
	const client = getClient();
	if ( ! client || hasMoreNotesFor( tab ) ) {
		return null;
	}
	if ( tab === 'all' ) {
		return ( client as { allNotesLoaded?: boolean } ).allNotesLoaded ? 'exhausted' : 'cap';
	}
	return 'exhausted';
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

export type AvailableNoteActions = {
	replyToComment: boolean;
	likePost: boolean;
	likeComment: boolean;
	approveComment: boolean;
	spamComment: boolean;
	trashComment: boolean;
	editComment: boolean;
	answerPromptHref: string | null;
	follow: { siteId: number; isFollowing: boolean } | null;
};

/**
 * Which actions this note supports, derived from the payload the same way the
 * popup's actions pane does: the last body block carrying an `actions` object,
 * plus follow from a user block on non-comment notes.
 */
export function getAvailableNoteActions( note: Note ): AvailableNoteActions {
	const raw = getActions( note ) as Record< string, unknown >;
	const has = ( key: string ) => key in raw;

	let follow: AvailableNoteActions[ 'follow' ] = null;
	if ( note.type !== 'comment' ) {
		for ( const block of note.body ?? [] ) {
			const siteId = block.meta?.ids?.site;
			if ( siteId && block.actions && 'follow' in block.actions ) {
				follow = { siteId, isFollowing: !! block.actions.follow };
				break;
			}
		}
	}

	return {
		replyToComment: has( 'replyto-comment' ),
		likePost: has( 'like-post' ),
		likeComment: has( 'like-comment' ),
		approveComment: has( 'approve-comment' ),
		spamComment: has( 'spam-comment' ),
		trashComment: has( 'trash-comment' ),
		editComment: has( 'edit-comment' ),
		answerPromptHref: has( 'answer-prompt' ) ? String( raw[ 'answer-prompt' ] ) : null,
		follow,
	};
}

export function useIsNoteApproved( note: Note ): boolean {
	return useNotesSelector( ( state ) => !! getIsNoteApproved( state, note ) );
}

export function useIsNoteLiked( note: Note ): boolean {
	// getIsNoteLiked reads note.meta.ids unguarded; badge-style notes have none.
	return useNotesSelector( ( state ) => !! note.meta?.ids && !! getIsNoteLiked( state, note ) );
}

export function setApprovalStatus( note: Note, isApproved: boolean ): void {
	notesStore.dispatch(
		setApproveStatusThunk(
			note.id,
			getReferenceId( note, 'site' ),
			getReferenceId( note, 'comment' ),
			isApproved,
			note.type,
			getClient()
		)
	);
}

export function setLikeStatus( note: Note, isLiked: boolean ): void {
	notesStore.dispatch(
		setLikeStatusThunk(
			note.id,
			getReferenceId( note, 'site' ),
			getReferenceId( note, 'post' ),
			getReferenceId( note, 'comment' ),
			isLiked,
			getClient()
		)
	);
}

export type UndoableActionKind = 'spam' | 'trash';
export type PendingUndoableAction = { kind: UndoableActionKind; note: Note };

// Matches the legacy undo bar's grace period.
const UNDO_TIMEOUT_MS = 4500;

let pendingUndoable: PendingUndoableAction | null = null;
let undoTimer: number | undefined;
const undoListeners = new Set< () => void >();

function emitUndoChange() {
	undoListeners.forEach( ( listener ) => listener() );
}

function clearPendingUndoable() {
	window.clearTimeout( undoTimer );
	pendingUndoable = null;
	emitUndoChange();
}

// The spam/trash thunks route their undo-first path through
// `restClient.global.updateUndoBar`, which only the legacy panel wires up.
// Install our own bridge so those thunks work here: it holds the pending
// action for the grace period, then executes it — mirroring the legacy
// undo-list-item.
function installUndoBridge() {
	const client = getClient();
	if ( ! client || client.global?.updateUndoBar ) {
		return;
	}
	client.global = {
		updateUndoBar: ( kind: UndoableActionKind, note: Note ) => {
			// One pending action at a time, like the legacy bar.
			commitPendingUndoableAction();
			pendingUndoable = { kind, note };
			undoTimer = window.setTimeout( executePendingUndoableAction, UNDO_TIMEOUT_MS );
			emitUndoChange();
		},
		resetUndoBar: clearPendingUndoable,
	};
}

function executePendingUndoableAction() {
	if ( ! pendingUndoable ) {
		return;
	}
	const { kind, note } = pendingUndoable;
	const comment = getWpcom()
		.site( note.meta?.ids?.site )
		.comment( note.meta?.ids?.comment );

	if ( kind === 'trash' ) {
		comment.del( () => {} );
	} else {
		comment.get( ( error: Error | null, data: { status?: string } ) => {
			if ( error || ! data ) {
				return;
			}
			data.status = 'spam';
			comment.update( data, () => {} );
		} );
	}

	notesStore.dispatch( actions.notes.removeNotes( [ note.id ], true ) );
	clearPendingUndoable();
}

/**
 * Spam/trash a comment note with the legacy undo-first behavior: the note
 * hides immediately, and the destructive call only fires after the grace
 * period. Render the undo affordance from usePendingUndoableAction().
 */
export function spamNote( note: Note ): void {
	installUndoBridge();
	notesStore.dispatch( spamNoteThunk( note, false, getClient() ) );
}

export function trashNote( note: Note ): void {
	installUndoBridge();
	notesStore.dispatch( trashNoteThunk( note, false, getClient() ) );
}

export function usePendingUndoableAction(): PendingUndoableAction | null {
	return useSyncExternalStore(
		( listener ) => {
			undoListeners.add( listener );
			return () => undoListeners.delete( listener );
		},
		() => pendingUndoable
	);
}

export function getPendingUndoableAction(): PendingUndoableAction | null {
	return pendingUndoable;
}

export function undoPendingAction(): void {
	if ( ! pendingUndoable ) {
		return;
	}
	const { kind, note } = pendingUndoable;
	notesStore.dispatch( actions.ui.undoAction( note.id ) );
	bumpStat( 'notes-click-action', kind === 'spam' ? 'unspam-comment' : 'untrash-comment' );
	recordTracksEvent( `calypso_notification_note_${ kind === 'spam' ? 'unspam' : 'untrash' }`, {
		note_type: note.type,
	} );
	clearPendingUndoable();
}

/** Execute the pending spam/trash now (e.g. before navigating away). */
export function commitPendingUndoableAction(): void {
	if ( ! pendingUndoable ) {
		return;
	}
	window.clearTimeout( undoTimer );
	executePendingUndoableAction();
}

/**
 * Reply to the note's comment (or to its post when there is no comment).
 * On a comment reply the comment is pre-emptively approved and the note
 * refetched, matching the legacy reply input. Draft caching is left to the
 * caller's local state.
 */
export function replyToNote( note: Note, text: string ): Promise< void > {
	const siteId = getReferenceId( note, 'site' );
	const commentId = getReferenceId( note, 'comment' );
	const postId = getReferenceId( note, 'post' );

	return new Promise( ( resolve, reject ) => {
		let target;
		let submit;
		if ( siteId && commentId ) {
			target = getWpcom().site( siteId ).comment( commentId );
			submit = target.reply;
		} else if ( siteId && postId ) {
			target = getWpcom().site( siteId ).post( postId ).comment();
			submit = target.add;
		} else {
			reject( new Error( 'Note has no reply target' ) );
			return;
		}

		bumpStat( 'notes-click-action', 'replyto-comment' );
		recordTracksEvent( 'calypso_notification_note_reply', { note_type: note.type } );

		submit.call( target, text, ( error: Error | null ) => {
			if ( error ) {
				reject( error );
				return;
			}
			if ( commentId ) {
				notesStore.dispatch( actions.notes.approveNote( note.id, true ) );
				getClient()?.getNote( note.id );
			}
			resolve();
		} );
	} );
}

export function editCommentContent( note: Note, content: string ): Promise< void > {
	const siteId = getReferenceId( note, 'site' );
	const commentId = getReferenceId( note, 'comment' );

	return new Promise( ( resolve, reject ) => {
		if ( ! siteId || ! commentId ) {
			reject( new Error( 'Note has no comment to edit' ) );
			return;
		}
		getWpcom()
			.site( siteId )
			.comment( commentId )
			.update( { content }, ( error: Error | null ) => {
				if ( error ) {
					reject( error );
					return;
				}
				getClient()?.getNote( note.id );
				resolve();
			} );
	} );
}

/** The wp-admin/Calypso editor URL for the note's comment, when provided. */
export function getNoteEditLink( note: Note ): string | undefined {
	return getEditCommentLink( note );
}

const followStatTypes: Record< string, string > = {
	comment: 'note_commented_post',
	comment_like: 'note_liked_comment',
	like: 'note_liked_post',
	follow: 'note_followed',
	reblog: 'note_reblog_post',
};

/** Resolves with the server's resulting is_following value. */
export function setFollowStatus(
	note: Note,
	siteId: number,
	shouldFollow: boolean
): Promise< boolean > {
	return new Promise( ( resolve, reject ) => {
		const follower = getWpcom().site( siteId ).follow();
		const done = ( error: Error | null, data: { is_following?: boolean } ) => {
			if ( error ) {
				reject( error );
				return;
			}
			resolve( !! data?.is_following );
		};

		if ( shouldFollow ) {
			follower.add( done );
			bumpStat( { 'notes-click-action': 'follow', follow_source: followStatTypes[ note.type ] } );
		} else {
			follower.del( done );
			bumpStat( 'notes-click-action', 'unfollow' );
		}
	} );
}
