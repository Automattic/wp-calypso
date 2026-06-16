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

export type NoteNavigation = {
	goToPreviousNote: () => void;
	goToNextNote: () => void;
	hasPreviousNote: boolean;
	hasNextNote: boolean;
};

export function useNoteNavigation( {
	filterName,
	selectedNoteId,
	setSelectedNoteId,
}: {
	filterName: FilterName;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
} ): NoteNavigation {
	const areKeyboardShortcutsEnabled = useSelector( getKeyboardShortcutsEnabled );
	const isLoading = useSelector( getIsLoading );
	const notes = useSelector( ( state ) => ( getAllNotes( state ) || [] ) as Note[] );
	const hiddenNoteIds = useSelector( getHiddenNoteIds );
	const { client } = useAppContext();

	const filter = getFilters()[ filterName ];
	// Keep the selected note in the navigation list at its natural position even
	// if it no longer matches the active filter. Opening a note marks it read,
	// so on the "Unread" tab the selected note would otherwise drop out of the
	// list — losing its index and disabling prev/next navigation.
	const visibleNotes = notes.filter(
		( note ) =>
			hiddenNoteIds[ note.id ] !== true &&
			( filter.filter( note ) || String( note.id ) === selectedNoteId )
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

	const selectedIndex = selectedNote
		? visibleNotes.findIndex( ( note ) => note.id === selectedNote.id )
		: -1;
	const hasPreviousNote = selectedIndex > 0;
	const hasNextNote = selectedIndex >= 0 && selectedIndex < visibleNotes.length - 1;

	const goToNoteByDirection = ( direction: number ) => {
		if ( selectedIndex < 0 ) {
			return;
		}

		const newIndex = selectedIndex + direction;

		if ( newIndex >= 0 && newIndex < visibleNotes.length ) {
			setSelectedNoteId( String( visibleNotes[ newIndex ].id ) );
		}
	};

	const goToPreviousNote = () => goToNoteByDirection( -1 );
	const goToNextNote = () => goToNoteByDirection( 1 );

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
					goToNextNote();
					break;
				case 'k':
				case 'ArrowUp':
					stopEvent( event );
					goToPreviousNote();
					break;
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [ areKeyboardShortcutsEnabled, selectedNote ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return { goToPreviousNote, goToNextNote, hasPreviousNote, hasNextNote };
}
