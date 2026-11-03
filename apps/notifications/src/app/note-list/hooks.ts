import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getHiddenNoteIds from '../../panel/state/selectors/get-hidden-note-ids';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import getLastSelectedNoteId from '../../panel/state/selectors/get-last-selected-note-id';
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
			let noteToFocus: Note | undefined = undefined;

			if ( lastSelectedNoteId ) {
				const noteIndex = notes.findIndex( ( note ) => note.id === lastSelectedNoteId );
				if ( noteIndex < 0 ) {
					return;
				}

				if ( hiddenNoteIds[ notes[ noteIndex ].id ] === true ) {
					// The last selected note is no longer visible.

					// Find the nearest visible note forwards.
					for ( let i = noteIndex + 1; i < notes.length; i++ ) {
						if ( hiddenNoteIds[ notes[ i ].id ] !== true ) {
							noteToFocus = notes[ i ];
							break;
						}
					}

					if ( ! noteToFocus ) {
						// Find the nearest visible note backwards.
						for ( let i = noteIndex - 1; i >= 0; i-- ) {
							if ( hiddenNoteIds[ notes[ i ].id ] !== true ) {
								noteToFocus = notes[ i ];
								break;
							}
						}
					}
				} else {
					noteToFocus = notes[ noteIndex ];
				}
			}

			if ( noteToFocus ) {
				focusToNote( noteListRef, noteToFocus );
			}
		},

		// Run only once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
}

/**
 * Moves focus back to the closed note's row when a note closes while focus is in the detail pane.
 */
export function useNoteListFocusOnNoteClose( {
	noteListRef,
	selectedNoteId,
}: {
	noteListRef: React.RefObject< HTMLObjectElement | null >;
	selectedNoteId: string | undefined;
} ) {
	const previousNoteIdRef = useRef( selectedNoteId );

	useEffect( () => {
		const previousNoteId = previousNoteIdRef.current;
		previousNoteIdRef.current = selectedNoteId;
		if ( previousNoteId === undefined || selectedNoteId !== undefined ) {
			return;
		}

		const { activeElement } = document;
		if ( activeElement === document.body || activeElement?.closest( '.wpnc-app__detail-pane' ) ) {
			getNoteRow( noteListRef, previousNoteId )?.focus( { preventScroll: true } );
		}
	}, [ selectedNoteId, noteListRef ] );
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
