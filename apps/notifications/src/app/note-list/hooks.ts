import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getHiddenNoteIds from '../../panel/state/selectors/get-hidden-note-ids';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import getLastSelectedNoteId from '../../panel/state/selectors/get-last-selected-note-id';
import type { Note } from '../types';

import './style.scss';

function getNoteRow( noteListRef: React.RefObject< HTMLObjectElement | null >, note?: Note ) {
	return noteListRef.current?.querySelector< HTMLElement >(
		`.dataviews-view-list__item[id$="-${ note?.id }-item-wrapper"]`
	);
}

function focusToNote( noteListRef: React.RefObject< HTMLObjectElement | null >, note?: Note ) {
	getNoteRow( noteListRef, note )?.focus();
}

/**
 * Returns the given note, or the nearest visible one when it has been hidden.
 */
function findNoteToFocus(
	notes: Note[],
	noteId: number,
	hiddenNoteIds: Record< number, boolean >
): Note | undefined {
	const noteIndex = notes.findIndex( ( note ) => note.id === noteId );
	if ( noteIndex < 0 ) {
		return undefined;
	}

	if ( hiddenNoteIds[ notes[ noteIndex ].id ] !== true ) {
		return notes[ noteIndex ];
	}

	// Find the nearest visible note forwards.
	for ( let i = noteIndex + 1; i < notes.length; i++ ) {
		if ( hiddenNoteIds[ notes[ i ].id ] !== true ) {
			return notes[ i ];
		}
	}

	// Find the nearest visible note backwards.
	for ( let i = noteIndex - 1; i >= 0; i-- ) {
		if ( hiddenNoteIds[ notes[ i ].id ] !== true ) {
			return notes[ i ];
		}
	}

	return undefined;
}

// Set the focus in the note list to the last selected note,
// or to the nearest one when the last selected note is no longer visible.
export function useNoteListFocusToLastSelectedNote( {
	noteListRef,
	notes,
}: {
	noteListRef: React.RefObject< HTMLObjectElement | null >;
	notes: Note[];
} ) {
	const lastSelectedNoteId = useSelector( getLastSelectedNoteId );
	const hiddenNoteIds = useSelector( ( state ) => getHiddenNoteIds( state ) );

	useEffect(
		() => {
			if ( lastSelectedNoteId ) {
				focusToNote( noteListRef, findNoteToFocus( notes, lastSelectedNoteId, hiddenNoteIds ) );
			}
		},

		// Run only once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
}

/**
 * Moves focus back to the closed note's row, the nearest visible one, or the first row
 * when a note closes while focus is in the detail pane.
 */
export function useNoteListFocusOnNoteClose( {
	noteListRef,
	notes,
	selectedNoteId,
}: {
	noteListRef: React.RefObject< HTMLObjectElement | null >;
	notes: Note[];
	selectedNoteId: string | undefined;
} ) {
	const hiddenNoteIds = useSelector( ( state ) => getHiddenNoteIds( state ) );
	const previousNoteIdRef = useRef( selectedNoteId );

	useEffect( () => {
		const previousNoteId = previousNoteIdRef.current;
		previousNoteIdRef.current = selectedNoteId;
		if ( previousNoteId === undefined || selectedNoteId !== undefined ) {
			return;
		}

		const { activeElement } = document;
		const shouldRestoreFocus =
			activeElement === document.body || !! activeElement?.closest( '.wpnc-app__detail-pane' );
		if ( ! shouldRestoreFocus ) {
			return;
		}

		const noteToFocus = findNoteToFocus( notes, Number( previousNoteId ), hiddenNoteIds );
		const rowToFocus =
			getNoteRow( noteListRef, noteToFocus ) ??
			noteListRef.current?.querySelector< HTMLElement >( '.dataviews-view-list__item' );
		rowToFocus?.focus( { preventScroll: true } );
	}, [ selectedNoteId, notes, hiddenNoteIds, noteListRef ] );
}

export function useNoteListNavigationKeyboardShortcuts( {
	noteListRef,
	visibleNotes,
	selectedNoteId,
	setSelectedNoteId,
}: {
	noteListRef: React.RefObject< HTMLObjectElement | null >;
	visibleNotes: Note[];
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
} ) {
	const areKeyboardShortcutsEnabled = useSelector( getKeyboardShortcutsEnabled );

	useEffect( () => {
		const stopEvent = ( event: KeyboardEvent ) => {
			event.stopPropagation();
			event.preventDefault();
		};

		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( ! areKeyboardShortcutsEnabled ) {
				return;
			}
			if ( modifierKeyIsActive( event ) ) {
				return;
			}

			if ( event.key === 'ArrowDown' ) {
				const hasFocus = noteListRef.current?.contains( document.activeElement );
				if ( ! hasFocus ) {
					stopEvent( event );
					focusToNote( noteListRef, visibleNotes[ 0 ] );
				}
			}

			if ( event.key === 'ArrowLeft' && selectedNoteId === undefined ) {
				const focusedNote = visibleNotes.find(
					( note ) => getNoteRow( noteListRef, note ) === document.activeElement
				);
				if ( focusedNote ) {
					stopEvent( event );
					setSelectedNoteId( String( focusedNote.id ) );
				}
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [ areKeyboardShortcutsEnabled, visibleNotes, selectedNoteId ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
