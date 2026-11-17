import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getHiddenNoteIds from '../../panel/state/selectors/get-hidden-note-ids';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import type { Note } from '../types';

import './style.scss';

function getNoteRow(
	noteListRef: React.RefObject< HTMLObjectElement | null >,
	noteId?: Note[ 'id' ] | string
) {
	return noteListRef.current?.querySelector< HTMLElement >(
		`.dataviews-view-list__item[id$="-${ noteId }-item-wrapper"]`
	);
}

function focusToNote( noteListRef: React.RefObject< HTMLObjectElement | null >, note?: Note ) {
	getNoteRow( noteListRef, note?.id )?.focus();
}

/**
 * Returns the given note, or the nearest visible one when it has been hidden.
 */
function findNoteToFocus(
	notes: Note[],
	noteId: Note[ 'id' ],
	hiddenNoteIds: Record< Note[ 'id' ], boolean >
): Note | undefined {
	const noteIndex = notes.findIndex( ( note ) => note.id === noteId );
	if ( noteIndex < 0 ) {
		return undefined;
	}

	if ( hiddenNoteIds[ noteId ] !== true ) {
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

/**
 * Moves focus back to the closed note's row, or the nearest visible one if it was hidden,
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
	const hiddenNoteIds = useSelector( getHiddenNoteIds );
	const previousNoteIdRef = useRef( selectedNoteId );

	useEffect( () => {
		const previousNoteId = previousNoteIdRef.current;
		previousNoteIdRef.current = selectedNoteId;
		if ( previousNoteId === undefined || selectedNoteId !== undefined ) {
			return;
		}

		const { activeElement } = document;
		if ( activeElement === document.body || activeElement?.closest( '.wpnc-app__detail-pane' ) ) {
			const closedNoteId = Number( previousNoteId );
			const noteIdToFocus = hiddenNoteIds[ closedNoteId ]
				? findNoteToFocus( notes, closedNoteId, hiddenNoteIds )?.id
				: closedNoteId;
			getNoteRow( noteListRef, noteIdToFocus )?.focus( { preventScroll: true } );
		}
	}, [ selectedNoteId, noteListRef, notes, hiddenNoteIds ] );
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
					( note ) => getNoteRow( noteListRef, note.id ) === document.activeElement
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
