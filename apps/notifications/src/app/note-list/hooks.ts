import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getIsNoteHidden from '../../panel/state/selectors/get-is-note-hidden';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import getLastSelectedNoteId from '../../panel/state/selectors/get-last-selected-note-id';
import type { Note } from '../types';

import './style.scss';

function focusToNote( noteListRef: React.RefObject< HTMLObjectElement >, note: Note ) {
	const noteEl = noteListRef.current?.querySelector(
		`.dataviews-view-list__item[id$="-${ note.id }-item-wrapper"]`
	) as HTMLElement;

	noteEl?.focus();
}

// Set the focus in the note list to the last selected note,
// or to the nearest one when the last selected note is no longer visible.
export function useNoteListFocusToLastSelectedNote( {
	noteListRef,
	notes,
}: {
	noteListRef: React.RefObject< HTMLObjectElement >;
	notes: Note[];
} ) {
	const isNoteHidden = useSelector(
		( state ) => ( noteId: number ) => getIsNoteHidden( state, noteId )
	);

	const lastSelectedNoteId = useSelector( getLastSelectedNoteId );

	useEffect(
		() => {
			let noteToFocus: Note | undefined = undefined;

			if ( lastSelectedNoteId ) {
				const noteIndex = notes.findIndex( ( note ) => note.id === lastSelectedNoteId );
				if ( noteIndex < 0 ) {
					return;
				}

				if ( isNoteHidden( notes[ noteIndex ].id ) ) {
					// The last selected note is no longer visible.

					// Find the nearest visible note forwards.
					for ( let i = noteIndex + 1; i < notes.length; i++ ) {
						if ( ! isNoteHidden( notes[ i ].id ) ) {
							noteToFocus = notes[ i ];
							break;
						}
					}

					if ( ! noteToFocus ) {
						// Find the nearest visible note backwards.
						for ( let i = noteIndex - 1; i >= 0; i-- ) {
							if ( ! isNoteHidden( notes[ i ].id ) ) {
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

export function useNoteListNavigationKeyboardShortcuts( {
	noteListRef,
	visibleNotes,
}: {
	noteListRef: React.RefObject< HTMLObjectElement >;
	visibleNotes: Note[];
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
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [ areKeyboardShortcutsEnabled, visibleNotes ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
