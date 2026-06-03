import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getHiddenNoteIds from '../../panel/state/selectors/get-hidden-note-ids';
import getIsLoading from '../../panel/state/selectors/get-is-loading';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { getFilters } from '../../panel/templates/filters';
import { useAppContext } from '../context';
import type { FilterName, Note } from '../types';

export function useNoteNavigationViaKeyboardShortcuts( {
	filterName,
	selectedNoteId,
	setSelectedNoteId,
}: {
	filterName: FilterName;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
} ) {
	const areKeyboardShortcutsEnabled = useSelector( getKeyboardShortcutsEnabled );
	const isLoading = useSelector( getIsLoading );
	const notes = useSelector( ( state ) => ( getAllNotes( state ) || [] ) as Note[] );
	const hiddenNoteIds = useSelector( getHiddenNoteIds );
	const { client } = useAppContext();

	const filter = getFilters()[ filterName ];
	const visibleNotes = notes.filter(
		( note ) => filter.filter( note ) && hiddenNoteIds[ note.id ] !== true
	);
	const selectedNote =
		selectedNoteId !== undefined
			? notes.find( ( note ) => String( note.id ) === selectedNoteId )
			: undefined;

	useEffect( () => {
		if (
			! isLoading &&
			visibleNotes.length &&
			visibleNotes[ visibleNotes.length - 1 ].id === selectedNote?.id
		) {
			client?.loadMore();
		}
	}, [ isLoading, visibleNotes, selectedNote, client ] );

	const goToNoteByDirection = ( direction: number ) => {
		if ( ! selectedNote ) {
			return;
		}

		const noteIndex = visibleNotes.findIndex( ( note ) => note.id === selectedNote.id );
		const newIndex = noteIndex + direction;

		if ( newIndex >= 0 && newIndex < visibleNotes.length ) {
			setSelectedNoteId( String( visibleNotes[ newIndex ].id ) );
		}
	};

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
			switch ( event.key ) {
				case 'j':
				case 'ArrowDown':
					stopEvent( event );
					goToNoteByDirection( 1 );
					break;
				case 'k':
				case 'ArrowUp':
					stopEvent( event );
					goToNoteByDirection( -1 );
					break;
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [ areKeyboardShortcutsEnabled, selectedNote ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
